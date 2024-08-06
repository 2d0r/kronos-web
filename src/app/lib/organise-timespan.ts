'use server';

import prisma from './db';
import { addMinutesToDate, calcRepeatIntervalInMinutes, minutesBetweenDates, getStartAndEndOfDay } from '../utils/dateUtils';
import { fetchEvents, getTasksByIds, getTasksToSchedule } from './data';
import { deleteEventsById, deleteFlexEventsInTimespan } from './actions';
import { DEFAULT_TIMES_OF_DAY, eventsToSchedule,TaskWithRelations } from './definitions';
import { 
    BasicEvent, 
    checkGapIsFree, 
    dayXHourInterval, 
    filterSortTasksToSchedule,
    findGapsInTimespan, 
    findGapsThatStartInTimespan, 
    idealRepsXIdealDays, 
    impreciseRepsXIdealDays, 
    intersectTimespans,
    timespanToDatesArray,
    scheduleEventAndReturnOrganiserParams,
    updateOrganisedTimespans,
} from '../utils/organiser-utils';


/**
 * Organiser by ideal time first:
 *  1. Loop through tasks by user-set priority, then by timeScore (later: by mindset maps)
 *  2. Schedule tasks in their ideal times, based on user input
 *  3. If there is no ideal gap left, find secondary ideal times (to serve fewer of the preferences)
 *  4. If there is no secondary gap left, find the nearest gap (later: that matches the mindset map)
 *  5. If not, schedule as soon as possible
 *  6. If there is no time left, throw an alert; Recommend events to replace - by inverse priority
 *      - Save the best events to replace while searching for gaps
 */
interface OrganiseTimespanProps {
    timespan: [Date, Date], 
    displaceableEventIds?: string[], 
    displaceAllFlexEvents?: boolean,
    eventsToSchedule?: eventsToSchedule,
};

export async function organiseTimespan({
    timespan, 
    displaceableEventIds = [], 
    displaceAllFlexEvents = true,
    eventsToSchedule = [],
} : OrganiseTimespanProps ) {
    console.log('timespan', timespan);
    const timespanInMinutes = minutesBetweenDates(timespan[0], timespan[1]);
    const events = await fetchEvents(); // To do: only fetch events in timespanToOrganise


    // DELETE EXISTING FLEXIBLE EVENTS IN TIMESPAN
    if (displaceableEventIds?.length) {
        await deleteEventsById(displaceableEventIds);
    } else if (displaceAllFlexEvents) {
        await deleteFlexEventsInTimespan(timespan);
    }


    // FILTER AND SORT TASKS TO SCHEDULE
    let tasksToSchedule;
    if (eventsToSchedule.length) {
        const taskIds = eventsToSchedule.map(event => event.taskId);
        tasksToSchedule = await getTasksByIds(taskIds) || {} as TaskWithRelations[];
    } else {
        tasksToSchedule = await getTasksToSchedule() || {} as TaskWithRelations[];
    }
    tasksToSchedule = filterSortTasksToSchedule(tasksToSchedule, timespan);
    // console.log('sorted tasks', tasksToSchedule.map(task => [task.name, task.priority, task.timeScore])); // ✅

    // COUNT EVENTS THAT NEED SCHEDULING
    let eventsToScheduleDict: {[key: string]: number} = {};
    if (eventsToSchedule.length) {
        // Use given events
        eventsToSchedule.forEach(event => {
            eventsToScheduleDict[event.taskId] = event.count;
        })
    } else {
        // Add one-time events first
        tasksToSchedule.filter(task => task.repeat === false).forEach(task => {
            eventsToScheduleDict[task.id] = 1;
        });
        // For repeating tasks, estimate number of sessions that fit in the given timespan
        tasksToSchedule.filter(task => task.repeat === true).forEach((task, idx) => {
            if ( task.repeatUnit === 'sessions' && task.repeatFrequency && task.repeatTimespanMultiplier && task.repeatTimespan ) {
                const taskRepeatIntervalInMinutes = calcRepeatIntervalInMinutes(task);
                
                // Find where we are between the task's sessions, by dividing the time before its first event by its repeatTimespan
                const eventsBeforeTimespan = events.filter(event => (event.taskId === task.id && event.startTime < timespan[0]));
                let frequencyPhase = 0;
                if ( eventsBeforeTimespan.length ) {
                    const firstEventStart = eventsBeforeTimespan
                        .reduce((min, event) => min.startTime < event.startTime ? min : event).startTime;
                    frequencyPhase = minutesBetweenDates(firstEventStart, firstEventStart) % taskRepeatIntervalInMinutes;
                    console.log('firstEventStart', firstEventStart);
                }
                
                // Substract frequency phase from timespan, to accurately estimate how many sessions fit in this timespan
                const taskSessionsToSchedule = Math.round((timespanInMinutes - frequencyPhase) / taskRepeatIntervalInMinutes);
                // console.log('taskSessionsToSchedule', taskSessionsToSchedule); // ✅
                eventsToScheduleDict[task.id] = taskSessionsToSchedule;
            } else {
                return {
                    message: 'Error: task is missing repetition data.'
                }
            }
        });
    }
    // console.log('eventsToScheduleDict:', eventsToScheduleDict); // ✅


    // FIND CURRENT EVENTS IN THE TIMESPAN
    const eventsInTimespan = await prisma.event.findMany({
        where: {
            OR: [{
                startTime: {
                    gte: timespan[0], 
                    lte: timespan[1],
                },
            }, {
                endTime: {
                    gte: timespan[0]
                }
            }]
        },
        orderBy: {
            startTime: 'asc',
        }
    });
    // Find first event after timespan (to schedule events that start in but continue after timespan)

    // console.log('eventsInTimespan', eventsInTimespan.map(event => [event.startTime, event.endTime]));
    let newEventsInTimespan: BasicEvent[] = eventsInTimespan as BasicEvent[];


    // LOOP THROUGH TASKS
    tasksToSchedule.forEach(task => {

        // FILTER THE DAYS TO SCHEDULE IN
        let idealDays: Date[] = timespanToDatesArray(timespan);
        // Intersect with preferred days of week
        // if (task.preferredDayOfWeek.length > 0) {
        //     idealDays = findMatchingDaysOfWeekInTimespan(task.preferredDayOfWeek, timespan);
        // }
        // Intersect with repetition days (for tasks )
        if (task.repeat && task.repeatTimespan && task.repeatTimespan !== 'hour' && task.firstSessionStartTime) {
            idealDays = idealRepsXIdealDays(task, idealDays, timespan);
        }
        // console.log(task.name, '> idealDays:', idealDays); // ✅

        let scheduled = false;

        // Save first rep of a new task
        let repeatingTaskOrganiserPhase: ('firstRep' | 'idealReps' | 'impreciseReps' | null) = task.repeat ? task.firstSessionStartTime ? 'idealReps' : 'firstRep': null;
        let firstRepStart: Date = new Date();
        let idealDaysBackup = idealDays;


        // GO THROUGH NUMBER OF EVENTS LEFT TO SCHEDULE
        // for (let x = 1; x <= eventsToScheduleDict[task.id]; x++) {
        while (eventsToScheduleDict[task.id] > 0) {
            // Find the most specific ideal time, schedule it if there is room, find the next most specific if not

            scheduled = false; // break variable
            console.log(task.name, '> firstRepStart', firstRepStart);

            // Update ideal days if firstRep has been scheduled 🔁
            if (repeatingTaskOrganiserPhase === 'firstRep') {
                // Force first rep to be scheduled within its rep interval, from the start of the timespan
                const repeatIntervalInDays = Math.round(calcRepeatIntervalInMinutes(task) / 60 / 24);
                idealDays = idealDays.slice(0, repeatIntervalInDays);
                if (!idealDays.length) idealDays = idealDaysBackup;
            } else if (repeatingTaskOrganiserPhase === 'idealReps') {
                idealDays = idealRepsXIdealDays(task, idealDaysBackup, timespan, new Date(firstRepStart));
                if (!idealDays.length) idealDays = idealDaysBackup;
            } else if (repeatingTaskOrganiserPhase === 'impreciseReps') {
                idealDays = impreciseRepsXIdealDays(task, idealDaysBackup, timespan, new Date(firstRepStart));
                if (!idealDays.length) idealDays = idealDaysBackup;
            }
            // Sort idealDays in order
            idealDays = idealDays.sort((a, b) => a.getTime() - b.getTime());
            console.log(task.name, '> repeatPhase', repeatingTaskOrganiserPhase);
            console.log(task.name, '> idealDays:', idealDays);


            // SCHEDULE BY IDEAL START
            if ((task.idealStart && !task.fixed) || repeatingTaskOrganiserPhase === 'idealReps') {
                const [ hours, minutes ] = task.idealStart ? [ task.idealStart.split(':')[0], task.idealStart.split(':')[1] ]
                    : [firstRepStart.getHours(), firstRepStart.getMinutes()]; // 🔁
                console.log(task.name, '> scheduling by idealStart >', hours, ':', minutes);  
                // Loop through idealDays - check each for gap at idealTime
                for (let i = 0; i < idealDays.length; i++) {
                    const idealTime = new Date(new Date(idealDays[i]).setHours(Number(hours), Number(minutes)));
                    console.log(task.name, '> idealTime:', idealTime);
                    if (idealTime < timespan[0] || timespan[1] < idealTime) {
                        console.error(task.name, '> idealTime not in timespan'); // Not the issue
                        continue;
                    }
                    const [ eventStart, eventEnd ] = [ idealTime, addMinutesToDate(idealTime, task.duration) ];
                    const gapIsFree = checkGapIsFree(eventsInTimespan, eventStart, eventEnd);
                    // Schedule if there is a gap
                    if (gapIsFree === true) {
                        console.log(task.name, '> found gap >', eventStart);
                        [newEventsInTimespan, eventsToScheduleDict, repeatingTaskOrganiserPhase, firstRepStart] 
                            = scheduleEventAndReturnOrganiserParams(eventStart, task, newEventsInTimespan, eventsToScheduleDict, repeatingTaskOrganiserPhase, firstRepStart);
                        scheduled = true;
                        break;
                    }
                    if (scheduled) break;
                }
                // To do: schedule near ideal time (± 1-2 hrs)
            }


            // SCHEDULE BY HOURLY REPEAT (disabled)
            // else if (task.repeat && task.repeatTimespan === 'hour') {
            // }
            // if (eventsToScheduleDict[task.id] === 0) break;


            // SCHEDULE BY PREF TIME OF DAY
            if (task.preferredTimeOfDay.length > 0 && !scheduled) {
                console.log(task.name, '> scheduling by prefTimeOfDay');
                // Loop through idealDays x preferredTimesOfDay
                for (let i = 0; i < idealDays.length; i++) {
                    for (let j = 0; j < task.preferredTimeOfDay.length; j++) {
                        const [ startOfTimeOfDay, endOfTimeOfDay ] = DEFAULT_TIMES_OF_DAY[task.preferredTimeOfDay[j]];
                        let idealTimespan = dayXHourInterval(idealDays[i], [ startOfTimeOfDay, endOfTimeOfDay ]);
                        console.log(task.name, '> idealTimespan', idealTimespan);

                        // Get intersection with main timespan; Break if there is none
                        const timespanIntersection = intersectTimespans(timespan, idealTimespan);
                        if (!timespanIntersection) continue;
                        idealTimespan = timespanIntersection;
                        console.log(task.name, '> idealTimespan after X', idealTimespan);

                        // Find gaps and attempt to schedule
                        let gapsInTimespan = findGapsInTimespan(idealTimespan, newEventsInTimespan, task.duration);
                        if (gapsInTimespan.length === 0) {
                            // Find gaps that only start in timespan (not fit)
                            // To do: move this further down in specificity ?
                            gapsInTimespan = findGapsThatStartInTimespan(idealTimespan, newEventsInTimespan, task.duration);
                        }
                        console.log(task.name, '> gapsInTimespan', gapsInTimespan);

                        for (let k = 0; k < gapsInTimespan.length; k++) {
                            [newEventsInTimespan, eventsToScheduleDict, repeatingTaskOrganiserPhase, firstRepStart] 
                                = scheduleEventAndReturnOrganiserParams(gapsInTimespan[k][0], task, newEventsInTimespan, eventsToScheduleDict, repeatingTaskOrganiserPhase, firstRepStart);
                            scheduled = true;
                            break;
                        }
                        if (scheduled) break;
                    }
                    if (scheduled) break;
                }
            }


            // SCHEDULE BY PREF DAY OF THE WEEK
            if (task.preferredDayOfWeek.length > 0 && !scheduled) {
                console.log(task.name, '> scheduling by prefDayOfWeek');
                // idealDays are already filtered by preferredDaysOfWeek
                for (let i = 0; i < idealDays.length; i++) {
                    const gapsInTimespan = findGapsInTimespan(getStartAndEndOfDay(idealDays[i]), newEventsInTimespan, task.duration);
                    console.log(task.name, '> gapsInTimespan:', gapsInTimespan);
                    // Attempt to schedule
                    for (let j = 0; j < gapsInTimespan.length; j++) {
                        [newEventsInTimespan, eventsToScheduleDict, repeatingTaskOrganiserPhase, firstRepStart] = scheduleEventAndReturnOrganiserParams(
                            gapsInTimespan[j][0], task, newEventsInTimespan, eventsToScheduleDict, repeatingTaskOrganiserPhase, firstRepStart
                        );
                        scheduled = true;
                        break;
                    }
                    if (scheduled) break;
                }
            }


            // SCHEDULE BY REPEAT (DAILY OR LESS OFTEN)
            // else if (task.repeat && task.repeatTimespan !== 'hour') {
            //     console.log(task.name, '> scheduling by repeat');
            //     // idealDays already filtered by repeat daily or less
            //     for (let i = 0; i < idealDays.length; i++) {
            //         const gapsInTimespan = findGapsThatStartInTimespan(getStartAndEndOfDay(idealDays[i]), newEventsInTimespan, task.duration);
            //         console.log(task.name, '> gapsInTimespan:', gapsInTimespan);
            //         // Attempt to schedule
            //         for (let j = 0; j < gapsInTimespan.length; j++) {
            //             if (!intersectTimespans(gapsInTimespan[j], timespan)) break;
            //             [ newEventsInTimespan, eventsToScheduleDict, repeatingTaskOrganiserPhase, firstRepStart ] = organiseEvent(
            //                 gapsInTimespan[j][0], task, newEventsInTimespan, eventsToScheduleDict, repeatingTaskOrganiserPhase, firstRepStart
            //             );
            //             scheduled = true;
            //             break;
            //         }
            //         if (scheduled) break;
            //     }
            // }


            // SCHEDULE BY MINDSET MAP
            /**
             * const gapsForMindset = findGapsForMindset(mindset, timespan);
             */


            // SCHEDULE ASAP
            if (!scheduled) {
                console.log(task.name, '> scheduling asap');
                const gapsInTimespan = findGapsInTimespan(timespan, newEventsInTimespan, task.duration);
                console.log(task.name, '> gapsInTimespan:', gapsInTimespan);
                for (let i = 0; i < gapsInTimespan.length; i++) {
                    // scheduleEventForTask(task, gapsInTimespan[i][0]);
                    // eventsToScheduleDict[task.id] -= 1;
                    // newEventsInTimespan.push({
                    //     startTime: gapsInTimespan[i][0],
                    //     endTime: addMinutesToDate(gapsInTimespan[i][0], task.duration),
                    // });
                    [newEventsInTimespan, eventsToScheduleDict, repeatingTaskOrganiserPhase, firstRepStart] = scheduleEventAndReturnOrganiserParams(
                        gapsInTimespan[i][0], task, newEventsInTimespan, eventsToScheduleDict, repeatingTaskOrganiserPhase, firstRepStart, false
                    );
                    scheduled = true;
                    break;
                }
            }


            // HANDLE FAILURE TO SCHEDULE
            // If we failed to schedule a repeating task, give it another 2 chances
            if (!scheduled) {
                if (task.repeat) {
                    if (repeatingTaskOrganiserPhase = 'firstRep') {
                        // x--;
                        repeatingTaskOrganiserPhase = 'idealReps';
                    } else if (repeatingTaskOrganiserPhase = 'idealReps') {
                        // x--;
                        repeatingTaskOrganiserPhase = 'impreciseReps';
                    } else {
                        console.log(task.name, '> failed to schedule >', eventsToScheduleDict[task.id]);
                        eventsToScheduleDict[task.id] -= 1;
                    }
                    continue;
                }
                console.log(task.name, '> failed to schedule >', eventsToScheduleDict[task.id]);
                eventsToScheduleDict[task.id] -= 1;
            }

            // console.log('timeGaps:', timeGaps); // ✅
            // TO DO: Create a table of gaps, that are updated at each organise
            
        }
    });

    updateOrganisedTimespans(timespan);
}
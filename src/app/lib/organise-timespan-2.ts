'use server';

import prisma from './db';
import { addMinutesToDate, calcRepeatIntervalInMinutes, minutesBetweenDates, getStartAndEndOfDay } from '../utils/dateUtils';
import { fetchEvents } from './data';
import { scheduleEventForTask } from './actions';
import { DEFAULT_TIMES_OF_DAY, PRIORITY_ORDER } from './definitions';
import { 
    BasicEvent, 
    checkGapIsFree, 
    dayXHourInterval, 
    findGapsInTimespan, 
    findGapsThatStartInTimespan, 
    findMatchingDaysOfWeekInTimespan, 
    idealRepsXIdealDays, 
    intersectTimespans, 
    timespanToDatesArray 
} from '../utils/organiser-utils';

/**
 * Organiser by ideal time first:
 *  1. Loop through tasks by user-set priority, then by 
 *  2. Schedule tasks in their ideal times, based on user input
 *  3. If there is no ideal gap left, find secondary ideal times (to serve fewer of the preferences)
 *  4. If there is no secondary gap left, find the nearest gap the follows the mindset map
 *  5. If there are no mindset gaps, schedule as soon as possible
 *  6. If there is no time left, throw an alert; Recommend events to replace - by inverse priority
 *      - Save the best events to replace while searching for gaps
 */

export async function organiseTimespanByIdealTime(timespan: [Date, Date]) {
    const timespanInMinutes = minutesBetweenDates(timespan[0], timespan[1]);
    const events = await fetchEvents();


    // FILTER TASKS TO SCHEDULE

    let tasksToSchedule = await prisma.task.findMany({
        where: {
            status: { not: 'done' },
            fixed: { not: true },
            AND: [{
                type: { not: 'goal' }
            }, {
                type: { not: 'project' }
            }],
        },
    });
    tasksToSchedule = tasksToSchedule
        .filter(el => el.totalRepetitions ? el.totalRepetitions > el.repetitionsDone : true) // filter out tasks that have finished their repetitions
        // .filter(el => (el.totalDuration && el.durationDone) && el.totalDuration > el.durationDone) // filter out tasks which ran out of totalDuration
        .filter(el => (el.deadline && el.deadline > timespan[0]) || !el.deadline); // filter out tasks for which the deadline has passed
    // console.log('filtered tasks', tasksToSchedule);


    // SORT TASKS TO SCHEDULE

    tasksToSchedule.sort((b, a) => (
        PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || a.timeScore - b.timeScore
    ));
    // console.log('sorted tasks', tasksToSchedule.map(task => [task.name, task.priority, task.timeScore])); // ✅


    // COUNT EVENTS THAT NEED SCHEDULING

    let eventsToScheduleDict : {[key: string]: number} = {};
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
        if (task.preferredDayOfWeek.length > 0) {
            idealDays = findMatchingDaysOfWeekInTimespan(task.preferredDayOfWeek, timespan);
        }
        // Intersect with repetition days
        if (task.repeat && task.repeatTimespan && task.repeatTimespan !== 'hour' && task.firstSessionStartTime) {
            idealDays = idealRepsXIdealDays(task, idealDays, timespan);
        }
        // console.log(task.name, '> timespan:', timespan, '> idealDays:', idealDays); // ✅


        for (let x = 1; x <= eventsToScheduleDict[task.id]; x++) {
            // Find the most specific ideal time, schedule it if there is room, find the next most specific if not

            
            // SCHEDULE BY IDEAL START
            if (task.idealStart && !task.fixed) {
                const [ hours, minutes ] = [ task.idealStart.split(':')[0], task.idealStart.split(':')[1] ];
                // Attempt to schedule
                for (let i = 0; i < idealDays.length; i++) {
                    const idealTime = new Date(new Date(idealDays[i]).setHours(Number(hours), Number(minutes)));
                    if (idealTime < timespan[0] || timespan[1] < idealTime) {
                        break;
                    }
                    const [ eventStart, eventEnd ] = [ idealTime, addMinutesToDate(idealTime, task.duration) ];
                    const gapIsFree = checkGapIsFree(eventsInTimespan, eventStart, eventEnd);
                    if (gapIsFree === true) {
                        const localTime = `${eventStart.getHours()}:${eventStart.getMinutes()}`;
                        scheduleEventForTask(task, eventStart, task.duration, localTime);
                        eventsToScheduleDict[task.id] -= 1;
                        newEventsInTimespan.push({
                            startTime: eventStart,
                            endTime: eventEnd,
                        });
                        break;
                    }
                }
                // To do: schedule near ideal time (± 1-2 hrs)
            }


            // SCHEDULE BY HOURLY REPEAT (disabled)

            // else if (task.repeat && task.repeatTimespan === 'hour') {
            // }
            // if (eventsToScheduleDict[task.id] === 0) break;


            // SCHEDULE BY PREF TIME OF DAY
            else if (task.preferredTimeOfDay.length > 0) {
                console.log(task.name, '> scheduling by prefTimeOfDay');
                // Loop through idealDays x preferredTimesOfDay
                for (let i = 0; i < idealDays.length; i++) {
                    for (let j = 0; j < task.preferredTimeOfDay.length; j++) {
                        const [ startOfTimeOfDay, endOfTimeOfDay ] = DEFAULT_TIMES_OF_DAY[task.preferredTimeOfDay[j]];
                        let idealTimespan = dayXHourInterval(idealDays[i], [ startOfTimeOfDay, endOfTimeOfDay ]);
                        console.log(task.name, '> idealTimespan', idealTimespan);
                        // Get intersection with main timespan; Break if there is none
                        const timespanIntersection = intersectTimespans(timespan, idealTimespan);
                        if (!timespanIntersection) break;
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
                            const localTime = `${ gapsInTimespan[k][0].getHours() }:${ gapsInTimespan[k][0].getMinutes() }`;
                            // console.log(task.name, '> localTime >', localTime);
                            scheduleEventForTask(task, gapsInTimespan[k][0], task.duration, localTime);
                            // console.log(task.name, '> startTime >', toZonedTime(gapsInTimespan[j][0], DEFAULT_TIME_ZONE));
                            eventsToScheduleDict[task.id] -= 1;
                            newEventsInTimespan.push({
                                startTime: gapsInTimespan[k][0],
                                endTime: addMinutesToDate(gapsInTimespan[k][0], task.duration),
                            });
                            break;
                        }
                        if (eventsToScheduleDict[task.id] === 0) break;
                    }
                    if (eventsToScheduleDict[task.id] === 0) break;
                }
            }


            // SCHEDULE BY PREF DAY OF THE WEEK
            else if (task.preferredDayOfWeek.length > 0) {
                console.log(task.name, '> scheduling by prefDayOfWeek');
                // idealDays are already filtered by preferredDaysOfWeek
                for (let i = 0; i < idealDays.length; i++) {
                    const gapsInTimespan = findGapsInTimespan(getStartAndEndOfDay(idealDays[i]), newEventsInTimespan, task.duration);
                    console.log(task.name, '> gapsInTimespan:', gapsInTimespan);
                    // Attempt to schedule
                    for (let j = 0; j < gapsInTimespan.length; j++) {
                        const localTime = `${ gapsInTimespan[j][0].getUTCHours() }:${ gapsInTimespan[j][0].getMinutes() }`;
                        // console.log(task.name, '> localTime >', localTime);
                        scheduleEventForTask(task, gapsInTimespan[j][0], task.duration, localTime);
                        // console.log(task.name, '> startTime >', toZonedTime(gapsInTimespan[j][0], DEFAULT_TIME_ZONE));
                        eventsToScheduleDict[task.id] -= 1;
                        newEventsInTimespan.push({
                            startTime: gapsInTimespan[j][0],
                            endTime: addMinutesToDate(gapsInTimespan[j][0], task.duration),
                        });
                        break;
                    }
                    if (eventsToScheduleDict[task.id] === 0) break;
                }
            }


            // SCHEDULE BY REPEAT (DAILY OR LESS OFTEN)
            else if (task.repeat && task.repeatTimespan !== 'hour') {
                console.log(task.name, '> scheduling by repeat');
                // idealDays already filtered by repeat daily or less
                for (let i = 0; i < idealDays.length; i++) {
                    const gapsInTimespan = findGapsThatStartInTimespan(getStartAndEndOfDay(idealDays[i]), newEventsInTimespan, task.duration);
                    console.log(task.name, '> gapsInTimespan:', gapsInTimespan);
                    // Attempt to schedule
                    for (let j = 0; j < gapsInTimespan.length; j++) {
                        if (!intersectTimespans(gapsInTimespan[j], timespan)) break;
                        const localTime = `${ gapsInTimespan[j][0].getUTCHours() }:${ gapsInTimespan[j][0].getMinutes() }`;
                        scheduleEventForTask(task, gapsInTimespan[j][0], task.duration, localTime);
                        eventsToScheduleDict[task.id] -= 1;
                        newEventsInTimespan.push({
                            startTime: gapsInTimespan[j][0],
                            endTime: addMinutesToDate(gapsInTimespan[j][0], task.duration),
                        });
                        break;
                    }
                    if (eventsToScheduleDict[task.id] === 0) break;
                }
            }


            // SCHEDULE BY MINDSET MAP
            /**
             * const gapsForMindset = findGapsForMindset(mindset, timespan);
             */


            // SCHEDULE ASAP
            else {
                console.log(task.name, '> scheduling asap');
                const gapsInTimespan = findGapsInTimespan(timespan, newEventsInTimespan, task.duration);
                console.log(task.name, '> gapsInTimespan:', gapsInTimespan);
                for (let i = 0; i < gapsInTimespan.length; i++) {
                    scheduleEventForTask(task, gapsInTimespan[i][0]);
                    eventsToScheduleDict[task.id] -= 1;
                    newEventsInTimespan.push({
                        startTime: gapsInTimespan[i][0],
                        endTime: addMinutesToDate(gapsInTimespan[i][0], task.duration),
                    });
                    break;
                }
            }
            
            // console.log('timeGaps:', timeGaps); // ✅
            // TO DO: Create a table of gaps, that are updated at each organise
            
        }
    });
}


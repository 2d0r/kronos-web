'use server';

import prisma from './db';
import { 
    addMinutesToDate, 
    calcRepeatIntervalInMinutes, 
    hourRangeXDate, 
    hourRangesXDates, 
    minutesBetweenDates, 
    updateTimeGaps
} from '../utils/dateUtils';
import { fetchEvents } from './data';
import { TimeOfDay } from '@prisma/client';
import { scheduleEventForTask } from './actions';
import { DEFAULT_TIMES_OF_DAY, priorityList } from './definitions';
import { sortByCustomOrder } from '../utils/taskUtils';
import { findMatchingDaysOfWeekInTimespan, getIdealReps, idealRepsXTimespan, idealTimesOfDayXIdealReps } from '../utils/organiser-utils';

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
            NOT: {
                status: 'done',
                fixed: true
            }, 
        }, 
        orderBy: {
            timeScore: 'desc'
        }
    });
    tasksToSchedule = tasksToSchedule
        .filter(el => el.totalRepetitions ? el.totalRepetitions > el.repetitionsDone : true) // filter out tasks that have finished their repetitions
        // .filter(el => (el.totalDuration && el.durationDone) && el.totalDuration > el.durationDone) // filter out tasks which ran out of totalDuration
        .filter(el => (el.deadline && el.deadline > timespan[0]) || !el.deadline); // filter out tasks whose deadline has passed
    // console.log('tasksToSchedule', tasksToSchedule);

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


    // FIND TIME GAPS IN TIMESPAN
    // Get fixed events in the timespan
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
    // console.log('eventsInTimespan', eventsInTimespan);
    // console.log('tasksToSchedule', tasksToSchedule);


    // FIND TIME GAPS in timespan
    // TO DO: Create a table of gaps, that are updated at each organise
    const eventTimes = eventsInTimespan.map(event => [event.startTime, event.endTime]);
    console.log('eventTimes', eventTimes);
    let timeGaps : [Date, Date][] = [];
    // If there are no events, set timespan as the only timeGap
    if(!eventTimes.length) {
        timeGaps.push([timespan[0], timespan[1]]);
    } else {
        for ( let idx = 0; idx < eventTimes.length; idx++) {
            const eventStartEnd = eventTimes[idx];
            if ( idx === 0 ) {
                if (minutesBetweenDates(timespan[0], eventStartEnd[0]) > 0 ) {
                    timeGaps.push([timespan[0], eventStartEnd[0]]);
                }
            } else if (minutesBetweenDates(eventTimes[idx - 1][1], eventTimes[idx][0]) > 0) {
                timeGaps.push([eventTimes[idx - 1][1], eventTimes[idx][0]]);
            }
        }
        timeGaps = timeGaps.sort((a, b) => (
            a[0].getTime() - b[0].getTime()
        ));
    }
    // console.log('timeGaps:', timeGaps); // ✅


    // LOOP THROUGH TASKS

    // Sort tasks by priority, then by time score
    let tasksToScheduleSorted = sortByCustomOrder(tasksToSchedule, 'priority', priorityList)
        .sort((a, b) => (a.timeScore - b.timeScore));

    // Loop through sorted tasks
    tasksToScheduleSorted.forEach((task, idx) => {
        if (eventsToScheduleDict[task.id] > 0) {

            // Place the task in its ideal spot (time of day, day of week)
            let idealDays: Date[] = [];
            let idealTimes: [Date, Date][] = [];

            
            // GET IDEAL DATES - if we have prefDays or repeating task
            // Day of the week -> find the nearest days in the timespan
            let prefDates: Date[] = [];
            if (task.preferredDayOfWeek.length) {
                // task.preferredDayOfWeek.forEach((dayName, idx) => {
                //     const nearestDate = findNearestDate(dayName);
                    
                //     if (nearestDate >= startOfDay(timespan[0]) && nearestDate <= startOfDay(timespan[1])) {
                //         prefDates.push(nearestDate);
                //     }
                // });
                const matchingDates = findMatchingDaysOfWeekInTimespan(task.preferredDayOfWeek, timespan);
                // console.log(task.name, '> matchingDates >', matchingDates);
                prefDates.push(...matchingDates);
            }
            if (task?.repeat && task?.repeatTimespan !== 'hour') {
                idealDays = idealRepsXTimespan(task, prefDates, timespan);
            } else if (prefDates.length) {
                idealDays = prefDates;
            }

            console.log(task.name, '> idealDays >', idealDays);

            // GET IDEAL TIMES - if we have prefTimesOfDay or hourly repetition
            // Get prefTimesOfDay in [hours, hours] format
            if (task.preferredTimeOfDay.length) {
                let prefTimesOfDay: [number, number][] = [];
                if (task.preferredTimeOfDay) {
                    prefTimesOfDay = task.preferredTimeOfDay.map(timeOfDay => {
                        return DEFAULT_TIMES_OF_DAY[TimeOfDay[timeOfDay]];
                    })
                }
                // console.log('prefTimesOfDay:', prefTimesOfDay);

                // Intersect idealDays and prefTimesOfDay
                if (prefTimesOfDay.length && idealDays.length) {
                    idealTimes = hourRangesXDates(prefTimesOfDay, idealDays);
                } else if (prefTimesOfDay.length) {
                    // add prefTime for each day of the timespan
                    let [timespanStart, timespanEnd] = timespan;
                    [timespanStart, timespanEnd] = [new Date(timespanStart), new Date(timespanEnd.setUTCHours(24,0,0,0))]
                    // Ensure startDate is before endDate
                    if (timespanStart > timespanEnd) {
                        [timespanStart, timespanEnd] = [timespanEnd, timespanStart]; 
                    }
                    const dateCursor = new Date(timespanStart);
                    // Loop through each day of the timespan
                    while (dateCursor <= timespanEnd) {
                        // Process the current day
                        // console.log('currentDate:', dateCursor);
                        for (let i = 0; i < prefTimesOfDay.length; i++ ) {
                            // Make sure no task is scheduled before present moment
                            if (prefTimesOfDay[i][1] < timespan[0].getHours()) {
                                break;
                            } else if (prefTimesOfDay[i][0] < timespan[0].getHours()) {
                                idealTimes.push(hourRangeXDate([timespan[0].getHours(), prefTimesOfDay[i][1]], dateCursor));
                            } else {
                                idealTimes.push(hourRangeXDate(prefTimesOfDay[i], dateCursor));
                            }
                        }
                        // Move to the next day
                        dateCursor.setDate(dateCursor.getDate() + 1);
                    }
                }
                console.log(task.name, '> idealTimes >', idealTimes);
            }
            // console.log('idealTimes for non-repeating:', idealTimes);

            // For hourly repeating: Intersect idealTimes with idealRepetitions
            if (
                task.repeat && (
                    task.repeatTimespan === 'hour' 
                    || (task.preferredTimeOfDay.length)
                )
            ) {
                const idealFirstRep = idealTimes[0]?.[0] || timeGaps[0][0];
                const idealReps: Date[] = getIdealReps(task, timespan, idealFirstRep);
                idealTimes = idealTimesOfDayXIdealReps(task, idealTimes, idealReps);
            }
            // console.log('idealTimes:', idealTimes);


            // FIND MATCHING GAPS

            if (idealTimes.length) {
                for ( let i = 0; i < idealTimes.length; i++) {
                    const idealTime = idealTimes[i];
                    const idealEndOfTask = addMinutesToDate(idealTime[0], task.duration);
                    const matchingGaps = timeGaps.filter(gap => (gap[0] <= idealTime[0] && idealEndOfTask <= gap[1]));
                    // console.log('matchingGaps:', matchingGaps[0], matchingGaps[1]);
                    if (matchingGaps.length > 0) {
                        // Schedule task there
                        scheduleEventForTask(task, idealTime[0]);
                        eventsToScheduleDict[task.id] -= 1; // Update counter of events left to schedule for this task
                        timeGaps = updateTimeGaps([idealTime[0], addMinutesToDate(idealTime[0], task.duration)], timeGaps);
                    } else {
                        // TO DO: Find nearby gaps
                        // for ( let offset = 0; offset <= MAX_OFFSET; offset += 5 ) {
                        // }
                    }
                    if (eventsToScheduleDict[task.id] <= 0) {
                        break;
                    }
                };
            } else if (idealDays.length) {
                // Find first fitting timegap in that day
                for ( let i = 0; i < idealDays.length; i++) {
                    const idealDay = idealDays[i];
                    for ( let j = 0; j < timeGaps.length; j++) {
                        const gap = timeGaps[j];
                        if (gap[0].setHours(0, 0, 0, 0) === idealDay.setHours(0, 0, 0, 0)) {
                            // schedule task in gap
                            const event = scheduleEventForTask(task, gap[0]);
                            eventsToScheduleDict[task.id] -= 1; // update counter
                            timeGaps = updateTimeGaps([gap[0], addMinutesToDate(gap[0], task.duration)], timeGaps); // update time gaps
                            if (eventsToScheduleDict[task.id] <= 0) { // break if we scheduled all needed events
                                break;
                            }
                        }
                    }
                    if (eventsToScheduleDict[task.id] <= 0) {
                        break;
                    }
                }
            } else {
                // Schedule it at the nearest gap
                for( let i = 0; i < timeGaps.length; i++ ) {
                    const gap = timeGaps[i];
                    if (minutesBetweenDates(gap[0], gap[1]) >= task.duration) {
                        scheduleEventForTask(task, gap[0]);
                        timeGaps = updateTimeGaps([gap[0], addMinutesToDate(gap[0], task.duration)], timeGaps);
                        eventsToScheduleDict[task.id] -= 1;
                        i -= 1;
                    }
                    if ( eventsToScheduleDict[task.id] === 0 ) {
                        break;
                    }
                }
            } 
            // TO DO: In lack of specific preferences, use mindsets to organise tasks

            // FIND NEARBY GAPS



            // SCHEDULE EVENTS FOR TASK



            // UPDATE TIME GAPS
            // Find the time gaps that include the latest scheduled events and trim them
            
        }
    });
}
'use server';

import React from 'react';
import prisma from './db';
import { addDaysToDate, addMinutesToDate, calcRepeatIntervalInMinutes, hourRangeXDate, findNearestDate, hourRangesXDates, minutesBetweenDates, updateTimeGaps, startOfDay } from '../utils/dateUtils';
import { fetchEvents, fetchMindsets } from './data';
import { calculatePriorityScores } from './priorityScore';
import { Task, Event, TimeOfDay, $Enums } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { createEventPrisma, scheduleEventForTask } from './actions';
import { DAYS_OF_WEEK_DICT, DEFAULT_TIMES_OF_DAY, MAX_OFFSET, MAX_REP_OFFSET, dayOfWeekList, priorityList } from './definitions';
import { sortByCustomOrder } from '../utils/taskUtils';

// This organiser places all tasks in their ideal places initially, and deals with overalps later

// If repeating: Go to its next occurrence -> go to a time that divides perfectly by timespan
// Can only calculate for tasks that had their first session already scheduled
const getIdealReps = (task: Task, timespan: [Date, Date], idealFirstRepTime?: Date): Date[] => {
    let idealReps = [];
    if (task.repeat && task.repeatFrequency && task.repeatTimespanMultiplier && task.repeatTimespan) {
        const repInterval = calcRepeatIntervalInMinutes(task);
        if (task.firstSessionStartTime && task.repetitionsDone) {
            let idealRep = new Date(task.firstSessionStartTime.getTime() + (task.repetitionsDone + 1) * repInterval * 60 * 1000);
            while (idealRep > timespan[0] && idealRep < timespan[1]) {
                idealReps.push(idealRep);
                idealRep = new Date(idealRep.getTime() + repInterval * 60 * 1000);
            }
        } else if (idealFirstRepTime) {
            let idealRep = idealFirstRepTime;
            while (timespan[0] <= idealRep && idealRep < timespan[1]) {
                idealReps.push(idealRep);
                idealRep = new Date(idealRep.getTime() + repInterval * 60 * 1000);
            }
        }
    } else {
        console.error(`Task ${task.name} does not have enough repetition data`);
    }
    return idealReps;
}

const idealDaysXIdealReps = (
    task: Task, idealDays: Date[], timespan: [Date, Date]
): Date[] => {
    let newIdealDays: Date[] = [];
    const prefDatesSorted = idealDays.sort();
    // TO DO: move getting ideal reps into main function
    const idealReps = getIdealReps(task, timespan);
    idealReps.forEach(rep => {
        const repDay = new Date(rep.setUTCHours(0,0,0,0));
        if (idealDays.includes(repDay)) {
            newIdealDays.push(repDay);
        } else {
            const repIntervalMinutes = calcRepeatIntervalInMinutes(task);
            const impreciseRepSpan = [
                new Date(repDay.getTime() - (repIntervalMinutes * MAX_REP_OFFSET)),
                new Date(repDay.getTime() + (repIntervalMinutes * MAX_REP_OFFSET))
            ];
            // find the nearest prefDate to our repetitionDay
            for ( let i = 0; i <= idealDays.length; i++) {
                const prefDate = prefDatesSorted[i];
                if ( prefDate > impreciseRepSpan[0] && prefDate < impreciseRepSpan[1]) {
                    newIdealDays.push(prefDate);
                } else {
                    // Find to which imprecise timespan limit the prefDate is closer => use that limit
                    if (Math.abs(prefDate.getTime() - impreciseRepSpan[0].getTime()) < Math.abs(prefDate.getTime() - impreciseRepSpan[1].getTime())) {
                        newIdealDays.push(impreciseRepSpan[0]);
                    } else {
                        newIdealDays.push(impreciseRepSpan[1]);
                    }
                }
            }

        }
    });
    return newIdealDays;
}

const idealTimesOfDayXIdealReps = (
    task: Task, idealTimesOfDay: [Date, Date][], idealReps: Date[]
): [Date, Date][] => {
    const idealTimesSorted = idealTimesOfDay.sort((a, b) => (a[0].getTime() - b[0].getTime()));
    console.log('idealReps:', idealReps);
    let newIdealTimes: [Date, Date][] = [];
    let idealTimeIdx = 0;
    idealReps.forEach(rep => {

        // Calculate max repetition offset
        const repIntervalMinutes = calcRepeatIntervalInMinutes(task);
        const impreciseRepSpan = [
            new Date(rep.getTime() - (repIntervalMinutes * 60 * 1000 * MAX_REP_OFFSET)),
            new Date(rep.getTime() + (repIntervalMinutes * 60 * 1000 * MAX_REP_OFFSET))
        ];
        for ( let i = idealTimeIdx; i < idealTimesSorted.length; i++) {
            const idealTimeOfDay = idealTimesSorted[i];
            console.log('idealRep vs idealTime', rep, idealTimeOfDay)
            if ( idealTimeOfDay[0] <= rep && rep <= idealTimeOfDay[1] ) {
                newIdealTimes.push(idealTimeOfDay);
                idealTimeIdx += 1;
                break;
            } else if ( impreciseRepSpan[0] < idealTimeOfDay[0] && idealTimeOfDay[0] < impreciseRepSpan[1]) {
                newIdealTimes.push(idealTimeOfDay);
                idealTimeIdx += 1;
                break;
            } else {
                // Find to which imprecise timespan limit the prefDate is closer => use that limit
                const idealTimeDuration = (idealTimeOfDay[1].getTime() - idealTimeOfDay[0].getTime()) / 1000 / 60;
                if (Math.abs(idealTimeOfDay[0].getTime() - impreciseRepSpan[0].getTime()) < Math.abs(idealTimeOfDay[0].getTime() - impreciseRepSpan[1].getTime())) {
                    newIdealTimes.push([impreciseRepSpan[0], addMinutesToDate(impreciseRepSpan[0], idealTimeDuration)]);
                } else {
                    newIdealTimes.push([addMinutesToDate(impreciseRepSpan[1], -1 * idealTimeDuration), impreciseRepSpan[1]]);
                }
                idealTimeIdx += 1;
                break;
            }
        }
        if (idealTimesOfDay.length === 0) {
            // If idealTimes are solely based on repetition, use idealReps as idealTimes
            newIdealTimes.push([rep, addMinutesToDate(rep, calcRepeatIntervalInMinutes(task) * MAX_REP_OFFSET)]); // the length of the ideal time is the maximum offset of a repeating task
        }
        
    });
    return newIdealTimes;
}


export async function organiseIdealFirst(timespan: [Date, Date]) {

    const timespanInMinutes = minutesBetweenDates(timespan[0], timespan[1]);
    const events = await fetchEvents();
    let tasksToSchedule = await prisma.task.findMany({
        where: {
            NOT: {
                status: 'done',
                fixed: true
            }
        }, 
        orderBy: {
            timeScore: 'desc'
        }
    });
    // console.log('tasksToSchedule', tasksToSchedule);

    // COUNT EVENTS THAT NEED SCHEDULING
    let eventsToScheduleDict : {[key: string]: number} = {};
    // Add one-time events first
    tasksToSchedule.filter(task => task.repeat === false).forEach(task => {
        eventsToScheduleDict[task.id] = 1;
    });
    // For repeating tasks, estimate number of sessions that fit in the given timespan
    tasksToSchedule.filter(task => task.repeat === true).forEach((task, idx) => {
        if ( task.repeatFrequency && task.repeatTimespanMultiplier && task.repeatTimespan ) {
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
            // console.log('taskSessionsToSchedule', taskSessionsToSchedule); ✅
            eventsToScheduleDict[task.id] = taskSessionsToSchedule;
        } else {
            return {
                message: 'Error: task is missing repetition data.'
            }
        }
    });

    console.log('eventsToScheduleDict:', eventsToScheduleDict); 

    // FIND TIME GAPS IN TIMESPAN
    // Get fixed events in the timespan
    const fixedEventsInTimespan = await prisma.event.findMany({
        where: {
            fixed: true,
            OR: [{
                startTime: {
                    gte: timespan[0], 
                    lt: timespan[1],
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
    // console.log('fixedEventsInTimespan', fixedEventsInTimespan);
    // console.log('tasksToSchedule', tasksToSchedule);
    const eventTimes = fixedEventsInTimespan.map(event => [event.startTime, event.endTime]);
    let timeGaps : [Date, Date][] = [];
    !eventTimes.length && timeGaps.push([timespan[0], timespan[1]]);
    for ( let idx = 0; idx < eventTimes.length; idx++) {
        const eventStartEnd = eventTimes[idx];
        if ( idx === 0 && minutesBetweenDates(timespan[0], eventStartEnd[0]) > 0 ) {
            timeGaps.push([timespan[0], eventStartEnd[0]]);
        } else if (minutesBetweenDates(eventTimes[idx - 1][1], eventTimes[idx][0]) > 0) {
            timeGaps.push([eventTimes[idx - 1][1], eventTimes[idx][0]]);
        }
    }
    timeGaps = timeGaps.sort((a, b) => (
        a[0].getTime() - b[0].getTime()
    ));

    // console.log('timeGaps:', timeGaps); ✅

    // Sort tasks by priority, then by time score
    let tasksToScheduleSorted = sortByCustomOrder(tasksToSchedule, 'priority', priorityList)
        .sort((a, b) => (a.timeScore - b.timeScore));

    // Loop through sorted tasks
    tasksToScheduleSorted.forEach((task, idx) => {
        if (eventsToScheduleDict[task.id] > 0) {

            // Place the task in its ideal spot (time of day, day of week)
            let idealDays: Date[] = [];
            let idealTimes: [Date, Date][] = [];
            
            // GET IDEAL DAYS - if we have prefDays or repeating task
            // Day of the week -> find the nearest days in the timespan
            let prefDates: Date[] = [];
            if (task.preferredDayOfWeek) {
                task.preferredDayOfWeek.forEach((dayName, idx) => {
                    const nearestDate = findNearestDate(dayName);
                    if (nearestDate >= startOfDay(timespan[0]) && nearestDate <= startOfDay(timespan[1])) {
                        prefDates.push(findNearestDate(dayName));
                    }
                })
            }
            if (task.repeat && task.repeatTimespan !== 'hour') {
                idealDays = idealDaysXIdealReps(task, prefDates, timespan);
            } else if (prefDates.length) {
                idealDays = prefDates;
            }

            console.log('idealDays:', idealDays);

            // GET IDEAL TIMES - if we have prefTimesOfDay or hourly repetition
            // Get prefTimesOfDay in [Date, Date] format
            if (task.preferredTimeOfDay.length) {
                let prefTimesOfDay: [number, number][] = [];
                if (task.preferredTimeOfDay) {
                    prefTimesOfDay = task.preferredTimeOfDay.map(timeOfDay => {
                        return DEFAULT_TIMES_OF_DAY[TimeOfDay[timeOfDay]];
                    })
                }

                console.log('prefTimesOfDay:', prefTimesOfDay);

                // Intersect idealDays and prefTimesOfDay
                if (prefTimesOfDay.length && idealDays.length) {
                    idealTimes = hourRangesXDates(prefTimesOfDay, idealDays);
                } else if (prefTimesOfDay.length) {
                    // add prefTime for each day of the timespan
                    let [startDate, endDate] = timespan;
                    [startDate, endDate] = [new Date(startDate.setUTCHours(0,0,0,0)), new Date(endDate.setUTCHours(0,0,0,0))]
                    // Ensure startDate is before endDate
                    if (startDate > endDate) {
                        [startDate, endDate] = [endDate, startDate]; 
                    }
                    const currentDate = new Date(startDate); // Create a date iterator
                    // Loop through each day of the timespan
                    while (currentDate <= endDate) {
                        // Process the current day
                        console.log('currentDate:', currentDate);
                        for (let i = 0; i < prefTimesOfDay.length; i++ ) {
                            idealTimes.push(hourRangeXDate(prefTimesOfDay[i], currentDate));
                        }
                        // Move to the next day
                        currentDate.setDate(currentDate.getDate() + 0.5);
                    }
                }
                // TO DO: Add idealTime as a task property
            }

            console.log('idealTimes for non-repeating:', idealTimes);

            // Intersect idealTimes with idealRepetitions if repetition is hourly
            if (
                task.repeat && (
                    task.repeatTimespan === 'hour' 
                    || (task.preferredTimeOfDay.length)
                )
            ) {
                const idealFirstRep = idealTimes[0][0] || timeGaps[0][0];
                const idealReps: Date[] = getIdealReps(task, timespan, idealFirstRep);
                idealTimes = idealTimesOfDayXIdealReps(task, idealTimes, idealReps);
            }

            console.log('idealTimes:', idealTimes);


            // FIND MATCHING GAPS
            if (idealTimes.length) {
                for ( let i = 0; i < idealTimes.length; i++) {
                    const idealTime = idealTimes[i];
                    const idealEndOfTask = addMinutesToDate(idealTime[0], task.duration);
                    const matchingGaps = timeGaps.filter(gap => (gap[0] <= idealTime[0] && idealEndOfTask <= gap[1]));
                    console.log('matchingGaps:', matchingGaps[0], matchingGaps[1]);
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

export async function handleOrganise () {
    const currentTime = new Date();
    const sevenDaysFromNow = addDaysToDate(currentTime, 7);
    organiseIdealFirst([currentTime, sevenDaysFromNow]);
}
'use server';

import React from 'react';
import prisma from './db';
import { addMinutesToDate, calcRepeatIntervalInMinutes, minutesBetweenDates } from '../utils/dateUtils';
import { fetchEvents, fetchMindsets } from './data';
import { calculatePriorityScores } from './priorityScore';
import { Task, Event } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { createEventPrisma } from './actions';

export async function organiseTimespan(timespan: [Date, Date]) {

    let timeCursor = timespan[0];
    const timespanInMinutes = (timespan[1].getTime() - timespan[0].getTime()) / 1000 / 60;

    const mindsets = await fetchMindsets();
    const events = await fetchEvents();
    let tasksToSchedule = await prisma.task.findMany({
        where: {
            events: {
                none: {}
            },
            NOT: {
                status: 'done',
                fixed: true
            }
        }
    });
    
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
                    gte: timespan[0],
                    lt: timespan[1]
                }
            }]
        },
        orderBy: {
            startTime: 'asc',
        }
    });

    // console.log('fixedEventsInTimespan', fixedEventsInTimespan);
    // console.log('tasksToSchedule', tasksToSchedule);

    // Count events that need to be scheduled
    let eventsToScheduleDict : {[key: string]: number} = {};
    // Add one-time events first
    tasksToSchedule.filter(task => task.repeat === false).forEach(task => {
        eventsToScheduleDict[task.id] = 1;
    })
    // For repeating tasks, estimate number of sessions that fit in the given timespan
    tasksToSchedule.filter(task => task.repeat === true).forEach((task, idx) => {
        if ( task.repeatFrequency && task.repeatTimespanMultiplier && task.repeatTimespan ) {
            const taskRepeatIntervalInMinutes = calcRepeatIntervalInMinutes(task.repeatFrequency, task.repeatTimespanMultiplier, task.repeatTimespan);
            
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

    // console.log('eventsToScheduleDict', eventsToScheduleDict); ✅

    // Find time gaps in the timespan
    const eventTimes = fixedEventsInTimespan.map(event => [event.startTime, event.endTime]);
    const timeGaps = [];
    !eventTimes.length && timeGaps.push([timespan[0], timespan[1]]);
    for ( let idx = 0; idx < eventTimes.length; idx++) {
        const eventStartEnd = eventTimes[idx];
        if ( idx === 0 && minutesBetweenDates(timespan[0], eventStartEnd[0]) > 0 ) {
            timeGaps.push([timespan[0], eventStartEnd[0]]);
        } else if (minutesBetweenDates(eventTimes[idx - 1][1], eventTimes[idx][0]) > 0) {
            timeGaps.push([eventTimes[idx - 1][1], eventTimes[idx][0]]);
        }
    }

    // console.log('timeGaps', timeGaps); ✅

    // Loop through time gaps and fill them with tasks
    timeGaps.forEach(timeGap => {
        timeCursor = timeGap[0];
        const gapDuration = minutesBetweenDates(timeGap[0], timeGap[1]);
        // console.log('gapDuration', gapDuration);  ✅

        if ( gapDuration > 10 ) { 
            let fittingTasks = tasksToSchedule.filter(task => (
                task.duration <= gapDuration &&
                eventsToScheduleDict[task.id] > 0 // Only tasks that have events left to be scheduled
            ));
            // console.log('fittingTasks', fittingTasks); ✅
            if ( fittingTasks.length > 0 ) {
                // Check how many events are left to schedule
                let numEventsLeftToSchedule = Object.values(eventsToScheduleDict).reduce((partialSum, a) => partialSum + a, 0);
                // console.log('numEventsLeftToSchedule', numEventsLeftToSchedule); ✅
                while( timeCursor < timeGap[1] && numEventsLeftToSchedule > 0 ) {

                    // Calculate priority scores at the cursor
                    const fittingTasksScoredAtCursor = calculatePriorityScores(fittingTasks, mindsets, timeCursor);

                    console.log('fittingTasksScoredAtCursor', fittingTasksScoredAtCursor); // ❌

                    // Schedule event
                    const chosenTask = fittingTasksScoredAtCursor.sort((taskA, taskB) => taskA.priorityScore - taskB.priorityScore)[0];
                    const eventToSchedule: Event = {
                        id: uuidv4(),
                        name: chosenTask.name,
                        status: chosenTask.status,
                        fixed: chosenTask.fixed,
                        taskId: chosenTask.id,
                        startTime: timeCursor,
                        endTime: addMinutesToDate(timeCursor, chosenTask.duration),
                        userStartTime: null,
                        userEndTime: null,
                        notes: null,
                        createdAt: new Date()
                    }
                    try {
                        createEventPrisma(eventToSchedule);

                        // Decrement in the dict of event counters. Update numEvents
                        eventsToScheduleDict[chosenTask.id] -= 1;
                        numEventsLeftToSchedule -= 1;
                        timeCursor = eventToSchedule.endTime; // Move curor after event

                        // Update fitting tasks
                        fittingTasks = tasksToSchedule.filter(task => (
                            task.duration <= gapDuration &&
                            eventsToScheduleDict[task.id] > 0 // Only tasks that have events left to be scheduled
                        ));

                    } catch (error) {
                        return {
                            message: `Unable to create event for task: ${chosenTask.name}`
                        }
                    }
                    
                    
                }
            }
        } else {
            // TO DO: Logic for small time gaps (breaks, transitions, travel times, small to do's)
        }
    });
}
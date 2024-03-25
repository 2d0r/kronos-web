'use server';

import React from 'react';
import prisma from './db';
import { addDaysToDate, addMinutesToDate, minutesBetweenDates } from '../utils/dateUtils';
import { MINIMUM_TRANSITION, MIN_TASK_DURATION } from './definitions';
import { allTasksHaveActiveEvents, fetchMindsets, fetchTasksPrisma } from './data';
import { calculatePriorityScores } from './priorityScore';
import { Task, Event } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { createEventPrisma } from './actions';
import { organiseTimespan } from './organiser-snake';

export async function organiseWeek() {

    // get nextSevenDays period in DateTime
    const currentTime = new Date();
    const sevenDaysInMillis = 7 * 24 * 60 * 60 * 1000;
    const sevenDaysFromNow = new Date(currentTime.getTime() + sevenDaysInMillis);
    const nextSevenDaysPeriod = [currentTime, sevenDaysFromNow];

    const eventsNextSevenDays = await prisma.event.findMany({
        where: {
            startTime: {
                gte: nextSevenDaysPeriod[0], 
                lt: nextSevenDaysPeriod[1],
            },
        },
        orderBy: {
            startTime: 'asc',
        }
    });

    // console.log(eventsNextSevenDays); // ✅

    // Loop through events and find time gaps between them
    let timeGaps = [];
    for (let idx = -1; idx < eventsNextSevenDays.length; idx ++){
        const event = eventsNextSevenDays[idx];
        // Edge case: no events scheduled in the following 7 days
        if (eventsNextSevenDays.length === 0) {
            timeGaps.push({
                startTime: currentTime,
                endTime: sevenDaysFromNow
            })
        // Edge case: between first event and now
        } else if (idx === -1) {
            if (minutesBetweenDates(currentTime, eventsNextSevenDays[0].startTime) > MINIMUM_TRANSITION) {
                timeGaps.push({
                    startTime: currentTime,
                    endTime: eventsNextSevenDays[0].startTime
                });
            }
        // Edge case: between last event's end time and seveDaysFromNow
        } else if (idx === eventsNextSevenDays.length - 1) {
            if (minutesBetweenDates(event.endTime, sevenDaysFromNow) > MINIMUM_TRANSITION) {
                timeGaps.push({
                    startTime: event.endTime,
                    endTime: sevenDaysFromNow
                });
            }
        // Between events
        } else {
            if (minutesBetweenDates(event.endTime, eventsNextSevenDays[idx + 1].startTime) > MINIMUM_TRANSITION) {
                timeGaps.push({
                    startTime: event.endTime,
                    endTime: eventsNextSevenDays[idx + 1].startTime
                });
            }
        }
    };

    // console.log(timeGaps); // ✅

    const tasks = await fetchTasksPrisma();
    const mindsets = await fetchMindsets();

    const scheduledTaskIds = await prisma.event.findMany({
        select: {
            taskId: true
        }
    });
    const scheduledTaskIdsList = scheduledTaskIds.map(item => item.taskId);

    timeGaps.forEach((gap) => {
        let endTimeOfLastTaskAdded = gap.startTime;
        // fill in with tasks until there is no more space or until you run out of tasks
        while (scheduledTaskIdsList.length < tasks.length && endTimeOfLastTaskAdded < gap.endTime) {
            const fittingTasks = tasks
            // filter tasks that fit this gap
            .filter(task => (
                task.duration && (task.duration <= minutesBetweenDates(gap.startTime, gap.endTime)) &&
                // filter out tasks that are already scheduled
                !scheduledTaskIdsList.includes(task.id)
            ));
            if(fittingTasks.length === 0) break;
            // calculate priority scores for this moment
            const tasksWithCurrentScores = calculatePriorityScores(fittingTasks, mindsets, currentTime);
            const chosenTask = tasksWithCurrentScores.sort((taskA, taskB) => taskA.priorityScore - taskB.priorityScore)[0];

            if (chosenTask) {
                const eventToSchedule: Event = {
                    id: uuidv4(),
                    name: chosenTask.name,
                    status: chosenTask.status,
                    fixed: chosenTask.fixed,
                    taskId: chosenTask.id,
                    startTime: endTimeOfLastTaskAdded,
                    endTime: addMinutesToDate(endTimeOfLastTaskAdded, chosenTask.duration || MIN_TASK_DURATION),
                    userStartTime: null,
                    userEndTime: null,
                    notes: null,
                    createdAt: new Date()
                }
                
                createEventPrisma(eventToSchedule);
                // add task to scheduledTaskIdsList
                scheduledTaskIdsList.push(chosenTask.id);
                endTimeOfLastTaskAdded = eventToSchedule.endTime;
            }
            

            
        }
            // .sort((taskA, taskB) => taskA.priorityScore - taskB.priorityScore)[0];

    });

    console.log('Ran organise week!');

}


// Runs through the next 7 days of the events data ✅
    // Finds all the time gaps ✅
// Loop through all gaps ✅
    // Get a task list, filtered by those that fit that gap ✅
        // Remove the tasks that have already been scheduled
        // Expand filter?
    // Run calculatePriorityScore() for the time at the beginning of the gap, on the filtered tasks ✅
    // Schedule the top task there

export async function handleOrganise () {
    const currentTime = new Date();
    const sevenDaysFromNow = addDaysToDate(currentTime, 7);
    organiseTimespan([currentTime, sevenDaysFromNow]);
}
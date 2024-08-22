'use server';

import { addDays } from 'date-fns';
import { countEventsOfTaskToBeScheduled, countFreeTimeInTimespan } from '@/utils/organiser-utils';
import { deleteEventsOfTask, getIntersectingTimespans, scheduleEventForTask } from '@/lib/actions';
import { findEventsInTimespan, getTasksToSchedule } from '@/lib/data';
import { eventsToSchedule, PRIORITY_ORDER, TaskWithRelations } from '@/lib/definitions';
import { organiseTimespan } from '@/lib/organise-timespan';
import { getStartAndEndOfDay } from '@/utils/date-utils';

export const organiseTask = async (newTask: TaskWithRelations, timespan?: [Date, Date]) => {

    // GET TIMESPAN TO ORGANISE
    let timespanToOrganise: [Date, Date];
    if (timespan) {
        timespanToOrganise = timespan;
    } else {
        const currentOrganisedTimespan = await getIntersectingTimespans();
        if (currentOrganisedTimespan) {
            timespanToOrganise = [ new Date(), currentOrganisedTimespan[0].endTime ];
        }
        else {
            timespanToOrganise = getStartAndEndOfDay(new Date());
        }
    }

    console.log('organiseTask > Timespan to organise:', timespanToOrganise);


    // FIXED TASK => Schedule event right away
    if (newTask.fixed && newTask.startTime) {
        await deleteEventsOfTask(newTask.id, undefined); //To do: specify timespanToOrganise
        await scheduleEventForTask(newTask, newTask.startTime);
        return;
    }

    // FLEXIBLE TASK => rescheduling may displace other flexible events
    const eventsAfterNow = await findEventsInTimespan(new Date());

    // MEASURE CROWDEDNESS
    const freeMinutes = await countFreeTimeInTimespan(timespanToOrganise, eventsAfterNow);
    // Measure the total duration of the events we have to schedule
    const durationToSchedule = await countEventsOfTaskToBeScheduled(newTask, timespanToOrganise, 'duration') || 1;
    const isCrowded = freeMinutes / durationToSchedule < 5;

    console.log('organiseTask > isCrowded', isCrowded);


    // A. CROWDED TIMESPAN

    // if (isCrowded) {
        // A.1. Get displaceable events: events in the timespan of lower or equal priority
        let tasksToReschedule = await getTasksToSchedule();
        const displaceableEvents = eventsAfterNow?.filter(event => (tasksToReschedule.map(task => task.id).includes(event.task.id))) // Filter only events that belong to tasks that need to be scheduled
            .filter(event => PRIORITY_ORDER[event.task.priority] <= PRIORITY_ORDER[newTask.priority]) // Filter only events with lower or equal priority to the newTask
            .sort((a, b) => a.startTime.getTime() - b.startTime.getTime()) || []; // Sort chronologically

        console.log('organiseTask > displaceableEvents', displaceableEvents.map(event => `${event.name} - ${event.startTime}`));

        // To do: just get tasks to reschedule; as the events counting anyway happens in organiseTimespan
        // // Filter and sort task to reschedule
        // tasksToReschedule = filterSortTasksToSchedule(tasksToReschedule);
        // // Get all tasks from newTask and after
        // tasksToReschedule = tasksToReschedule.slice(tasksToReschedule.indexOf(newTask));
        // console.log(newTask.name, '> tasksToReschedule', tasksToReschedule);

        // Delete displaceable events (after saving them) -> done by organiseTimespan
        // deleteEventsById(displaceableEvents.map(event => event.id));

        // A.2. Bring together all events to reschedule, [...newTaskEvents, ...displaceableEvents];
        // Format
        let displaceableEventsSimple: eventsToSchedule = [];
        displaceableEvents.forEach(event => {
            const eventObj = displaceableEventsSimple.find(el => el.taskId === event.task.id);
            if (eventObj) eventObj.count += 1;
            else displaceableEventsSimple.push({taskId: event.task.id, count: 1});
        });
        const eventsToSchedule: eventsToSchedule = [
            {
                taskId: newTask.id,
                count: countEventsOfTaskToBeScheduled(newTask, timespanToOrganise, 'count'),
            },
            ...displaceableEventsSimple,
        ];

        // Temporary: Get time of last event
        const lastEventEnd = displaceableEvents && displaceableEvents.length > 1 ? 
            displaceableEvents?.toSorted((b, a) => a.endTime.getTime() - b.endTime.getTime())[0].endTime 
            : displaceableEvents?.[0]?.endTime;
        // A.3. Delete displaceableEvents in the timespan and reschedule
        await organiseTimespan({
            timespan: [new Date(), lastEventEnd || addDays(new Date(), 7)],
            displaceableEventIds: displaceableEvents?.map(el => el.id) || [],
            displaceAllFlexEvents: false,
            eventsToSchedule: eventsToSchedule,
        });
        // To do: Save existing displaceableEvents, reschedule them
        
    // }
    

    // // Change future events' name - for existing task
    // const now = new Date();
    // newTask.events?.forEach(event => {
    //     if (new Date(event.startTime).getTime() >= now.getTime()) {
    //         updateEventField(event.id, 'name', newTask.name);
    //     }
    // });

    // B. SCARCE TIMESPAN
    // Displace events one by one
    // if (!isCrowded) {

    // }
}
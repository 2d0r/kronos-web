'use server';

import { addDays } from 'date-fns';
import { filterSortTasksToSchedule } from '../utils/organiser-utils';
import { updateEventField } from './actions';
import { findEventsInTimespan, getTasksToSchedule } from './data';
import { TaskWithRelations } from './definitions';
import { organiseTimespan } from './organise-timespan';

export async function organiseTask(newTask: TaskWithRelations) {

    let tasksToReschedule = await getTasksToSchedule();
    const eventsAfterNow = await findEventsInTimespan(new Date());

    // Change future events' name - for existing task
    const now = new Date();
    newTask.events?.forEach(event => {
        if (new Date(event.startTime).getTime() >= now.getTime()) {
            updateEventField(event.id, 'name', newTask.name);
        }
    });

    // Filter and sort task to reschedule
    tasksToReschedule = filterSortTasksToSchedule(tasksToReschedule);
    // Get all tasks from newTask and after
    tasksToReschedule = tasksToReschedule.slice(tasksToReschedule.indexOf(newTask));
    console.log(newTask.name, '> tasksToReschedule', tasksToReschedule);

    // Get displaceable events
    const displaceableEvents = eventsAfterNow?.filter(el => (
        tasksToReschedule.map(task => task.id).includes(el.task.id)
    )).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    console.log(newTask.name, '> displaceableEvents', displaceableEvents);

    // Temporary: Get time of last event
    const lastEventEnd = displaceableEvents && displaceableEvents.length > 1 ? 
        displaceableEvents?.toSorted((b, a) => a.endTime.getTime() - b.endTime.getTime())[0].endTime 
        : displaceableEvents?.[0]?.endTime;

    // OPTION 1: Delete displaceableEvents in the timespan and reschedule
    await organiseTimespan(
        [new Date(), lastEventEnd || addDays(new Date(), 7)], 
        displaceableEvents?.map(el => el.id) || ['none'],
    );
    // To do: Save existing displaceableEvents, reschedule them
    // To do: Save scheduled intervals => only reschedule from now to end of scheduled interval

    // OPTION 2: Displace events gradually (more efficient for emptier timespans)
    // To do: Check if timespan is crowded

}
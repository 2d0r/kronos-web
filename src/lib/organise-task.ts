'use server';

import { addDays } from 'date-fns';
import { filterSortTasksToSchedule } from '@/utils/organiser-utils';
import { deleteEventsOfTask, getIntersectingTimespans, scheduleEventForTask, updateEventField } from '@/lib/actions';
import { findEventsInTimespan, getTasksToSchedule } from '@/lib/data';
import { TaskWithRelations } from '@/lib/definitions';
import { organiseTimespan } from '@/lib/organise-timespan';

export async function organiseTask(newTask: TaskWithRelations, timespan?: [Date, Date]) {

    // GET TIMESPAN TO ORGANISE
    let timespanToOrganise: [Date, Date] = [new Date(), new Date()];
    if (timespan) {
        timespanToOrganise = timespan;
    } else {
        const currentOrganisedTimespan = await getIntersectingTimespans();
        if (currentOrganisedTimespan) {
            timespanToOrganise = [ new Date(), currentOrganisedTimespan[0].endTime ];
        }
    }


    // FIXED TASK => Schedule event right away
    if (newTask.fixed && newTask.startTime) {
        await deleteEventsOfTask(newTask.id); //To do: specify timespanToOrganise
        await scheduleEventForTask(newTask, newTask.startTime);
        return;
    }

    // // Get all tasks that can be rescheduled ? (status: !done, type: task)
    // let tasksToReschedule = await getTasksToSchedule();
    // const eventsAfterNow = await findEventsInTimespan(new Date());

    // // Change future events' name - for existing task
    // const now = new Date();
    // newTask.events?.forEach(event => {
    //     if (new Date(event.startTime).getTime() >= now.getTime()) {
    //         updateEventField(event.id, 'name', newTask.name);
    //     }
    // });

    // // Filter and sort task to reschedule
    // tasksToReschedule = filterSortTasksToSchedule(tasksToReschedule);
    // // Get all tasks from newTask and after
    // tasksToReschedule = tasksToReschedule.slice(tasksToReschedule.indexOf(newTask));
    // console.log(newTask.name, '> tasksToReschedule', tasksToReschedule);

    // // Get displaceable events
    // const displaceableEvents = eventsAfterNow?.filter(el => (
    //     tasksToReschedule.map(task => task.id).includes(el.task.id)
    // )).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    // console.log(newTask.name, '> displaceableEvents', displaceableEvents);

    // // Temporary: Get time of last event
    // const lastEventEnd = displaceableEvents && displaceableEvents.length > 1 ? 
    //     displaceableEvents?.toSorted((b, a) => a.endTime.getTime() - b.endTime.getTime())[0].endTime 
    //     : displaceableEvents?.[0]?.endTime;

    // // OPTION 1: Delete displaceableEvents in the timespan and reschedule
    // await organiseTimespan({
    //     timespan: [new Date(), lastEventEnd || addDays(new Date(), 7)],
    //     displaceableEventIds: displaceableEvents?.map(el => el.id) || [],
    //     displaceAllFlexEvents: false,
    // });
    // // To do: Save existing displaceableEvents, reschedule them
    // // To do: Save scheduled intervals => only reschedule from now to end of scheduled interval

    // // OPTION 2: Displace events gradually (more efficient for emptier timespans)
    // // To do: Check if timespan is crowded






    // // Check crowdedness of timespanToOrganise

    // // If crowded: Reorganise en masse
    //     // Get all events of lower priority -> save in displacedEvents -> delete events
    //     // 

}
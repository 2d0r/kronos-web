// Update events after editing a task

import { updateEventField } from './actions';
import { TaskWithRelations } from './definitions';

export async function reorganiseTask(taskId: string) {
    const response = await fetch(`/task/${taskId}`);
    const data = await response.json();
    const task: TaskWithRelations = data.task;

    // Change events' name - from now on
    const now = new Date() as Date;
    task.events?.forEach(event => {
        if (new Date(event.startTime).getTime() >= now.getTime()) {
            console.log('updating event', event.id);
            updateEventField(event.id, 'name', task.name);
        }
    })

    // Reschedule events
}
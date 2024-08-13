import React from 'react';
import TimelineBoard from '@/components/ui/timeline-board';
import { NEUTRAL_MINDSET_COLOUR, TaskWithRelations, URLSearchParamsKronos } from '@/lib/definitions';
import { getMindsets, getTasksWithRelations, getCurrentMindsetColour } from '@/lib/data';
import TaskBrowser from '@/components/browser/task-browser';
import { Mindset } from '@prisma/client';

export default async function Page() {

    let tasks: TaskWithRelations[] = await getTasksWithRelations(); 
    const mindsets: Mindset[] = await getMindsets();
    const mindsetColour = await getCurrentMindsetColour();

    return (<>
        <TimelineBoard back={true} mindsets={mindsets} mindsetColour={mindsetColour || NEUTRAL_MINDSET_COLOUR}>
            <TaskBrowser 
                initialTasks={tasks} 
                mindsets={mindsets} 
                mindsetColour={mindsetColour || NEUTRAL_MINDSET_COLOUR}
            />
        </TimelineBoard>
    </>);
}
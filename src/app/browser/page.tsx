import React from 'react';
import TimelineCard from '@/components/timeline-board';
import { NEUTRAL_MINDSET_COLOUR, TaskWithRelations, URLSearchParamsKronos } from '@/lib/definitions';
import { getMindsets, fetchTasksWithRelations, getCurrentMindsetColour } from '@/lib/data';
import TaskBrowser from '@/components/browser/task-browser';
import { Mindset } from '@prisma/client';

export default async function Page({searchParams}: {searchParams: URLSearchParamsKronos}) {

    let tasks: TaskWithRelations[] = await fetchTasksWithRelations(); 
    const mindsets: Mindset[] = await getMindsets();
    const mindsetColour = await getCurrentMindsetColour();

    return (<>
        <TimelineCard searchParams={searchParams} back={true} mindsets={mindsets} mindsetColour={mindsetColour || NEUTRAL_MINDSET_COLOUR}>
            <TaskBrowser 
                tasks={tasks} 
                mindsets={mindsets} 
                mindsetColour={mindsetColour || NEUTRAL_MINDSET_COLOUR}
                searchParams={searchParams}
            />
        </TimelineCard>
    </>);
}
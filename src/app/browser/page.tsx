import React from 'react';
import TimelineCard from '../ui/timeline-card';
import { NEUTRAL_MINDSET_COLOUR, TaskWithRelations, URLSearchParamsKronos } from '../lib/definitions';
import { fetchMindsets, fetchTasksWithRelations, getCurrentMindsetColour } from '../lib/data';
import TaskBrowser from '../ui/browser/task-browser';
import { Mindset } from '@prisma/client';

export default async function Page({searchParams}: {searchParams: URLSearchParamsKronos}) {

    let tasks: TaskWithRelations[] = await fetchTasksWithRelations(); 
    const mindsets: Mindset[] = await fetchMindsets();
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
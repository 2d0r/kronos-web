import React from 'react';
import { MindsetWithRelations, NEUTRAL_MINDSET_COLOUR, TaskWithRelations, URLSearchParamsKronos } from '@/lib/definitions';
import { fetchEventsWithRelations, getMindsetsWithRelations, fetchTasksWithRelations, getCurrentMindsetColour } from '@/lib/data';
import TestView from '@/components/test-view';

export default async function Page({searchParams}: {searchParams: URLSearchParamsKronos}) {

    const tasks: TaskWithRelations[] = await fetchTasksWithRelations(); 
    const mindsets: MindsetWithRelations[] = await getMindsetsWithRelations();
    const mindsetColour = await getCurrentMindsetColour();
    const events = await fetchEventsWithRelations();

    return (<TestView 
        searchParams={searchParams} back={true}
        mindsets={mindsets}
        mindsetColour={mindsetColour || NEUTRAL_MINDSET_COLOUR}
        tasks={tasks}
        events={events}
    />)
}
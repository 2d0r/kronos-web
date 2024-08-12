import React from 'react';
import { MindsetWithRelations, NEUTRAL_MINDSET_COLOUR, TaskWithRelations, URLSearchParamsKronos } from '@/lib/definitions';
import { getEventsWithRelations, getMindsetsWithRelations, getTasksWithRelations, getCurrentMindsetColour } from '@/lib/data';
import TestView from '@/components/test-view';

export default async function Page() {

    const tasks: TaskWithRelations[] = await getTasksWithRelations(); 
    const mindsets: MindsetWithRelations[] = await getMindsetsWithRelations();
    const mindsetColour = await getCurrentMindsetColour();
    const events = await getEventsWithRelations();

    return (<TestView 
        back={true}
        mindsets={mindsets}
        mindsetColour={mindsetColour || NEUTRAL_MINDSET_COLOUR}
        tasks={tasks}
        events={events}
    />)
}
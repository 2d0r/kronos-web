import React from 'react';
import { NEUTRAL_MINDSET_COLOUR, URLSearchParamsKronos } from '@/lib/definitions';
import { getCurrentMindsetColour } from '@/lib/data';
import TestView from '@/components/test-view';
import TaskCard from '@/components/tasks/task-card';

export default async function Page({ searchParams } : {searchParams: URLSearchParamsKronos}) {

    const mindsetColour = await getCurrentMindsetColour();
    const showTaskCard = searchParams.task;

    return (<>
        <TestView 
            back={true}
            mindsetColour={mindsetColour || NEUTRAL_MINDSET_COLOUR}
        />
        {showTaskCard && <TaskCard />}
    </>)
}
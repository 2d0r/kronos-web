import React from 'react';
import TimelineBoard from '@/components/ui/timeline-board';
import { NEUTRAL_MINDSET_COLOUR, URLSearchParamsKronos } from '@/lib/definitions';
import { getCurrentMindsetColour } from '@/lib/data';
import TaskBrowser from '@/components/browser/task-browser';
import TaskCard from '@/components/tasks/task-card';

export default async function Page({ searchParams }: { searchParams: URLSearchParamsKronos }) {

    const mindsetColour = await getCurrentMindsetColour();
    const showTaskCard = !!searchParams.task;

    return (<>
        <TimelineBoard back={true} mindsetColour={mindsetColour || NEUTRAL_MINDSET_COLOUR}>
            <TaskBrowser mindsetColour={mindsetColour || NEUTRAL_MINDSET_COLOUR} />
        </TimelineBoard>
        {showTaskCard && <TaskCard />}
    </>);
}
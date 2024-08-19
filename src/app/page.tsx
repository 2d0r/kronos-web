import React from 'react';
import { getCurrentMindsetColour } from '@/lib/data';
import TopBar from '@/components/ui/top-bar';
import BottomBar from '@/components/ui/bottom-bar';
import { NEUTRAL_MINDSET_COLOUR, URLSearchParamsKronos } from '@/lib/definitions';
import { adjustLightness } from '@/utils/colour-utils';
import Timeline from '@/components/timeline';
import TaskCard from '@/components/tasks/task-card';

export default async function Page({ searchParams } : { searchParams: URLSearchParamsKronos}) {

    const mindsetColour = await getCurrentMindsetColour() || NEUTRAL_MINDSET_COLOUR;
    const showTaskCard = !!searchParams.task;

    return (<div className='w-screen h-screen' style={{
        backgroundImage: `linear-gradient(to bottom right, ${adjustLightness(mindsetColour, 0.5)}, ${adjustLightness(mindsetColour, 0.7)})`
        }}>
            <TopBar>
                {/* <SearchBar placeholder="Search tasks, projects, dates..." /> */}
            </TopBar>
            <Timeline />
            <BottomBar mindsetColour={mindsetColour} />
            { showTaskCard && <TaskCard />}
        </div>
    );
}
import React from 'react';
import { getMindsets, getCurrentMindsetColour } from '@/lib/data';
import TopBar from '@/components/ui/top-bar';
import BottomBar from '@/components/ui/bottom-bar';
import { NEUTRAL_MINDSET_COLOUR } from '@/lib/definitions';
import { adjustLightness } from '@/utils/colourUtils';
import Timeline from '@/components/timeline';

export default async function Page() {

    const mindsets = await getMindsets();
    const mindsetColour = await getCurrentMindsetColour() || NEUTRAL_MINDSET_COLOUR;

    return (<div className='w-screen h-screen' style={{
        backgroundImage: `linear-gradient(to bottom right, ${adjustLightness(mindsetColour, 0.5)}, ${adjustLightness(mindsetColour, 0.7)})`
        }}>
            <TopBar>
                {/* <SearchBar placeholder="Search tasks, projects, dates..." /> */}
            </TopBar>
            <Timeline mindsets={mindsets} />
            <BottomBar mindsetColour={mindsetColour} />
        </div>
    );
}
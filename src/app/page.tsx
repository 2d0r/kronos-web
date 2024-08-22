import React from 'react';
import TopBar from '@/components/ui/top-bar';
import BottomBar from '@/components/ui/bottom-bar';
import { NEUTRAL_MINDSET_COLOUR } from '@/lib/definitions';
import { adjustLightness } from '@/utils/colour-utils';
import Timeline from '@/components/timeline';
import { getCurrentMindsetColour } from '@/lib/data';
import SearchBar from '@/components/search';

export default async function Page() {

    const mindsetColour = await getCurrentMindsetColour() || NEUTRAL_MINDSET_COLOUR;

    return (<div className='w-screen h-screen' style={{
        backgroundImage: `linear-gradient(to bottom right, ${adjustLightness(mindsetColour, 0.5)}, ${adjustLightness(mindsetColour, 0.7)})`
        }}>
            <TopBar><SearchBar /></TopBar>
            <Timeline />
            <BottomBar />
        </div>
    );
}
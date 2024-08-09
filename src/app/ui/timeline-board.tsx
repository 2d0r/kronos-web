import { FC } from 'react';
import BottomBar from './bottom-bar';
import TopBar from './top-bar';
import { NEUTRAL_MINDSET_COLOUR, TaskWithRelations, URLSearchParamsKronos } from '../lib/definitions';
import SearchBar from './search';
import Menu from './menu';
import { adjustLightness } from '../utils/colourUtils';
import clsx from 'clsx';
import { Mindset } from '@prisma/client';

interface TimelineCardProps {
    children?: JSX.Element | JSX.Element[];
    searchParams: URLSearchParamsKronos;
    back?: boolean;
    cardClassName?: string;
    timelineClassName?: string;
    mindsets?: Mindset[];
    mindsetColour?: string;
    tasks?: TaskWithRelations[];
}

const TimelineCard: FC<TimelineCardProps> = async ({
    children, searchParams, back, cardClassName, timelineClassName, mindsets, mindsetColour, tasks,
}) => {

    // Modals
    const showMenu = searchParams?.menu;

    return (<div className={clsx(timelineClassName, 'w-screen h-screen flex flex-col gap-8 items-center justify-start pt-[20vh]')} style={{
        backgroundImage: `linear-gradient(to bottom right, ${adjustLightness(mindsetColour || NEUTRAL_MINDSET_COLOUR, 0.5)}, ${adjustLightness(mindsetColour || NEUTRAL_MINDSET_COLOUR, 0.7)})`
    }}>
        <TopBar searchParams={searchParams} back={back}><SearchBar placeholder='Search events, dates...'/></TopBar>
        {showMenu && <Menu mindsetColour={mindsetColour}/>}
        <div className={clsx(cardClassName, 'bg-white max-h-[70vh] rounded-3xl shadow-xl w-fit p-4 flex items-center justify-start')}>
            {/* <TaskCacheProvider tasks={tasks || []}> */}
                {children}
            {/* </TaskCacheProvider> */}
        </div>
        <BottomBar searchParams={searchParams}/>
    </div>);
}

export default TimelineCard;
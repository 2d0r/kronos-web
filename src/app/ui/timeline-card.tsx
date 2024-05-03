import { FC } from 'react';
import BottomBar from './bottom-bar';
import TopBar from './top-bar';
import { NEUTRAL_MINDSET_COLOUR, URLSearchParamsKronos } from '../lib/definitions';
import SearchBar from './search';
import Menu from './menu';
import CreateTask from './tasks/create-task';
import { adjustLightness } from '../utils/colourUtils';
import { getCurrentMindsetColour } from '../lib/data';

interface TimelineCardProps {
    children?: JSX.Element | JSX.Element[];
    searchParams: URLSearchParamsKronos;
    back?: boolean
}

const TimelineCard: FC<TimelineCardProps> = async ({children, searchParams, back }) => {
    const showMenu = searchParams?.menu;
    const showAddTask = searchParams?.addTask;
    const mindsetColour = await getCurrentMindsetColour();

    return (<div className='w-screen h-screen flex flex-col gap-8 items-center justify-start pt-[20vh]' style={{
        backgroundImage: `linear-gradient(to bottom right, ${adjustLightness(NEUTRAL_MINDSET_COLOUR, 0)}, ${adjustLightness(NEUTRAL_MINDSET_COLOUR, 0.3)})`
    }}>
        <TopBar searchParams={searchParams} back={back}><SearchBar placeholder='Search events, dates...'/></TopBar>
        {showMenu && <Menu />}
        {showAddTask && <CreateTask />}
        <div className='bg-white max-h-[70vh] rounded-3xl shadow-xl w-fit p-4 flex items-center justify-start'>
            {children}
        </div>
        <BottomBar searchParams={searchParams}/>
    </div>);
}

export default TimelineCard;
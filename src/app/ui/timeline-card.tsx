import { FC } from 'react';
import BottomBar from './bottom-bar';
import TopBar from './top-bar';
import { NEUTRAL_MINDSET_COLOUR, URLSearchParamsKronos } from '../lib/definitions';
import SearchBar from './search';
import Menu from './menu';
import CreateTask from './tasks/create-task';
import { adjustLightness } from '../utils/colourUtils';
import { fetchMindsets, getCurrentMindsetColour } from '../lib/data';
import TaskCard from './tasks/task-card';

interface TimelineCardProps {
    children?: JSX.Element | JSX.Element[];
    searchParams: URLSearchParamsKronos;
    back?: boolean
}

const TimelineCard: FC<TimelineCardProps> = async ({children, searchParams, back }) => {
    const mindsets = await fetchMindsets();
    const showMenu = searchParams?.menu;
    const showAddTask = searchParams?.editTask;
    const mindsetColour = await getCurrentMindsetColour();

    return (<div className='w-screen h-screen flex flex-col gap-8 items-center justify-start pt-[20vh]' style={{
        backgroundImage: `linear-gradient(to bottom right, ${adjustLightness(mindsetColour || NEUTRAL_MINDSET_COLOUR, 0)}, ${adjustLightness(mindsetColour || NEUTRAL_MINDSET_COLOUR, 0.3)})`
    }}>
        <TopBar searchParams={searchParams} back={back}><SearchBar placeholder='Search events, dates...'/></TopBar>
        {showMenu && <Menu mindsetColour={mindsetColour}/>}
        {showAddTask && <TaskCard mindsets={mindsets}/>}
        <div className='bg-white max-h-[70vh] rounded-3xl shadow-xl w-fit p-4 flex items-center justify-start'>
            {children}
        </div>
        <BottomBar searchParams={searchParams}/>
    </div>);
}

export default TimelineCard;
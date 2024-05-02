import { FC } from 'react';
import BottomBar from './bottom-bar';
import TopBar from './top-bar';
import { URLSearchParamsKronos } from '../lib/definitions';
import SearchBar from './search';
import Menu from './menu';
import CreateTask from './tasks/create-task';

interface TimelineCardProps {
    children?: JSX.Element | JSX.Element[];
    searchParams: URLSearchParamsKronos;
    back?: boolean
}

const TimelineCard: FC<TimelineCardProps> = ({children, searchParams, back }) => {
    const showMenu = searchParams?.menu;
    const showAddTask = searchParams?.showAddTask;

    return (<div className='w-screen h-screen bg-gradient-to-br from-violet-200 to-violet-400 flex flex-col gap-8 items-center justify-start pt-[20vh]'>
        <TopBar searchParams={searchParams} back={back}><SearchBar placeholder='Search events, dates...'/></TopBar>
        {/* {showMenu && <Menu />}
        {showAddTask && <CreateTask />} */}
        <div className='bg-white max-h-[70vh] rounded-3xl shadow-xl w-fit p-4 flex items-center justify-start'>
            {children}
        </div>
        <BottomBar searchParams={searchParams}/>
    </div>);
}

export default TimelineCard;
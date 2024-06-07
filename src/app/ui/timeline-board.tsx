import { FC, useState } from 'react';
import BottomBar from './bottom-bar';
import TopBar from './top-bar';
import { NEUTRAL_MINDSET_COLOUR, TaskWithRelations, URLSearchParamsKronos } from '../lib/definitions';
import SearchBar from './search';
import Menu from './menu';
import { adjustLightness } from '../utils/colourUtils';
import { fetchMindsets, getCurrentMindsetColour } from '../lib/data';
import TaskCard from './tasks/task-card';
import clsx from 'clsx';
import { Mindset } from '@prisma/client';
import { TaskCacheProvider } from '@/components/task-context';

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
    // const [ tasksCache, setTasksCache ] = useState<TaskWithRelations[]>(tasks);

    // Modals
    const showMenu = searchParams?.menu;
    // const showTaskCard = !!searchParams.task;
    // const taskToEditId = searchParams.task;
    // const taskToEdit = taskToEditId === 'new' ? {} as TaskWithRelations : tasksCache.filter(el => el.id === taskToEditId)[0];

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
        {/* {showTaskCard && 
            <TaskCard 
                task={taskToEdit} 
                mindsets={mindsets} 
                onTaskUpdate={handleTaskUpdate}
                onTaskCreate={handleTaskCreate}
                onTaskDelete={handleTaskDelete} 
        />} */}
    </div>);
}

export default TimelineCard;
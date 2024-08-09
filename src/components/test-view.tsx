'use client';

import { FC, useState, useEffect } from 'react';
import BottomBar from '@/app/ui/bottom-bar';
import TopBar from '@/app/ui/top-bar';
import { ActionType, EventWithRelations, NEUTRAL_MINDSET_COLOUR, TaskWithRelations, URLSearchParamsKronos } from '@/app/lib/definitions';
import SearchBar from '@/app/ui/search';
import Menu from '@/app/ui/menu';
import { adjustLightness } from '@/app/utils/colourUtils';
import TaskCard from '@/app/ui/tasks/task-card';
import clsx from 'clsx';
import { Event } from '@prisma/client';
import CalendarComponent from '@/app/ui/calendar/calendar-hexaflexa';
import TaskBrowser from '@/app/ui/browser/task-browser';
import { MindsetWithRelations } from '@/app/lib/definitions';
import Button from './button';
import { deleteAllEvents } from '@/app/lib/actions';
import { addDaysToDate } from '@/app/utils/dateUtils';
import { organiseTimespan } from '@/app/lib/organise-timespan';
import { fetchEvents, fetchTask, fetchTasks, fetchUpdatedTaskEvents } from '@/app/lib/data';

interface TestViewProps {
    children?: JSX.Element | JSX.Element[];
    searchParams: URLSearchParamsKronos;
    back?: boolean;
    mindsets: MindsetWithRelations[];
    mindsetColour: string;
    tasks: TaskWithRelations[];
    events: EventWithRelations[];
}

const TestView: FC<TestViewProps> = ({
    searchParams, back, mindsets, mindsetColour, tasks, events,
}) => {

    const [ tasksCache, setTasksCache ] = useState<TaskWithRelations[]>(tasks);
    const [ eventsCache, setEventsCache ] = useState<Event[]>(events);
    

    // MODALS

    const showMenu = searchParams?.menu;
    const showTaskCard = !!searchParams.task;


    // DATA FETCH


    // HANDLERS

    const handleTaskUpdate = async (taskId: string, action: ActionType) => {
        switch(action) {
            case 'create':
                const newTask = await fetchTask(taskId);
                setTasksCache(prevCache => ([ ...prevCache, newTask ]));
            case 'delete':
                if (tasksCache.length)
                    setTasksCache(prevCache => prevCache.filter(task => task.id !== taskId));
            case 'edit':
                const editedTask = await fetchTask(taskId);
                setTasksCache(prevCache => ([ ...prevCache.filter(task => task.id !== taskId), editedTask ]));
        }
        const newEvents = await fetchUpdatedTaskEvents(taskId);
        setEventsCache(prevEvents => [...prevEvents, ...newEvents]);
    }
    const handleDeleteAllEvents = async () => {
        await deleteAllEvents();
        const newEvents = await fetchEvents();
        setEventsCache(newEvents);
    }
    const handleOrganise = async (daysAhead: number = 30) => {
        const currentTime = new Date();
        const xDaysFromNow = addDaysToDate(currentTime, daysAhead);
        await organiseTimespan({
            timespan: [currentTime, xDaysFromNow],
            // eventsToSchedule: [
            //     { taskId: '6d955a12-031e-4085-91a0-8a71d6b801cd', count: 0 },
            //     { taskId: '7d299836-67e2-482e-bac8-da6fb5ec8708', count: 2 },
            // ],
            // displaceAllFlexEvents: false,
        });
        setTimeout(async () => {
            const newEvents = await fetchEvents();
            setEventsCache(newEvents);
            const newTasks = await fetchTasks();
            setTasksCache(newTasks);
        }, 1000);
    }



    return (<div className={clsx('pt-[10vh] pb-[10vh] overflow-scroll w-screen h-screen flex flex-col gap-8 items-center justify-start')} style={{
        backgroundImage: `linear-gradient(to bottom right, ${adjustLightness(mindsetColour || NEUTRAL_MINDSET_COLOUR, 0.5)}, ${adjustLightness(mindsetColour || NEUTRAL_MINDSET_COLOUR, 0.7)})`
    }}>
        <TopBar searchParams={searchParams} back={back}>
            {/* <SearchBar placeholder='Search events, dates...'/> */}
        </TopBar>
        {showMenu && <Menu mindsetColour={mindsetColour}/>}
        <div className={clsx('max-h-none z-[39] bg-white rounded-3xl shadow-xl w-fit p-4 flex flex-col gap-4 items-center justify-start')}>
            <div className='h-[60vh] w-[80vw]'>
                <CalendarComponent 
                    events={eventsCache} 
                    mindsetColour={mindsetColour || NEUTRAL_MINDSET_COLOUR} 
                    mindsets={mindsets} 
                    startWeekToday={true} 
                    parentName='TestView'
                />
            </div>
            <TaskBrowser 
                tasks={tasksCache} 
                mindsets={mindsets} 
                mindsetColour={mindsetColour || NEUTRAL_MINDSET_COLOUR}
                searchParams={searchParams}
                parentName='TestView'
            />
            <div className='container w-full flex flex-row gap-8 p-4 justify-center'>
                <Button 
                    className='rounded-md bg-gray-400 from-neutral-950 p-6 w-1/4' 
                    onClick={() => handleOrganise(7)}
                    >Organise this week
                </Button>
                <Button 
                    className='rounded-md bg-gray-400 from-neutral-950 p-6 w-1/4' 
                    onClick={handleDeleteAllEvents}
                    >Delete all events
                </Button>
                {/* <Button className='rounded-md bg-gray-400 from-neutral-950 p-6 w-1/4' onClick={() => handleOrganise(7)}>Organise for 7 days</Button> */}
            </div>
        </div>
        {showTaskCard && 
            <TaskCard 
                // task={taskToEdit} 
                mindsets={mindsets}
                onTaskUpdate={(taskId, action) => handleTaskUpdate(taskId, action)}
        />}
        <BottomBar searchParams={searchParams} mindsetColour={mindsetColour} />
    </div>)
}

export default TestView;
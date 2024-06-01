'use client';

import { FC, useEffect, useState } from 'react';
import BottomBar from '@/app/ui/bottom-bar';
import TopBar from '@/app/ui/top-bar';
import { EventWithRelations, NEUTRAL_MINDSET_COLOUR, TaskWithRelations, URLSearchParamsKronos } from '@/app/lib/definitions';
import SearchBar from '@/app/ui/search';
import Menu from '@/app/ui/menu';
import { adjustLightness } from '@/app/utils/colourUtils';
import TaskCard from '@/app/ui/tasks/task-card';
import clsx from 'clsx';
import { Event, Status, TaskType } from '@prisma/client';
import CalendarComponent from '@/app/ui/calendar/calendar-hexaflexa';
import TaskBrowser from '@/app/ui/browser/task-browser';
import { MindsetWithRelations } from '@/app/lib/definitions';
import Button from './button';
import { deleteAllEvents } from '@/app/lib/actions';
import { addDaysToDate, getZonedNow } from '@/app/utils/dateUtils';
import { organiseByIdealTimeFirst } from '@/app/lib/organiser-idealFirst';

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
    const showTaskCard = !!searchParams.editTask;
    const taskToEditId = searchParams.editTask;
    const taskToEdit = taskToEditId === 'new' ? {} as TaskWithRelations : tasksCache.filter(el => el.id === taskToEditId)[0];


    // DATA FETCH

    const fetchEvents = async () => {
        const response = await fetch('/event');
        const data = await response.json();
        const newEvents = data.events;
        return newEvents;
    }


    // HANDLERS

    const handleEventUpdate = (taskId: string) => {
        setTimeout(async () => {
            const response = await fetch(`/event/${taskId}`);
            const data = await response.json();
            const newEvents = data.events;
            setEventsCache(prevEvents => [...prevEvents, ...newEvents]);
        }, 1000);
    }
    const handleTaskUpdate = (newTask: TaskWithRelations) => {
        const newTasksCache = tasksCache.map(task => {
            return task.id === newTask.id ? {...task, ...newTask} : task;
        });
        setTasksCache(newTasksCache);
        handleEventUpdate(newTask.id);
    }
    const handleTaskCreate = (newTask: TaskWithRelations) => {
        const newTasksCache = [...tasksCache, {
            ...newTask,
            status: 'toDo' as Status,
            type: 'task' as TaskType,
        }];
        setTasksCache(newTasksCache);
        handleEventUpdate(newTask.id);
    }
    const handleTaskDelete = async (taskId: string) => {
        await fetch(`/task/${taskId}`, {
            method: 'DELETE'
        });
        const newTasksCache = tasksCache.filter(task => task.id !== taskId);
        setTasksCache(newTasksCache);
        handleEventUpdate(taskId);
    }
    const handleDeleteAllEvents = async () => {
        await deleteAllEvents();
        const newEvents = await fetchEvents();
        setEventsCache(newEvents);
    }
    const handleOrganise = async (daysAhead: number = 30) => {
        const currentTime = getZonedNow('Europe/Bucharest');
        console.log('organiser - 1. timespanStart', currentTime);
        const xDaysFromNow = addDaysToDate(currentTime, daysAhead);
        await organiseByIdealTimeFirst([currentTime, xDaysFromNow]);
        setTimeout(async () => {
            const newEvents = await fetchEvents();
            setEventsCache(newEvents);
        }, 1000)
    }


    // HOOKS

    // useEffect(() => {
    //     console.log('testView - tasksCache', tasksCache);
    // }, [tasksCache])
    // useEffect(() => {
    //     console.log('testView - eventsCache', eventsCache);
    // }, [eventsCache])


    return (<div className={clsx('pt-[10vh] pb-[10vh] overflow-scroll w-screen h-screen flex flex-col gap-8 items-center justify-start')} style={{
        backgroundImage: `linear-gradient(to bottom right, ${adjustLightness(mindsetColour || NEUTRAL_MINDSET_COLOUR, 0.5)}, ${adjustLightness(mindsetColour || NEUTRAL_MINDSET_COLOUR, 0.7)})`
    }}>
        <TopBar searchParams={searchParams} back={back}><SearchBar placeholder='Search events, dates...'/></TopBar>
        {showMenu && <Menu mindsetColour={mindsetColour}/>}
        {/* {showTaskCard && <TaskCard mindsets={mindsets}/>} */}
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
                task={taskToEdit} 
                mindsets={mindsets} 
                onTaskUpdate={handleTaskUpdate}
                onTaskCreate={handleTaskCreate}
                onTaskDelete={handleTaskDelete} 
        />}
        <BottomBar searchParams={searchParams} mindsetColour={mindsetColour} />
    </div>)
}

export default TestView;
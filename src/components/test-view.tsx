'use client';

import { FC, useState } from 'react';
import BottomBar from '@/components/ui/bottom-bar';
import TopBar from '@/components/ui/top-bar';
import { ActionType, EventWithRelations, NEUTRAL_MINDSET_COLOUR, TaskWithRelations } from '@/lib/definitions';import { adjustLightness } from '@/utils/colourUtils';
import TaskCard from '@/components/tasks/task-card';
import clsx from 'clsx';
import { Event } from '@prisma/client';
import CalendarComponent from '@/components/calendar/calendar-hexaflexa';
import TaskBrowser from '@/components/browser/task-browser';
import { MindsetWithRelations } from '@/lib/definitions';
import Button from './buttons/button';
import { deleteAllEvents } from '@/lib/actions';
import { addDaysToDate } from '@/utils/dateUtils';
import { organiseTimespan } from '@/lib/organise-timespan';
import { fetchEvents, fetchTask, fetchTasks, fetchUpcomingEvents, fetchUpdatedTaskEvents } from '@/lib/data';
import { useSearchParams } from 'next/navigation';

interface TestViewProps {
    children?: JSX.Element | JSX.Element[];
    back?: boolean;
    mindsets: MindsetWithRelations[];
    mindsetColour: string;
    tasks: TaskWithRelations[];
    events: EventWithRelations[];
}

const TestView: FC<TestViewProps> = ({
    back, mindsets, mindsetColour, tasks, events,
}) => {

    const [ tasksCache, setTasksCache ] = useState<TaskWithRelations[]>(tasks);
    const [ eventsCache, setEventsCache ] = useState<Event[]>(events);
    const [ newEventsCache, setNewEventsCache ] = useState<Event[]>([]);
    

    // MODALS

    const searchParams = useSearchParams();
    const showTaskCard = !!searchParams.get('task');


    // HANDLERS

    const handleTaskUpdate = async (taskId: string, action: ActionType) => {
        switch(action) {
            case 'create':
                const newTask = await fetchTask(taskId);
                setTasksCache(prevCache => ([ ...prevCache, newTask ]));
                break;
            case 'delete':
                if (tasksCache.length) {
                    setTasksCache(prevCache => prevCache.filter(task => task?.id !== taskId));
                }
                break;
            case 'edit':
                const editedTask = await fetchTask(taskId);
                // console.log('testView/hadnleTaskUpdate/edit', editedTask.name);
                setTasksCache(prevCache => ([ ...prevCache.filter(task => task.id !== taskId), editedTask ]));
                break;
        }
        // Get new events and pass them to the Calendar Component
        const newEvents = await fetchEvents();
        setEventsCache(newEvents);
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
        <TopBar back={back}>
            {/* <SearchBar placeholder='Search events, dates...'/> */}
        </TopBar>
        <div className={clsx('max-h-none z-[39] bg-white rounded-3xl shadow-xl w-fit p-4 flex flex-col gap-4 items-center justify-start')}>
            <div className='h-[60vh] w-[80vw]'>
                <CalendarComponent 
                    initialEvents={eventsCache}
                    mindsetColour={mindsetColour || NEUTRAL_MINDSET_COLOUR} 
                    mindsets={mindsets} 
                    startWeekToday={true}
                />
            </div>
            <TaskBrowser 
                initialTasks={tasksCache} 
                mindsets={mindsets} 
                mindsetColour={mindsetColour || NEUTRAL_MINDSET_COLOUR}
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
            </div>
        </div>
        {showTaskCard && 
            <TaskCard 
                mindsets={mindsets}
                onTaskUpdate={(taskId, action) => handleTaskUpdate(taskId, action)}
            />
        }
        <BottomBar mindsetColour={mindsetColour} />
    </div>)
}

export default TestView;
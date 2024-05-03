import React from 'react';
import { fetchTasks, getEventMindset } from '../lib/data';
import TopBar from '../ui/top-bar';
import EventCard from '../ui/tasks/event-card';
import BottomBar from '../ui/bottom-bar';
import { EventWithRelations, URLSearchParamsKronos } from '../lib/definitions';
import TransportControls from '../ui/tasks/transport-controls';
import Menu from '../ui/menu';
import CreateTask from '../ui/tasks/create-task';
import prisma from '../lib/db';
import { Task } from '@prisma/client';
import { adjustLightness } from '../utils/colourUtils';

export default async function Page({ searchParams }: {searchParams: URLSearchParamsKronos}) {
    const tasks = await fetchTasks();
    const events: EventWithRelations[] = await prisma.event.findMany({
        include: {
            task: true
        }
    });
    const eventQueue = events.filter(event => event.startTime > new Date());
    const taskQueue = eventQueue.map(event => event.task as Task);
    const showAddTask = searchParams?.addTask;
    const showMenu = searchParams?.menu;
    const nextMindset = await getEventMindset(eventQueue[0]);

    return (<div className='w-screen h-screen' style={{
        backgroundImage: `linear-gradient(to bottom right, ${adjustLightness(nextMindset.colour, 0.5)}, ${adjustLightness(nextMindset.colour, 0.7)})`
    }}>
        <TopBar searchParams={searchParams}/>
        { showAddTask && <CreateTask />}
        <div className='w-full h-full flex flex-col items-center justify-center'>
            {showMenu && <Menu mindsetColour={nextMindset.colour} />}
            {eventQueue.length > 0 && 
                <div className='w-full items-center justify-center flex flex-col gap-4'>
                    <EventCard event={eventQueue[0]} task={taskQueue[0]} />
                    {!showMenu && <TransportControls eventId={eventQueue[0].id} mindsetColour={nextMindset.colour} context='timeline'/>}
                </div>
            }
            {(eventQueue.length > 1 && !showMenu) &&
                <EventCard event={eventQueue[1]} task={taskQueue[1]} nextTask={true} />
            }

        </div>
        <BottomBar searchParams={searchParams} mindsetColour={nextMindset.colour} />
        
    </div>);
}
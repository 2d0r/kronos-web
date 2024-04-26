import React, { useEffect, useState } from 'react';
import { fetchEvents, fetchTasksPrisma } from '../lib/data';
import TopBar from '../ui/top-bar';
import EventCard from '../ui/tasks/event-card';
import BottomBar from '../ui/bottom-bar';
import { CARD_SCALES, EventWithRelations, SMALL_CARD_HEIGHT, SearchParamProps, URLSearchParamsKronos } from '../lib/definitions';
import TransportControls from '../ui/tasks/transport-controls';
import Menu from '../ui/menu';
import CreateTask from '../ui/tasks/create-task';
import prisma from '../lib/db';
import { Event, Task } from '@prisma/client';

export default async function Page({ searchParams }: {searchParams: URLSearchParamsKronos}) {
    const tasks = await fetchTasksPrisma();
    const events: EventWithRelations[] = await prisma.event.findMany({
        include: {
            task: true
        }
    });
    const eventQueue = events.filter(event => event.startTime > new Date());
    const taskQueue = eventQueue.map(event => event.task as Task);
    const showAddTask = searchParams?.showAddTask;
    const showMenu = searchParams?.showMenu;

    return (<div className='w-screen h-screen bg-gradient-to-br from-violet-200 to-violet-400'>
        <TopBar searchParams={searchParams}/>
        { showAddTask && <CreateTask />}
        <div className='w-full h-full flex flex-col items-center justify-center'>
            {showMenu && <Menu />}
            {eventQueue.length > 0 && 
                <div className='w-full items-center justify-center flex flex-col gap-4'>
                    <EventCard event={eventQueue[0]} task={taskQueue[0]} />
                    <TransportControls eventId={eventQueue[0].id} context='timeline'/>
                </div>
            }
            {eventQueue.length > 1 &&
                <EventCard event={eventQueue[1]} task={taskQueue[1]} className='fixed bottom-[-10px] mb-[-45px] bg-gradient-to-br from-gray-400 to-gray-600 opacity-70'/>
            }

        </div>
        <BottomBar searchParams={searchParams}/>
        
    </div>);
}
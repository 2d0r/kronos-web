import { fetchTasksPrisma } from '@/app/lib/data';
import { CARD_SCALES, EventWithRelations, SearchParamProps, URLSearchParamsKronos } from '@/app/lib/definitions';
import { whiteGlassBg, wireCard } from '@/app/lib/styles';
import BottomBar from '@/app/ui/bottom-bar';
import Menu from '@/app/ui/menu';
import CreateTask from '@/app/ui/tasks/create-task';
import EventCard from '@/app/ui/tasks/event-card';
import TransportControls from '@/app/ui/tasks/transport-controls';
import TopBar from '@/app/ui/top-bar';
import clsx from 'clsx';
import React from 'react';
import prisma from '@/app/lib/db';
import { Task, Event } from '@prisma/client';
import { dateToHHMM, minutesBetweenDates, minutesToDisplayDuration } from '@/app/utils/dateUtils';

export default async function Page({ searchParams }: {searchParams: URLSearchParamsKronos}) {
    const eventId = searchParams.eventId;
    // const event = await prisma.event.findUnique({
    //     include: {
    //         task: true
    //     },
    //     where: {
    //         id: eventId
    //     }
    // });
    // const task = event?.task;
    const events: EventWithRelations[] = await prisma.event.findMany({
        include: {
            task: true
        }
    });
    const eventQueue = events.filter(event => event.startTime >= new Date());
    const taskQueue = eventQueue.map(event => event.task as Task);
    const showAddTask = searchParams?.showAddTask;
    const[event, nextEvent] = eventQueue.length > 1 ? eventQueue : [eventQueue[0], {} as Event];

    return (<div className='w-screen h-screen bg-gradient-to-br from-violet-500 to-violet-800 text-white flex justify-center'>
        <TopBar searchParams={searchParams}/>
        {showAddTask && <CreateTask />}
        <div className='w-full h-full content-center justify-center flex flex-row text-center'>
            {/* Left space */}
            <div className='h-full w-1/3 flex flex-col items-end justify-center'>
                <div className={clsx(
                        wireCard, 'p-3 w-5/6'
                    )}>
                        <textarea 
                            className='w-full bg-transparent border-0 placeholder:text-white/40 focus:outline-none focus:outline-0'
                            placeholder={'Add notes'}
                        />
                </div>
            </div>
            {/* Timer */}
            <div className='h-full w-1/3 flex flex-col items-center justify-around'>
                <div>{event ? dateToHHMM(event.startTime) : ''}</div>
                <div className={clsx('w-1/3 max-w-[400px] min-w-[240px] h-1/2 flex flex-col justify-between items-center py-6', whiteGlassBg, wireCard)}>
                    <div>
                        <div className='text-3xl'>{event.name}</div>
                        <div className='text-sm'>{minutesToDisplayDuration(minutesBetweenDates(event.startTime, event.endTime))}</div>
                    </div>
                    <div className={`border-[10px] border-white rounded-full w-5/6 aspect-square
                        flex flex-col items-center justify-center gap-1
                        `}
                    >
                        <div className='text-3xl'>2h</div>
                        <div className='text-xs'>LEFT</div>
                    </div>
                    <TransportControls eventId={eventId} context='taskPage' className='w-5/6'/>
                </div>
                <div>{event ? dateToHHMM(event.endTime) : ''}</div>
            </div>
            {/* Right space */}
            <div className='h-full w-1/3 flex flex-col items-start justify-center'>
                <div className={clsx(
                    wireCard, 'p-3 w-5/6'
                )}>
                    <textarea 
                        className='w-full bg-transparent border-0 placeholder:text-white/40 focus:outline-none focus:outline-0'
                        placeholder={'Add item'}
                    />
                </div>
            </div>
        </div>
        {/* Next task */}
        {(eventQueue.length > 1 && minutesBetweenDates(new Date(), nextEvent.startTime) < 30) && 
            <EventCard event={nextEvent} task={taskQueue[1]} nextTask={true}  className='fixed bottom-[-10px] mb-[-45px] drop-shadow-2xl drop-shadow-white'/>
        }
        <BottomBar searchParams={searchParams}/>
        { searchParams?.menu && <>
            <Menu />
        </>}  
    </div> 
    );
}
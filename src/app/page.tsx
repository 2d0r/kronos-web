import React from 'react';
import { getMindsets, fetchTaskWithRelations, getCurrentMindsetColour } from '@/lib/data';
import TopBar from '@/components/ui/top-bar';
import EventCard from '@/components/event-card';
import BottomBar from '@/components/ui/bottom-bar';
import { EventWithRelations, NEUTRAL_MINDSET_COLOUR, URLSearchParamsKronos } from '@/lib/definitions';
import TransportControls from '@/components/buttons/transport-controls';
import Menu from '@/components/menu';
import prisma from '@/lib/db';
import { Task } from '@prisma/client';
import { adjustLightness } from '@/utils/colourUtils';
import TaskCard from '@/components/tasks/task-card';
import Link from 'next/link';

export default async function Page({ searchParams }: {searchParams: URLSearchParamsKronos}) {
    const showTaskCard = searchParams?.task;
    const showMenu = searchParams?.menu;

    const mindsets = await getMindsets();
    const events: EventWithRelations[] = await prisma.event.findMany({
        include: {
            task: true
        }
    });
    const eventQueue = events.filter(event => event.startTime > new Date());
    const taskQueue = eventQueue.map(event => event.task as Task);
    const currentTask = taskQueue.length ? await fetchTaskWithRelations(taskQueue[0].id) : undefined;
    
    const mindsetColour = await getCurrentMindsetColour() || NEUTRAL_MINDSET_COLOUR;
    const mindsetQueue = taskQueue.map(task => {
        return mindsets.filter((el: any) => el.id === task.mindsetId)[0];
    })

    return (<div className='w-screen h-screen' style={{
        backgroundImage: `linear-gradient(to bottom right, ${adjustLightness(mindsetColour, 0.5)}, ${adjustLightness(mindsetColour, 0.7)})`
    }}>
        <TopBar searchParams={searchParams}>
            {/* <SearchBar placeholder="Search tasks, projects, dates..." /> */}
        </TopBar>
        { showTaskCard && <TaskCard mindsets={mindsets} onTaskUpdate={() => {}} />}
        <div className='w-full h-full flex flex-col items-center justify-center'>
            {showMenu && <Menu mindsetColour={mindsetColour} />}
            {/* Next event */}
            {eventQueue.length > 0 && 
                <div className='w-full items-center justify-center flex flex-col gap-4'>
                    {(!showMenu && currentTask) && (<>
                        <Link href={`?task=${currentTask.id}&event=${eventQueue[0].id}`} >
                            <EventCard event={eventQueue[0]} task={taskQueue[0]} mindset={mindsetQueue[0]} />
                        </Link>
                        <TransportControls eventId={eventQueue[0].id} taskId={currentTask.id} mindsetColour={mindsetColour} context='timeline'/>
                    </>)}
                </div>
            }
            {/* Later event */}
            {!!eventQueue.length && (
                (eventQueue.length > 1 && !showMenu) ?
                    <EventCard nextTask={true}
                        event={eventQueue[1]} 
                        task={eventQueue[1].task}
                        mindset={mindsetQueue[1]} 
                    /> : showMenu ? <EventCard nextTask={true}
                        event={eventQueue[0]} 
                        task={eventQueue[0].task}
                        mindset={mindsetQueue[0]} 
                    /> : <></>
                )
            }

        </div>
        <BottomBar searchParams={searchParams} mindsetColour={mindsetColour} />
        
    </div>);
}
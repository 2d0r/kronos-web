import React from 'react';
import { fetchMindsets, fetchTaskWithRelations, fetchTasks, fetchTasksWithRelations, getCurrentMindsetColour } from '../lib/data';
import TopBar from '../ui/top-bar';
import EventCard from '../ui/tasks/event-card';
import BottomBar from '../ui/bottom-bar';
import { EventWithRelations, NEUTRAL_MINDSET_COLOUR, TaskWithRelations, URLSearchParamsKronos } from '../lib/definitions';
import TransportControls from '../ui/tasks/transport-controls';
import Menu from '../ui/menu';
import CreateTask from '../ui/tasks/create-task';
import prisma from '../lib/db';
import { Task } from '@prisma/client';
import { adjustLightness } from '../utils/colourUtils';
import SearchBar from '../ui/search';
import EditTask from '../ui/tasks/edit-task';

export default async function Page({ searchParams }: {searchParams: URLSearchParamsKronos}) {
    const showAddTask = searchParams?.addTask;
    const showMenu = searchParams?.menu;
    const showEditTask = searchParams?.editTask;

    const mindsets = await fetchMindsets();
    const events: EventWithRelations[] = await prisma.event.findMany({
        include: {
            task: true
        }
    });
    const eventQueue = events.filter(event => event.startTime > new Date());
    const taskQueue = eventQueue.map(event => event.task as Task);
    const currentTask = await fetchTaskWithRelations(taskQueue[0].id);
    
    const mindsetColour = await getCurrentMindsetColour() || NEUTRAL_MINDSET_COLOUR;
    const mindsetQueue = taskQueue.map(task => {
        return mindsets.filter(el => el.id === task.mindsetId)[0];
    })

    return (<div className='w-screen h-screen' style={{
        backgroundImage: `linear-gradient(to bottom right, ${adjustLightness(mindsetColour, 0.5)}, ${adjustLightness(mindsetColour, 0.7)})`
    }}>
        <TopBar searchParams={searchParams}>
            <SearchBar placeholder="Search tasks, projects, dates..." />
        </TopBar>
        { showAddTask && <CreateTask mindsets={mindsets} />}
        { showEditTask && <EditTask task={currentTask} mindsets={mindsets} />}
        <div className='w-full h-full flex flex-col items-center justify-center'>
            {showMenu && <Menu mindsetColour={mindsetColour} />}
            {eventQueue.length > 0 && 
                <div className='w-full items-center justify-center flex flex-col gap-4'>
                    {!showMenu && (<>
                        <EventCard event={eventQueue[0]} task={taskQueue[0]} mindset={mindsetQueue[0]} expand={true} />
                        <TransportControls eventId={eventQueue[0].id} mindsetColour={mindsetColour} context='timeline'/>
                    </>)}
                </div>
            }
            {(eventQueue.length > 1 && !showMenu) ?
                <EventCard nextTask={true}
                    event={eventQueue[1]} 
                    task={eventQueue[1].task}
                    mindset={mindsetQueue[1]} 
                /> : showMenu ? <EventCard nextTask={true}
                    event={eventQueue[0]} 
                    task={eventQueue[0].task}
                    mindset={mindsetQueue[0]} 
                /> : <></>
            }

        </div>
        <BottomBar searchParams={searchParams} mindsetColour={mindsetColour} />
        
    </div>);
}
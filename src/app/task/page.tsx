import { getEventsWithRelations, getMindsets, getEventMindset } from '@/lib/data';
import { EventWithRelations, TaskWithRelations, URLSearchParamsKronos } from '@/lib/definitions';
import BottomBar from '@/components/ui/bottom-bar';
import Menu from '@/components/menu';
import EventCard from '@/components/event-card';
import TopBar from '@/components/ui/top-bar';
import clsx from 'clsx';
import React from 'react';
import { Task, Event } from '@prisma/client';
import { dateToHHMM, minutesBetweenDates, minutesToDisplayDuration } from '@/utils/dateUtils';
import { adjustLightness } from '@/utils/colourUtils';
import NotesEditor from '@/components/notes-editor/notes-editor';
import ChecklistEditor from '@/components/notes-editor/checklist-editor';
import CircleTimer from '@/components/circle-timer';
import TaskCard from '@/components/tasks/task-card';
import { useSearchParams } from 'next/navigation';

export default async function Page() {
    const searchParams = useSearchParams();
    const showTaskCard = searchParams.get('task');
    const showMenu = searchParams.get('menu');

    const events = await getEventsWithRelations();
    const eventQueue = events.filter(event => event.endTime >= new Date());
    const [currentEvent, nextEvent] = eventQueue.length > 1 ? eventQueue : [eventQueue[0], {} as EventWithRelations];
    const taskQueue = eventQueue.map(event => event.task as TaskWithRelations);
    const currentTask = taskQueue[0];
    const eventMindset = await getEventMindset(currentEvent);
    const nextEventMindset = await getEventMindset(nextEvent);
    const mindsets = await getMindsets();

    return (<div className='w-screen h-screen text-white flex justify-center'
        style={{
            backgroundImage: `linear-gradient(to bottom left, ${adjustLightness(eventMindset.colour, 0.2)}, ${adjustLightness(eventMindset.colour, -0.2)})`
        }}>
        <TopBar/>
        {showTaskCard && <TaskCard mindsets={mindsets} onTaskUpdate={() => {}}/>}
        {showMenu && <Menu />}
        <div className='w-full h-full content-center justify-center flex flex-row text-center'>
            {/* Left area */}
            <div className='h-full w-1/3 flex flex-col items-end justify-center'>
                <div className='wireCard w-5/6 min-h-[16vh] max-h-[50vh] overflow-scroll'>
                    <NotesEditor 
                        notes={currentTask.notes || ''} 
                        taskId={currentTask.id} 
                        className='doing-task'
                    />
                </div>
            </div>
            {/* Central widget */}
            <div className='h-full w-1/3 flex flex-col items-center justify-around'>
                <div>{currentEvent ? dateToHHMM(currentEvent.startTime) : ''}</div>
                <div className='whiteGlassBg wireCard w-1/3 max-w-[400px] min-w-[240px] h-1/2 flex flex-col justify-between items-center py-6'>
                    <div>
                        <div className='text-3xl'>{currentEvent.name}</div>
                        <div className='text-sm'>{minutesToDisplayDuration(minutesBetweenDates(currentEvent.startTime, currentEvent.endTime))}</div>
                    </div>
                    <CircleTimer duration={minutesBetweenDates(currentEvent.startTime, currentEvent.endTime)}/>
                </div>
                <div>{currentEvent ? dateToHHMM(currentEvent.endTime) : ''}</div>
            </div>
            {/* Right area */}
            <div className='h-full w-1/3 flex flex-col items-start justify-center'>
                <div className='wireCard p-4 w-5/6 min-h-[16vh] max-h-[50vh]'>
                    <ChecklistEditor checklist={currentTask.checklist || ''} taskId={currentTask.id} className='doing-task' />
                </div>
            </div>
        </div>
        {/* Next task */}
        {(eventQueue.length > 1 && minutesBetweenDates(new Date(), nextEvent.startTime) < 30) && 
            <EventCard event={nextEvent} mindset={nextEventMindset} nextEvent={true}  className='fixed bottom-[-10px] mb-[-45px] drop-shadow-2xl drop-shadow-white'/>
        }
        <BottomBar/>
    </div> 
    );
}
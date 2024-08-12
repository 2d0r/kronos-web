'use client';

import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import TaskCard from './tasks/task-card';
import EventCard from './event-card';
import Link from 'next/link';
import Menu from './menu';
import TransportControls from './buttons/transport-controls';
import { Mindset, Task } from '@prisma/client';
import { fetchEvents, fetchTaskOfEvent, fetchUpcomingEvents, getCurrentMindsetColour, getUpcomingEvents } from '@/lib/data';
import { EventWithRelations, NEUTRAL_MINDSET_COLOUR, QUEUE_LENGTH, TaskWithRelations } from '@/lib/definitions';
import { convertPropsToDate } from '@/utils/dateUtils';

interface TimelineProps {
    mindsets: Mindset[];
}

export default function Timeline({ mindsets } : TimelineProps) {

    const searchParams = useSearchParams();
    const showTaskCard = !!searchParams.get('task');
    const showMenu = !!searchParams.get('menu');

    const [ eventQueue, setEventQueue ] = useState<EventWithRelations[]>([]);
    const [ taskQueue, setTaskQueue ] = useState<Task[]>([]);
    const [ mindsetQueue, setMindsetQueue ] = useState<Mindset[]>([]);
    const [ mindsetColour, setMindsetColour ] = useState<string>(NEUTRAL_MINDSET_COLOUR);

    const handleEventsPassing = async () => {
        // const eventsData = await fetchUpcomingEvents(QUEUE_LENGTH);
        const eventsData = await fetchEvents();
        const upcomingEvents = eventsData.map(event => convertPropsToDate(event))
            .filter((event: any) => event.startTime >= new Date());

        console.log('eventsData', eventsData);

        const newEventsQueue = upcomingEvents.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        setEventQueue(newEventsQueue);

        console.log('newEventsQueue', newEventsQueue);

        setTaskQueue(newEventsQueue.map(event => event.task as Task));

        const newMindsetQueue = newEventsQueue.map(event => mindsets.find(el => el.id === event.task.mindsetId) || {} as Mindset);
        setMindsetQueue(newMindsetQueue);

        console.log('newMindsetQueue', newMindsetQueue);

        setMindsetColour(newMindsetQueue[0].colour || NEUTRAL_MINDSET_COLOUR);
    }

    // setInterval(handleEventsPassing, 300000); // 5 minutes

    useEffect(() => {
        handleEventsPassing();
    }, []);
    useEffect(() => {
        console.log('eventQueue', eventQueue);
    }, [eventQueue]);

    return (<>
        { showTaskCard && <TaskCard mindsets={mindsets} onTaskUpdate={() => {}} /> }
        <div className='w-full h-full flex flex-col items-center justify-center'>
            {showMenu && <Menu mindsetColour={mindsetColour} />}
            {/* Next event */}
            {eventQueue.length > 0 && 
                <div className='w-full items-center justify-center flex flex-col gap-4'>
                    {(!showMenu && taskQueue[0]) && (<>
                        <Link href={`?task=${taskQueue[0].id}&event=${eventQueue[0].id}`} >
                            <EventCard event={eventQueue[0]} task={taskQueue[0]} mindset={mindsetQueue[0]} />
                        </Link>
                        <TransportControls eventId={eventQueue[0].id} taskId={taskQueue[0].id} mindsetColour={mindsetColour} context='timeline'/>
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
    </>)

}

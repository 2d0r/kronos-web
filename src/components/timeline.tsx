'use client';

import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import EventCard from './event-card';
import Link from 'next/link';
import Menu from './menu';
import TransportControls from './buttons/transport-controls';
import { Mindset } from '@prisma/client';
import { fetchUpcomingEvents } from '@/lib/data';
import { EventWithRelations, NEUTRAL_MINDSET_COLOUR } from '@/lib/definitions';
import { convertPropsToDate } from '@/utils/date-utils';
import { setMindsetColour, useMindsetColour, useMindsets } from '@/store/store';
import { useDispatch } from 'react-redux';

export default function Timeline() {

    const mindsets = useMindsets();
    const mindsetColour = useMindsetColour();
    const dispatch = useDispatch();
    const searchParams = useSearchParams();
    const showMenu = !!searchParams.get('menu');

    const [ eventQueue, setEventQueue ] = useState<EventWithRelations[]>([]);
    const [ mindsetQueue, setMindsetQueue ] = useState<Mindset[]>([]);

    // HANDLERS

    const handleEventsUpdate = async () => {
        // Fetch upcoming events
        // const eventsData = await fetchUpcomingEvents(QUEUE_LENGTH);
        const eventsData = await fetchUpcomingEvents();
        const upcomingEvents = eventsData.map(event => convertPropsToDate(event))
            .filter((event: EventWithRelations) => event.endTime >= new Date());
        // console.log('eventsData', eventsData);

        // Update events queue, sorted by startTime
        const newEventsQueue = upcomingEvents.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        setEventQueue(newEventsQueue);
        // console.log('newEventsQueue', newEventsQueue);

        // Update mindsets queue
        const newMindsetQueue = newEventsQueue.map(event => mindsets.find(el => el.id === event.task.mindsetId) || {} as Mindset);
        setMindsetQueue(newMindsetQueue);
        // console.log('newMindsetQueue', newMindsetQueue);

        // Update mindset colour
        dispatch(setMindsetColour(newMindsetQueue[0].colour || NEUTRAL_MINDSET_COLOUR));
    }


    // HOOKS

    useEffect(() => {
        handleEventsUpdate();
        const timePassingInterval = setInterval(() => handleEventsUpdate(), 300000); // every 5 minutes
        return () => clearInterval(timePassingInterval);
    }, []);

    return (<>
        <div className='w-full h-full flex flex-col items-center justify-center'>
            {/* Next event */}
            {eventQueue.length > 0 && 
                <div className='w-full items-center justify-center flex flex-col gap-4'>
                    {(!showMenu && eventQueue[0]) && (<>
                        <Link href={`?task=${eventQueue[0].taskId}&event=${eventQueue[0].id}`} >
                            <EventCard event={eventQueue[0]} mindset={mindsetQueue[0]} />
                        </Link>
                        <TransportControls eventId={eventQueue[0].id} taskId={eventQueue[0].taskId} mindsetColour={mindsetColour} context='timeline'/>
                    </>)}
                </div>
            }
            {/* Later event */}
            {!!eventQueue.length && (
                <div className='w-screen h-1/6 bottom-0 left-0 absolute overflow-clip flex items-end justify-center'>
                {(eventQueue.length > 1 && !showMenu) ?
                    <EventCard event={eventQueue[1]} nextEvent={true} mindset={mindsetQueue[1]} 
                    /> : showMenu ? <EventCard event={eventQueue[0]} nextEvent={true} mindset={mindsetQueue[0]} 
                    /> : <></>
                }
                </div>)
            }
            { showMenu && <Menu /> }
        </div>
    </>)
}

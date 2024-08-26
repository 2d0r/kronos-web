'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import EventCard from './event-card';
import Link from 'next/link';
import Menu from './menu';
import TransportControls from './buttons/transport-controls';
import { Mindset } from '@prisma/client';
import { fetchEvents, fetchTasks, fetchUpcomingEvents } from '@/lib/data';
import { NEUTRAL_MINDSET_COLOUR } from '@/lib/definitions';
import { EventWithRelations } from '@/lib/types';
import { addDaysToDate, convertPropsToDate } from '@/utils/date-utils';
import { setEvents, setMindsetColour, setTasks, useMindsetColour, useMindsets } from '@/store/store';
import { useDispatch } from 'react-redux';
import { AnimatePresence, color, motion } from 'framer-motion';
import Button from './buttons/button';
import { organiseTimespan } from '@/lib/organise-timespan';
import clsx from 'clsx';

export default function Timeline() {

    const mindsets = useMindsets();
    const mindsetColour = useMindsetColour();
    const dispatch = useDispatch();
    const searchParams = useSearchParams();
    const showMenu = !!searchParams.get('menu');
    const pathname = usePathname();

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
        dispatch(setMindsetColour(newMindsetQueue[0]?.colour || NEUTRAL_MINDSET_COLOUR));
    }
    const handleOrganiseToday = async (daysAhead: number = 1) => {
        const currentTime = new Date();
        const xDaysFromNow = addDaysToDate(currentTime, daysAhead);
        await organiseTimespan({
            timespan: [currentTime, xDaysFromNow],
        });
        setTimeout(async () => {
            const newEvents = await fetchEvents();
            dispatch(setEvents(newEvents));
            const newTasks = await fetchTasks();
            dispatch(setTasks(newTasks));
        }, 1000);
    }


    // HOOKS

    useEffect(() => {
        handleEventsUpdate();
        const timePassingInterval = setInterval(() => handleEventsUpdate(), 300000); // every 5 minutes
        return () => clearInterval(timePassingInterval);
    }, []);

    return (<>
        <div className='w-full h-full flex flex-col items-center justify-center overflow-hidden'>

            {/* Next event */}
            {eventQueue.length > 0 && 
                <motion.div className={clsx('w-full justify-center items-center flex flex-col gap-4',
                    showMenu ? 'absolute bottom-0 left-0 right-0 h-1/6' : '',
                )} initial={{ y: 200, overflow: 'hidden' }} animate={{ y: 0 }} layout='preserve-aspect' transition={{ ease: false }}>
                    <AnimatePresence>
                    {(eventQueue[0]) && (<motion.div className='flex flex-col gap-4 w-full items-center'
                    // initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200, opacity: 0 }}
                    >
                        <Link href={`?task=${eventQueue[0].taskId}&event=${eventQueue[0].id}&status=edit`} className='w-full flex items-center justify-center' >
                            <EventCard event={eventQueue[0]} mindset={mindsetQueue[0]} isTucked={showMenu} />
                        </Link>
                        {!showMenu && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <TransportControls eventId={eventQueue[0].id} taskId={eventQueue[0].taskId} mindsetColour={mindsetColour} context='timeline'/>
                        </motion.div>}
                    </motion.div>)}
                    </AnimatePresence>
                </motion.div>
            }

            {/* Later event */}
            {eventQueue.length > 1 && (
                <AnimatePresence>{!showMenu &&
                    <motion.div className={clsx('w-screen h-1/6 left-0 absolute overflow-clip flex items-end justify-center',
                        showMenu ? 'top-full h-0' : 'bottom-0'
                    )} initial={{ y: 100, overflow: 'hidden' }} animate={{ y: 0 }} exit={{ y: 100 }} layout='position' transition={{ ease: false }}>
                        <EventCard event={eventQueue[1]} mindset={mindsetQueue[1]} isTucked={true} greyed={true} />
                    </motion.div>
                }</AnimatePresence>
            )}
            
            {/* Empty timeline */}
            { eventQueue.length === 0 && !showMenu && (<div className='flex flex-col gap-8 items-center md:w-[24rem] w-full' style={{ color: mindsetColour }}>
                <span className='text-xl'>Nothing coming next</span>
                <div className='flex gap-4 justify-center text-md w-full md:p-0 p-2'>
                    <Button 
                        className='rounded-md p-6 border text-md w-full' 
                        style={{ color: mindsetColour, borderColor: mindsetColour }}
                        onClick={() => handleOrganiseToday(1)}
                        >Organise today
                    </Button>
                    <Link href={`${pathname}?task=new&status=edit`}
                        className='rounded-md p-6 border text-md w-full text-center' 
                        style={{ color: mindsetColour, borderColor: mindsetColour }}
                        >Create a task
                    </Link>
                </div>
            </div>)}

            {/* Menu cards */}
            <AnimatePresence>
            { showMenu && <motion.div className='w-full h-full flex md:items-center justify-center md:pt-0 pt-[5vh]'
            initial={{ scale: 0.9, opacity: 0, y: -600, position: 'absolute' }} animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.9, opacity: 0, y: -600, height: '100%', padding: 0, position: 'absolute' }} transition={{ duration: 0.2 }}>
                <Menu />
            </motion.div> }
            </AnimatePresence>
        </div>
    </>)
}

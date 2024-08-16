// Helxaflexa calendar library

'use client';

import React, { RefObject, useEffect, useState } from 'react';
import { HfTimegrid, defineCustomElements } from '@hexaflexa/timegrid-react';
import { HfTimegridConfig, utcDateToString, HfEvent } from '@hexaflexa/timegrid';
import './calendar-hexaflexa.css';
import { Event } from '@prisma/client';
import { eventsToHf } from '@/utils/date-utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { ActionType, MindsetWithRelations } from '@/lib/definitions';
import TaskCard from '../tasks/task-card';
import { fetchEventsOfTask } from '@/lib/data';
import { getTimegridConfig } from '@/utils/calendar-utils';
defineCustomElements();

const CalendarComponent: React.FC<{ 
    initialEvents: Event[], 
    newEvents?: Event[],
    mindsetColour: string, 
    mindsets: MindsetWithRelations[],
    startWeekToday?: boolean,
    ownTaskCard?: boolean,
}> = ({
    initialEvents, mindsetColour, mindsets, startWeekToday = false, newEvents, ownTaskCard = true }) => {

    const router = useRouter();
    const searchParams = useSearchParams();
    const showTask = !!searchParams.get('task');

    const timezone = 'Europe/Bucharest' // Intl.DateTimeFormat().resolvedOptions().timeZone;
    const startDate: string = utcDateToString(new Date());

    const [ eventsCache, setEventsCache ] = useState<Event[]>([]);
    const [ timegridConfig, setTimegridConfig ] = useState<HfTimegridConfig>({});

    const reloadEvents = (newEvents: Event[], replace: boolean = false) => {
        let newEventsCache: Event[] = [];
        if (!replace) {
            // Make sure new events don't overlap old ones
            const updatedIds = newEvents.map((event) => event.id); // 1. Identify the ids of the updated items
            const filteredEvents = eventsCache.filter((event) => !updatedIds.includes(event.id)); // 2. Filter out items from the previous state that have changed
            newEventsCache = [...filteredEvents, ...newEvents]; // 3. Combine the filtered items with the updated items
            setEventsCache(newEventsCache);
        }
        else {
            newEventsCache = newEvents;
            setEventsCache(newEvents);
        }
        
        // TO DO: only keep events that haven't changed at all
        const eventColours = newEventsCache.map(event => {
            const eventMindset = mindsets.filter(mindset => mindset.tasks.some(task => {
                return Object.values(task).includes(event.taskId);
            }));
            return eventMindset[0]?.colour;
        });
        const newEventsForHf = eventsToHf(newEventsCache, eventColours, timezone);
        setTimegridConfig(getTimegridConfig(newEventsForHf, startWeekToday));
    }


    // HANDLERS 

    function onEventSelected(event: any) {
        router.push(`?task=${event.detail.taskId}&event=${event.detail.id}`);
    }
    function onStartDateChanged(event: any) {
    }
    function onEventNew(event: any) {
        const newEvent = event.detail;
        newEvent.id = timegridConfig.events!.length * 100 + '';
        newEvent.title = 'New Event ' + newEvent.id;
        setTimegridConfig(prevConfig => ({
            ...prevConfig,
            events: [...prevConfig.events!, newEvent]
        }))
        timegridRef.current!.config = timegridConfig;
    }
    const handleTaskUpdate = async (taskId: string, action: ActionType) => {
        const newEvents = await fetchEventsOfTask(taskId);
        reloadEvents(newEvents);
    }


    // HOOKS
    
    useEffect(() => {
        document.documentElement.style.setProperty('--mindset-colour', mindsetColour);
        reloadEvents(initialEvents);
    }, []);
    // Debugging
    // useEffect(() => {
    //     console.log('HfEvents Today', timegridConfig.events?.filter(el => el.start.includes('2024-08-15')));
    // }, [timegridConfig]);
    useEffect(() => {
        initialEvents && reloadEvents(initialEvents, true);
    }, [initialEvents]);
    
    let timegridRef: RefObject<HTMLHfTimegridElement> = React.createRef();

    return (<>
        <HfTimegrid 
            startDate={startDate} 
            config={timegridConfig}
            onStartDateChanged={(event) => onStartDateChanged(event)}
            onEventNew={(event) => onEventNew(event)}
            onEventSelected={(event) => onEventSelected(event)}
            ref={timegridRef}
            style={{
                display: 'flex',
                width: '100%',
                height: '100%',
                border: 'none',
                borderRadius: '10px',
                position: 'relative'
            }}
        />
        { showTask && ownTaskCard && <TaskCard mindsets={mindsets} onTaskUpdate={handleTaskUpdate} />}
    </>);
}

export default CalendarComponent;
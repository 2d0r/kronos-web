// Helxaflexa calendar library

'use client';

import React, { RefObject, useEffect, useState } from 'react';
import { HfTimegrid, defineCustomElements } from '@hexaflexa/timegrid-react';
import { HfTimegridConfig, utcDateToString } from '@hexaflexa/timegrid';
import './calendar-hexaflexa.css';
import { eventsToHf } from '@/utils/date-utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { EventWithRelations, NEUTRAL_MINDSET_COLOUR } from '@/lib/definitions';
import TaskCard from '../tasks/task-card';
import { getTimegridConfig } from '@/utils/calendar-utils';
import { useEvents, useTasks } from '@/store/store';
defineCustomElements();

const CalendarComponent: React.FC<{ 
    mindsetColour: string, 
    startWeekToday?: boolean,
    ownTaskCard?: boolean,
}> = ({
    mindsetColour, startWeekToday = false, ownTaskCard = true }) => {

    const events = useEvents();
    const tasks = useTasks();

    const router = useRouter();
    const searchParams = useSearchParams();
    const showTask = !!searchParams.get('task');

    const timezone = 'Europe/Bucharest' // Intl.DateTimeFormat().resolvedOptions().timeZone;
    const startDate: string = utcDateToString(new Date());

    const [ timegridConfig, setTimegridConfig ] = useState<HfTimegridConfig>({});

    const reloadEvents = (events: EventWithRelations[]) => {
        const eventColours = events.map(event => {
            const eventTask = tasks.find(task => task.events.map(event => event.id).includes(event.id));
            const eventColour = eventTask?.mindset?.colour;
            return eventColour || NEUTRAL_MINDSET_COLOUR;
        });
        const newEventsForHf = eventsToHf(events, eventColours, timezone);
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


    // HOOKS
    
    useEffect(() => {
        reloadEvents(events);
    }, []);
    useEffect(() => {
        document.documentElement.style.setProperty('--mindset-colour', mindsetColour);
        reloadEvents(events);
        console.log('calendar/useEffect[events] - tasks:', tasks);
    }, [events]);
    
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
    </>);
}

export default CalendarComponent;
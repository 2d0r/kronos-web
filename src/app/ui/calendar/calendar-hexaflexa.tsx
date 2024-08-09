// Helxaflexa calendar library

'use client';

import React, { RefObject, useEffect, useState } from 'react';
import { HfTimegrid, defineCustomElements } from '@hexaflexa/timegrid-react';
import { HfTimegridConfig, utcDateToString, HfEvent } from '@hexaflexa/timegrid';
import './calendar-hexaflexa.css';
import { Event } from '@prisma/client';
import { eventsToHf } from '@/app/utils/dateUtils';
import { useRouter } from 'next/navigation';
import { MindsetWithRelations } from '@/app/lib/definitions';
defineCustomElements();

const CalendarComponent: React.FC<{ 
    events: Event[], 
    mindsetColour: string, 
    mindsets: MindsetWithRelations[],
    startWeekToday?: boolean,
    onEventsUpdate?: (events: Event[]) => void,
    parentName?: string,
}> = ({ 
    events, mindsetColour, mindsets, startWeekToday = false, onEventsUpdate, parentName }) => {

    const router = useRouter();

    const timezone = 'Europe/Bucharest' // Intl.DateTimeFormat().resolvedOptions().timeZone;

    const eventColours = events.map(event => {
        const eventMindset = mindsets.filter(mindset => mindset.tasks.some(task => {
        return Object.values(task).includes(event.taskId);
        }));
        return eventMindset[0]?.colour;
    });
    const [ eventsCache, setEventsCache ] = useState<Event[]>(events);
    const [ eventsForHf, setEventsForHf ] = useState<HfEvent[]>(eventsToHf(eventsCache, eventColours, timezone));

    const getTimegridConfig = (eventsForHf: HfEvent[]): HfTimegridConfig => {
        return ({
            daysConfig: {
                daysCount: 7,
                fullWeek: !startWeekToday,
            },
            timeFormat: 'h:mm a',
            firstDayOfWeek: 1,
            resources: [
                { id: '1', title: 'Resource 1' }
            ],
            events: eventsForHf,
            bodyConfig: {
                // enableNewEvents: true,
                switchDragResizeAction: 'none',
                selectAction: 'tap',
                dragResizeStates: ["none","dragResize","none","none"],
                eventConfig: {
                showDescription: true,
                //   useRenderEvent(event: HfEvent, columnResourceId: string): boolean {
                //     return true;
                //   },
                //   renderEvent(event: HfEvent, columnResourceId: string): string {
                //     return `<Link href='?editTaskId=${event.id}' className='cursor-pointer w-full h-full'>${event.title}</Link>`;
                //   }
                },
                timeCellWidth: 30,
            },
            headerDayConfig: {
                showDateFirst: false,
            },
            toolbarConfig: {
                startControls: [],
                centerControls: ['today', 'prev', 'date', 'next'],
                endControls: ['loading'],
            },
            headerResourceConfig: {
                showTitle: false,
                showImage: false
            },
        });
    };
    const [ timegridConfig, setTimegridConfig ] = useState<HfTimegridConfig>(getTimegridConfig(eventsForHf));
    const startDate: string = utcDateToString(new Date());


    // API ACTIONS

    

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
        document.documentElement.style.setProperty('--mindset-colour', mindsetColour);
    }, []);
    useEffect(() => {
        const newEventsForHf = eventsToHf(events, eventColours, timezone);
        setEventsForHf(newEventsForHf);
        setTimegridConfig(getTimegridConfig(newEventsForHf));
    }, [events])
    
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
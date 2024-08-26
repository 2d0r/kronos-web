// Helxaflexa calendar library

'use client';

import { createRef, RefObject, Suspense, useEffect, useState } from 'react';
import { HfTimegrid, defineCustomElements } from '@hexaflexa/timegrid-react';
import { HfTimegridConfig, utcDateToString } from '@hexaflexa/timegrid';
import './calendar-hexaflexa.css';
import { eventsToHf } from '@/utils/date-utils';
import { useRouter } from 'next/navigation';
import { NEUTRAL_MINDSET_COLOUR } from '@/lib/definitions';
import { EventWithRelations } from '@/lib/types';
import { useEvents, useMindsetColour, useTasks } from '@/store/store';
import useWindowSize from '@/lib/useWindowSize';
defineCustomElements();

export default function CalendarComponent ( { startWeekToday = false } : { startWeekToday?: boolean }) {

    const events = useEvents();
    const tasks = useTasks();
    const mindsetColour = useMindsetColour();
    const router = useRouter();
    const { windowWidth } = useWindowSize();

    console.log('windowWidth', windowWidth);

    const timezone = 'Europe/Bucharest' // Intl.DateTimeFormat().resolvedOptions().timeZone;
    const startDate: string = utcDateToString(new Date());

    const [ timegridConfig, setTimegridConfig ] = useState<HfTimegridConfig>({
        daysConfig: {
            daysCount: 7,
            fullWeek: !startWeekToday,
        },
        timeFormat: 'h:mm a',
        firstDayOfWeek: 1,
        resources: [
            { id: '1', title: 'Hidden Resource' }
        ],
        events: [],
        bodyConfig: {
            // enableNewEvents: true,
            switchDragResizeAction: 'none',
            selectAction: 'tap',
            dragResizeStates: ["none","none","none","none"],
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
            endControls: [],
        },
        headerResourceConfig: {
            showTitle: false,
            showImage: false
        },
    });

    const reloadEvents = (events: EventWithRelations[]) => {
        const eventColours = events.map(event => {
            const eventTask = tasks.find(task => task.events.map((event: any) => event.id).includes(event.id));
            const eventColour = eventTask?.mindset?.colour;
            return eventColour || NEUTRAL_MINDSET_COLOUR;
        });
        const newEventsForHf = eventsToHf(events, eventColours, timezone);
        setTimegridConfig(prevConfig => ({ 
            ...prevConfig, 
            events: newEventsForHf, 
            daysConfig: { ...prevConfig.daysConfig, fullWeek: !startWeekToday }
        }));
    }


    // HANDLERS 

    const onEventSelected = (event: any) => {
        router.push(`?task=${event.detail.taskId}&event=${event.detail.id}status=edit`);
    }
    const onStartDateChanged = (event: any) => {
    }
    const onEventNew = (event: any) => {
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
        // console.log('calendar/useEffect[events] - tasks:', tasks);
    }, [events]);
    useEffect(() => {
        const newDaysCount = windowWidth ? windowWidth <= 400 ? 2 : windowWidth <= 900 ? 4 : 7 : 7;
        console.log('newDaysCount', newDaysCount);
        setTimegridConfig(prevConfig => ({ ...prevConfig,
            daysConfig: { ...prevConfig.daysConfig, daysCount: newDaysCount, fullWeek: newDaysCount === 7 }
        }));
    }, [windowWidth])
    
    let timegridRef: RefObject<HTMLHfTimegridElement> = createRef();

    return (<><Suspense>
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
            className='hide-scrollbar'
        />
    </Suspense></>);
}
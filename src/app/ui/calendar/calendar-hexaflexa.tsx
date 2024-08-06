// Helxaflexa calendar library

'use client';

import React, { RefObject, useEffect, useState } from 'react';
import { HfTimegrid, defineCustomElements } from '@hexaflexa/timegrid-react';
import { HfTimegridConfig, utcDateToString, HfEvent } from '@hexaflexa/timegrid';
import './calendar-hexaflexa.css';
import { Event } from '@prisma/client';
import { eventsToHf } from '@/app/utils/dateUtils';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import TaskCard from '../tasks/task-card';
import { MindsetWithRelations, TaskWithRelations } from '@/app/lib/definitions';
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

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const showTaskCard = searchParams.get('task');

    const timezone = 'Europe/Bucharest' // Intl.DateTimeFormat().resolvedOptions().timeZone;

    const eventColours = events.map(event => {
        const eventMindset = mindsets.filter(mindset => mindset.tasks.some(task => {
        return Object.values(task).includes(event.taskId);
        }));
        return eventMindset[0]?.colour;
    });
    const [ selectedTask, setSelectedTask ] = useState<TaskWithRelations>({} as TaskWithRelations);
    const [ eventsCache, setEventsCache ] = useState<Event[]>(events);
    const [ eventsForHf, setEventsForHf ] = useState<any>(eventsToHf(eventsCache, eventColours, timezone));

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

    const fetchTaskAndSetSelectedTaskId = async (taskId: string) => {
        const response = await fetch(`/task/${taskId}`);
        const data = await response.json();
        setSelectedTask(data.task);
    }
    

    // HANDLERS 

    function onEventSelected(event: any) {
        router.push(`?task=${event.detail.taskId}&event=${event.detail.id}`);
        fetchTaskAndSetSelectedTaskId(event.detail.taskId);
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
        // timegridConfig.events!.push(newEvent);
        // timegridConfig = { ...timegridConfig };
        timegridRef.current!.config = timegridConfig;
    }
    // function onEventDragResizeStateChanged(event: any) {
    //     const dragResizeStateChangedEvent = event.detail;
    //     const stateIndex = dragResizeStateChangedEvent.stateIndex;
    //     const hfEvent = dragResizeStateChangedEvent.event;
    //     hfEvent.description = `(${event.dragResizeStates[stateIndex]})`;
    // }
    // async function onShowLoadingChange(event: any) {
    //     await customElements.whenDefined('hf-timegrid');
    //     const timegridElement = document.querySelector('hf-timegrid');
    //     if (event.target.value == 'true') {
    //         await timegridElement?.showLoading();
    //     } else {
    //         await timegridElement?.hideLoading();
    //     }
    // }
    const handleTaskUpdate = (task: TaskWithRelations) => {
        setTimeout(async () => {
            const response = await fetch(`/event/${task.id}`);
            const data = await response.json();
            const newEvents = data.events;
            setEventsCache(prevEvents => [...prevEvents, ...newEvents]);
            const newEventsForHf = eventsToHf(data.events, eventColours, timezone);
            setEventsForHf(newEventsForHf);
            setTimegridConfig(getTimegridConfig(newEventsForHf));
            onEventsUpdate && onEventsUpdate(newEvents);
        }, 1000);
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
        {(showTaskCard && parentName !== 'TestView') && <TaskCard mindsets={mindsets} task={selectedTask} onTaskUpdate={handleTaskUpdate} />}
    </>);
}

export default CalendarComponent;
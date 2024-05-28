'use client';

import React, { RefObject, useEffect, useState } from 'react';
import { HfTimegrid, defineCustomElements } from '@hexaflexa/timegrid-react';
import { HfTimegridConfig, utcDateTimeToString, utcDateToString, HfEvent } from '@hexaflexa/timegrid';
import './calendar-hexaflexa.css';
import { Event, Mindset, Task } from '@prisma/client';
import { areSameDay, eventsToHf } from '@/app/utils/dateUtils';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import TaskCard from '../tasks/task-card';
import { TaskWithRelations } from '@/app/lib/definitions';
defineCustomElements();

interface KronosHfEvent extends HfEvent {
    taskId: string
}

const CalendarComponent: React.FC<{ events: Event[], eventColours: string[], mindsetColour: string, mindsets: Mindset[] }> = ({ 
    events, eventColours, mindsetColour, mindsets }) => {

    const searchParams = useSearchParams();
    const router = useRouter();
    const showTaskCard = searchParams.get('editTask');
    const [ selectedTask, setSelectedTask ] = useState<TaskWithRelations>({} as TaskWithRelations);
    const [ eventsCache, setEventsCache ] = useState<Event[]>(events);
    const [ eventsForHf, setEventsForHf ] = useState<any>(eventsToHf(eventsCache, eventColours));

    const getTimegridConfig = (eventsForHf: HfEvent[]): HfTimegridConfig => {
        return ({
            daysConfig: {
                daysCount: 7,
                fullWeek: true,
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
            }
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
        router.push(`?editTask=${event.detail.taskId}`);
        fetchTaskAndSetSelectedTaskId(event.detail.taskId);
    }
    function onStartDateChanged(event: any) {
        console.log('onStartDateChanged', event);
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
            const newEventsForHf = eventsToHf(data.events, eventColours);
            setEventsForHf(newEventsForHf);
            setTimegridConfig(getTimegridConfig(newEventsForHf));
        }, 1000);
        
    }

    // HOOKS
    useEffect(() => {
        document.documentElement.style.setProperty('--mindset-colour', mindsetColour);
    }, []);
    
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
        {showTaskCard && <TaskCard mindsets={mindsets} task={selectedTask} onTaskUpdate={handleTaskUpdate} />}
    </>);
}

export default CalendarComponent;
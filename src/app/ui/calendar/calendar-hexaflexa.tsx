'use client';

import React, { RefObject, useEffect, useState } from 'react';
import { HfTimegrid, defineCustomElements } from '@hexaflexa/timegrid-react';
import { HfTimegridConfig, utcDateTimeToString, utcDateToString, HfEvent } from '@hexaflexa/timegrid';
import './calendar-hexaflexa.css';
import { Event, Mindset, Task } from '@prisma/client';
import { areSameDay } from '@/app/utils/dateUtils';
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

    const startDate: string = utcDateToString(new Date());
    let eventsForHf = [];
    for (let i = 0; i < events.length; i++) {
        const event = events[i];
        if ( areSameDay(event.startTime, event.endTime) ) {
            eventsForHf.push({
                id: event.id,
                taskId: event.taskId,
                title: event.name,
                resources: ['1'],
                start: utcDateTimeToString(event.startTime),
                end: utcDateTimeToString(event.endTime),
                style: {
                    backgroundColor: eventColours[i]
                },
            });
        } else {
            const endTimeCopy = new Date(event.endTime.getTime());
            const endTimeEndDay = new Date(endTimeCopy.setUTCHours(23,59,0,0));
            for (let d = new Date(event.startTime); d <= endTimeEndDay; d.setDate(d.getDate() + 1)) {
                const dCopy = new Date(d.getTime());
                eventsForHf.push({
                    id: event.id,
                    title: event.name,
                    resources: ['1'],
                    start: d.getTime() === event.startTime.getTime() ? utcDateTimeToString(event.startTime) : utcDateTimeToString(new Date(dCopy.setUTCHours(0,0,0,0))),
                    end: d < event.endTime ? utcDateTimeToString(new Date(dCopy.setUTCHours(23, 59, 0, 0))) : utcDateTimeToString(event.endTime),
                    style: {
                        backgroundColor: eventColours[i]
                    },
                });
            }
        }
    }

    let timegridConfig: HfTimegridConfig = {
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
    };

    // const fetchTaskByEventId = async (eventId: string) => {
    //     // console.log('before response');
    //     const response = await fetch(`/api/task/event/${eventId}`);
    //     // console.log('response', response);
    //     const data = await response.json();
    //     const taskId = data.task.id;
    // };
    const fetchTaskByIdAndSetSelectedTask = async (taskId: string) => {
        const response = await fetch(`/task/${taskId}`);
        const data = await response.json();
        setSelectedTask(data.task);
    }
    

    // Handlers 

    function onEventSelected(event: any) {
        console.log('event selected', event);
        router.push(`?editTask=${event.detail.taskId}`);
        fetchTaskByIdAndSetSelectedTask(event.detail.taskId);
    }
    function onStartDateChanged(event: any) {
        console.log('onStartDateChanged', event);
    }
    function onEventNew(event: any) {
        console.log('onEventNew', event);
        const newEvent = event.detail;
        newEvent.id = timegridConfig.events!.length * 100 + '';
        newEvent.title = 'New Event ' + newEvent.id;
        timegridConfig.events!.push(newEvent);
        timegridConfig = { ...timegridConfig };
        timegridRef.current!.config = timegridConfig;
    }
    function onEventDragResizeStateChanged(event: any) {
        const dragResizeStateChangedEvent = event.detail;
        const stateIndex = dragResizeStateChangedEvent.stateIndex;
        const hfEvent = dragResizeStateChangedEvent.event;
        hfEvent.description = `(${event.dragResizeStates[stateIndex]})`;
    }
    async function onShowLoadingChange(event: any) {
        await customElements.whenDefined('hf-timegrid');
        const timegridElement = document.querySelector('hf-timegrid');
        if (event.target.value == 'true') {
            await timegridElement?.showLoading();
        } else {
            await timegridElement?.hideLoading();
        }
    }

    // Hooks
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
        {showTaskCard && <TaskCard 
            mindsets={mindsets}
            task={selectedTask} 
            />}
    </>);
}

export default CalendarComponent;
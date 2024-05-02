'use client';

import React, { RefObject } from 'react';
import { HfTimegrid, defineCustomElements } from '@hexaflexa/timegrid-react';
import { HfTimegridConfig, utcDateTimeToString, utcDateToString, HfEvent } from '@hexaflexa/timegrid';
import './calendar-hexaflexa.css';
import { Event } from '@prisma/client';
import Link from 'next/link';
import { areSameDay } from '@/app/utils/dateUtils';
defineCustomElements();

const CalendarComponent: React.FC<{ events: Event[], eventColours: string[] }> = ({ events, eventColours }) => {
    const startDate: string = utcDateToString(new Date());
    let eventsForHf = [];
    for (let i = 0; i < events.length; i++) {
        const event = events[i];
        console.log(event.name, event.startTime, event.endTime);
        if ( areSameDay(event.startTime, event.endTime) ) {
            eventsForHf.push({
                id: event.id,
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
    // const eventsForHf = events.map(event => {
    //     if (event.startTime.getDate() === event.endTime.getDate()) {
    //         return ({
    //             id: event.id,
    //             title: event.name,
    //             resources: ['1'],
    //             start: utcDateTimeToString(event.startTime),
    //             end: utcDateTimeToString(event.endTime)
    //         });
    //     } else {
    //         for (let d = event.startTime; d <= event.endTime; d.setDate(d.getDate() + 1)) {
    //             return ({
    //                 id: event.id,
    //                 title: event.name,
    //                 resources: ['1'],
    //                 start: d === event.startTime ? utcDateTimeToString(event.startTime) : utcDateTimeToString(new Date(d.setUTCHours(0))),
    //                 end: utcDateTimeToString(event.endTime)
    //             });
    //         }
    //     }  
    // });
    console.log('eventsForHf', eventsForHf);
    
    const handleClickEvent = (event : React.MouseEvent<HTMLInputElement>) => {

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
            switchDragResizeAction: 'tap',
            selectAction: 'hold',
            dragResizeStates: ["none","none","none","none"],
            eventConfig: {
              showDescription: true,
              useRenderEvent(event: HfEvent, columnResourceId: string): boolean {
                return true;
              },
              renderEvent(event: HfEvent, columnResourceId: string): string {
                return `<Link href='?editTaskId=${event.id}' className='cursor-pointer w-full h-full'>${event.title}</Link>`;
              }
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

    function onEventSelected(event: CustomEvent<HfEvent>) {
        console.log('event selected', event);
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

    async function onShowLoadingChange(event: any) {
        await customElements.whenDefined('hf-timegrid');
        const timegridElement = document.querySelector('hf-timegrid');
        if (event.target.value == 'true') {
            await timegridElement?.showLoading();
        } else {
            await timegridElement?.hideLoading();
        }
    }
    
    let timegridRef: RefObject<HTMLHfTimegridElement> = React.createRef();

    return (<HfTimegrid 
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
    />);
}

export default CalendarComponent;
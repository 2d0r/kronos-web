'use client';

import React, { RefObject } from 'react';
import { HfTimegrid, defineCustomElements } from '@hexaflexa/timegrid-react';
import { HfTimegridConfig, utcDateTimeToString, utcDateToString, HfEvent } from '@hexaflexa/timegrid';
import './calendar-hexaflexa.css';
import { Event } from '@prisma/client';
defineCustomElements();

const CalendarComponent: React.FC<{ events: Event[] }> = ({ events }) => {
    const startDate: string = utcDateToString(new Date());
    const eventsForHf = events.map(event => {
        return ({
            id: event.id,
            title: event.name,
            resources: ['1'],
            start: utcDateTimeToString(event.startTime),
            end: utcDateTimeToString(event.endTime),
        })
    });
    console.log('eventsForHf', eventsForHf);

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
            enableNewEvents: true,
            switchDragResizeAction: 'tap',
            selectAction: 'hold',
            dragResizeStates: ["drag","resize","none","dragResize"],
            eventConfig: {
              showDescription: true,
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
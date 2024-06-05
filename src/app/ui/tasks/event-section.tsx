import { dateToDDMMYYYY, dateToHHMM, getLocalStartAndEnd, getMinutesBetweenLocalAndUTC } from '@/app/utils/dateUtils';
import { Event } from '@prisma/client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

export default function EventSection({event, mindsetColour} : {event: Event, mindsetColour: string}) {

    const [ start, end ] = getLocalStartAndEnd(event);
    const [ startDate, endDate ] = [ new Date(start), new Date(end) ];

    const time = event.startTime && event.endTime ? `${dateToHHMM(startDate)} - ${dateToHHMM(endDate)}`
        : '';
    const date = event.startTime && event.endTime ? startDate.getDate() === endDate.getDate() ?
        dateToDDMMYYYY(startDate)
        : `${dateToDDMMYYYY(startDate)} - ${dateToDDMMYYYY(endDate)}`
        : '';
    if (!event.startTime) {
        return <></>;
    }
    return (<div className='flex justify-between p-4 border-b-[0.5px] overflow-y-scroll' style={{
        color: mindsetColour
    }}>
        <div className='flex flex-col'>
            <span className='text-xs mb-2'>Current event</span>
            <div className='flex gap-2'>
                <div>{time}</div>•<div>{date}</div>
            </div>
        </div>
        <div className='flex h-auto items-center justify-center'>
            <ChevronLeft /><ChevronRight />
        </div>
        
    </div>);
}
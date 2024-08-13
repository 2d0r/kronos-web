'use client';

import React from 'react';
import { Mindset, Task } from '@prisma/client';
import { dateToHHMM, getLocalStartAndEnd, minutesBetweenDates, minutesToDisplayDuration } from '@/utils/dateUtils';
import clsx from 'clsx';
import { EventWithRelations, NEUTRAL_MINDSET_COLOUR } from '@/lib/definitions';

interface EventCardProps {
    event: EventWithRelations;
    mindset: Mindset;
    className?: string;
    nextEvent?: boolean;
    expand?: boolean
}

export default function EventCard({ event, mindset, className, nextEvent = false } : EventCardProps) {
    const durationDisplay = minutesToDisplayDuration(minutesBetweenDates(event.startTime, event.endTime));
    const currEventDuration = (event.endTime.getTime() - event.startTime.getTime()) / 1000 / 60;
    const cardSize : ('small' | 'medium' | 'large') = currEventDuration > 180 ? 'large' :
        currEventDuration > 60 ? 'medium' : 'small';
    const [ start, end ] = getLocalStartAndEnd(event);
    const [ startDate, endDate ] = [ new Date(start), new Date(end) ];
    
    return (<>
        <div className={clsx(className, 
            'text-white rounded-2xl flex flex-col justify-between items-center text-center',
            nextEvent && 'absolute bottom-0 mb-[-25px] bg-gradient-to-br from-gray-400 to-gray-600 opacity-80',
            'cursor-pointer p-4 w-[350px]'
        )}
            style = {{
                backgroundColor: mindset.colour || NEUTRAL_MINDSET_COLOUR,
                height: nextEvent ? '10vh' : cardSize === 'small' ? '20vh' : cardSize === 'medium' ? '30vh' : '50vh',
                minHeight: nextEvent ? '100px' : cardSize === 'small' ? '100px' : cardSize === 'medium' ? '150px' : '300px'
            }}
        >
            <div className='text-sm w-full flex items-start'>{dateToHHMM(startDate)}</div>
            <div>
                <div className='text-2xl'>{event.name}</div>
                <div>{nextEvent ? '' : durationDisplay}</div>
            </div>
            <div className='h-4'></div>
        </div>
    </>);
}
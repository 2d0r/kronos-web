'use client';

import React from 'react';
import { Mindset, Task } from '@prisma/client';
import { dateToHHMM, getLocalStartAndEnd, minutesBetweenDates, minutesToDisplayDuration } from '@/utils/date-utils';
import clsx from 'clsx';
import { NEUTRAL_MINDSET_COLOUR } from '@/lib/definitions';
import { EventWithRelations } from '@/lib/types';

interface EventCardProps {
    event: EventWithRelations;
    mindset: Mindset;
    className?: string;
    isTucked?: boolean;
    expand?: boolean;
    greyed?: boolean;
}

export default function EventCard({ event, mindset, className, isTucked = false, greyed = false } : EventCardProps) {
    const durationDisplay = minutesToDisplayDuration(minutesBetweenDates(event.startTime, event.endTime));
    const currEventDuration = (event.endTime.getTime() - event.startTime.getTime()) / 1000 / 60;
    const cardSize : ('small' | 'medium' | 'large') = currEventDuration > 180 ? 'large' :
        currEventDuration > 60 ? 'medium' : 'small';
    const [ start, end ] = getLocalStartAndEnd(event);
    const [ startDate, endDate ] = [ new Date(start), new Date(end) ];
    
    return (!isTucked ? <>
        <div className={clsx(className, 
            'text-white rounded-2xl flex flex-col justify-between items-center text-center cursor-pointer p-4 w-[350px]'
        )}
        style = {{
            backgroundColor: mindset.colour || NEUTRAL_MINDSET_COLOUR,
            height: cardSize === 'small' ? '20vh' : cardSize === 'medium' ? '30vh' : '50vh',
            minHeight: cardSize === 'small' ? '100px' : cardSize === 'medium' ? '150px' : '300px'
        }}>
            <div className='text-sm w-full flex items-start'>{dateToHHMM(startDate)}</div>
            <div>
                <div className='text-2xl'>{event.name}</div>
                <div>{durationDisplay}</div>
            </div>
            <div className='h-4'></div>
        </div>
    </> : <>
        <div className={clsx(className, 
            'text-white rounded-2xl flex flex-col items-center text-center p-4 w-[350px]',
            'absolute top-full mt-[-10vh]',
            greyed && 'bg-gradient-to-br from-gray-400 to-gray-600 opacity-60'
        )}
        style = {{ 
            backgroundColor: mindset.colour || NEUTRAL_MINDSET_COLOUR,
            height: cardSize === 'small' ? '20vh' : cardSize === 'medium' ? '30vh' : '50vh',
            minHeight: cardSize === 'small' ? '100px' : cardSize === 'medium' ? '150px' : '300px'
        }}>
            <div className='text-sm w-full flex items-start'>{dateToHHMM(startDate)}</div>
            <div className='text-2xl pb-4'>{event.name}</div>
        </div>
    </>);
}
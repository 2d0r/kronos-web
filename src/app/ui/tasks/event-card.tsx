'use client';

import React, { useState } from 'react';
import { Event, Mindset, Task } from '@prisma/client';
import { dateToDDMMYYYY, dateToHHMM, minutesToDisplayDuration } from '@/app/utils/dateUtils';
import clsx from 'clsx';
import { NEUTRAL_MINDSET_COLOUR } from '@/app/lib/definitions';
import { ChevronUp } from 'lucide-react';

interface EventCardProps {
    event: Event;
    task: Task;
    mindset: Mindset;
    className?: string;
    nextTask?: boolean;
    expand?: boolean
}

export default function EventCard({ event, task, mindset, className, nextTask = false, expand = false } : EventCardProps) {
    const [ isExpanded, setIsExpanded ] = useState<boolean>(false);
    const durationDisplay = minutesToDisplayDuration(task.duration);
    const currEventDuration = (event.endTime.getTime() - event.startTime.getTime()) / 1000 / 60;
    const cardSize : ('small' | 'medium' | 'large') = currEventDuration > 180 ? 'large' :
        currEventDuration > 60 ? 'medium' : 'small';

    const handleExpandCard = () => {
        if (expand) {
            setIsExpanded(!isExpanded);
        } 
    }
    
    return (<>
        <div className={clsx(className, 
            'text-white rounded-2xl flex flex-col justify-between items-center text-center',
            nextTask && 'absolute top-[90vh] mb-[-45px] bg-gradient-to-br from-gray-400 to-gray-600 opacity-80',
            (expand && !isExpanded) && 'cursor-pointer',
            isExpanded ? 'h-full w-2/3 max-w-500px p-6' : 'p-4 w-[350px]'
        )}
            style = {!isExpanded ? {
                backgroundColor: mindset.colour || NEUTRAL_MINDSET_COLOUR,
                height: nextTask ? '10vh' : cardSize === 'small' ? '20vh' : cardSize === 'medium' ? '30vh' : '50vh',
                minHeight: nextTask ? '100px' : cardSize === 'small' ? '100px' : cardSize === 'medium' ? '150px' : '300px'
            } : {
                backgroundColor: mindset.colour || NEUTRAL_MINDSET_COLOUR
            }}
            onClick = {expand && !isExpanded ? handleExpandCard : () => {}}
            onBlur={isExpanded ? handleExpandCard : () => {}}
        >
            { !isExpanded ? <>
                <div className='text-sm w-full flex items-start'>{dateToHHMM(event.startTime)}</div>
                <div>
                    <div className='text-2xl'>{event.name}</div>
                    <div>{nextTask ? '' : durationDisplay}</div>
                </div>
                <div className='h-4'></div>
            </> : <>
                {/* <div className='text-sm w-full flex items-start'>{dateToHHMM(event.startTime)}</div> */}
                <div>
                    <div className='text-2xl'>{event.name}</div>
                    <div>{nextTask ? '' : durationDisplay}</div>
                </div>
                <div className='flex gap-4 w-full mt-4'>
                    <div className='flex flex-col gap-2 text-left w-1/3 border-[0.5px] border-white rounded-2xl p-4 overflow-scroll'>
                        {/* <div className='text-lg'>Notes</div> */}
                        <div className='text-sm h-2/3 tiptap' dangerouslySetInnerHTML={{ __html: task.notes || '<p></p>' }} />
                    </div>
                    <div className='flex flex-col gap-2 text-left w-1/3 border-[0.5px] border-white rounded-2xl p-4 overflow-scroll'>
                        {/* <div className='text-lg'>Checklist</div> */}
                        {/* <div className='text-sm h-2/3'>{task.checklist}</div> */}
                        <div className='text-sm h-2/3 tiptap' dangerouslySetInnerHTML={{ __html: task.checklist || '<p></p>' }} />
                    </div>
                    <div className='flex flex-col gap-2 text-left w-1/3 p-4 overflow-scroll'>
                        {/* <div className='text-lg'>Details</div> */}
                        <div className='flex flex-col'>
                            <div className='flex gap-2 pb-2'><div>Mindset</div><div className='font-bold'>{mindset.name}</div></div>
                            <div className='flex gap-2 pb-2'><div>Priority</div><div className='font-bold'>{task.priority}</div></div>
                            <div className='flex gap-2 pb-2'><div>Duration</div><div className='font-bold'>{minutesToDisplayDuration(task.duration)}</div></div>
                            { task.startTime && task.fixed &&
                                <div className='flex gap-2 pb-2'><div className='font-bold'>Start</div><div>{task.startTime.getHours()}</div></div> 
                            }
                            { task.startTime && !task.fixed &&
                                <div className='flex gap-2 pb-2'><div className='font-bold'>Ideal time</div><div>{task.startTime.getHours()}</div></div> 
                            }
                            { task.endTime && task.fixed &&
                                <div className='flex gap-2 pb-2'><div className='font-bold'>End</div><div>{task.endTime.getHours()}</div></div> 
                            }
                            { (task.repeat && task.repeatUnit === 'sessions' && task.repeatFrequency && task.repeatTimespan) && 
                                <div className='flex gap-2 pb-2'><div className='font-bold'>Frequency</div><div>x {task.repeatFrequency} / {task.repeatTimespan}</div></div> 
                            }
                            { task.preferredTimeOfDay.length > 0 && 
                                <div className='flex gap-2 pb-2'><div>Daytimes</div><div className='flex flex-col font-bold'>{
                                    task.preferredTimeOfDay.map((time : string, idx : number) => {
                                        return <span key={idx}>{time}</span>
                                    })
                                }</div></div> 
                            }
                            { task.preferredDayOfWeek.length > 0 && 
                                <div className='flex gap-2 pb-2'><div>Weekdays</div><div className='flex flex-col font-bold'>{
                                    task.preferredDayOfWeek.map((day : string, idx : number) => {
                                        return <span key={idx}>{day.slice(0,3)}</span>
                                    })
                                }</div></div> 
                            }
                            { task.deadline && 
                                <div className='flex gap-2 pb-2'><div>Repeat until</div><div className='font-bold'>{dateToDDMMYYYY(task.deadline)}</div></div> 
                            }
                            { task.totalRepetitions && 
                                <div className='flex gap-2 pb-2'><div>Repeat </div><div className='font-bold'>{task.totalRepetitions} times</div></div> 
                            }
                            { task.totalDuration && 
                                <div className='flex gap-2 pb-2'><div>Repeat up to</div><div className='font-bold'>{task.totalDuration / 60} hours</div></div> 
                            }
                        </div>
                    </div>
                </div>
                <div className='h-4 mt-3 cursor-pointer' onClick={handleExpandCard} ><ChevronUp opacity='0.5' /></div>
            </>}
            { isExpanded}
            
        </div>
    </>);
}
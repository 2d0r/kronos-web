import React from 'react';
import { DeleteTask } from './delete-task';
import { getTaskMindset } from '@/app/lib/data';
import { Event, Task } from '@prisma/client';
import { dateToHHMM, minutesToDisplayDuration } from '@/app/utils/dateUtils';
import clsx from 'clsx';

interface EventCardProps {
    event: Event;
    task: Task;
    className?: string;
    nextTask?: boolean;
}

export default async function EventCard({ event, task, className, nextTask = false } : EventCardProps) {
    const mindset = await getTaskMindset(task);
    const durationDisplay = minutesToDisplayDuration(task.duration);
    const currEventDuration = (event.endTime.getTime() - event.startTime.getTime()) / 1000 / 60;
    const cardSize : ('small' | 'medium' | 'large') = currEventDuration > 180 ? 'large' :
        currEventDuration > 60 ? 'medium' : 'small';
    
    return (<>
        <div className={clsx(className, 'w-1/3 bg-violet-600 text-white rounded-2xl flex flex-col justify-between items-center p-4 text-center',
            nextTask && 'absolute top-[90vh] mb-[-45px] bg-gradient-to-br from-gray-400 to-gray-600 opacity-80'
        )}
            style = {{
                backgroundColor: mindset.colour,
                height: nextTask ? '10vh' : cardSize === 'small' ? '20vh' : cardSize === 'medium' ? '30vh' : '50vh',
                minHeight: nextTask ? '100px' : cardSize === 'small' ? '100px' : cardSize === 'medium' ? '150px' : '300px'
            }}
        >
            <div className='text-sm w-full flex items-start'>{dateToHHMM(event.startTime)}</div>
            <div>
                <div className='text-2xl'>{event.name}</div>
                <div>{nextTask ? '' : durationDisplay}</div>
            </div>
            <div className='h-4'> </div>
            {/* <div className='text-sm'>{dateToHHMM(event.endTime)}</div> */}
            {/* <div className='overflow-scroll flex flex-row justify-start align-middle gap-8 w-2/3'>
                <div><div className='font-bold'>Status</div><div>{task.status}</div></div>
                <div><div className='font-bold'>Priority</div><div>{task.priority}</div></div>
                { task.startTime && task.scheduled &&
                    <div><div className='font-bold'>Start</div><div>{task.startTime.getHours()}</div></div> 
                }
                { task.startTime && !task.scheduled &&
                    <div><div className='font-bold'>Ideal time</div><div>{task.startTime.getHours()}</div></div> 
                }
                { task.endTime && task.scheduled &&
                    <div><div className='font-bold'>End</div><div>{task.endTime.getHours()}</div></div> 
                }
                { (task.repeat && task.repeatUnit === 'sessions' && task.repeatFrequency && task.repeatTimespan) && 
                    <div><div className='font-bold'>Frequency</div><div>x {task.repeatFrequency} / {task.repeatTimespan}</div></div> 
                }
                { task.preferredTimeOfDay.length > 0 && 
                    <div><div className='font-bold'>Fav Daytimes</div><div className='flex flex-col'>{
                        task.preferredTimeOfDay.map((time : string, idx : string) => {
                            return <span key={idx}>{time}</span>
                        })
                    }</div></div> 
                }
                { task.preferredDayOfWeek.length > 0 && 
                    <div><div className='font-bold'>Fav Days</div><div className='flex flex-col'>{
                        task.preferredDayOfWeek.map((day : string, idx : string) => {
                            return <span key={idx}>{day.slice(3)}</span>
                        })
                    }</div></div> 
                }
            </div> */}
        </div>
    </>);
}
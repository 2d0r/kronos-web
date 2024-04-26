import React from 'react';
import { DeleteTask } from './delete-task';
import { getTaskMindset } from '@/app/lib/data';
import { Event, Task } from '@prisma/client';
import { minutesToDisplayDuration } from '@/app/utils/dateUtils';

interface EventCardProps {
    event: Event;
    task: Task;
    className?: string;
}

export default async function EventCard({ event, task, className } : EventCardProps) {
    const mindset = await getTaskMindset(task);
    const durationDisplay = minutesToDisplayDuration(task.duration);
    const currEventDuration = (event.endTime.getTime() - event.startTime.getTime()) / 1000 / 60;
    const cardSize : ('small' | 'medium' | 'large') = currEventDuration > 180 ? 'large' :
        currEventDuration > 60 ? 'medium' : 'small';
    
    return (<>
        <div className={`${className} w-1/3 max-w-[400px] bg-violet-600 text-white rounded-2xl flex flex-col justify-between items-center p-6 text-center`}
            style = {{
                // backgroundColor: mindset.colour
                height: cardSize === 'small' ? '15vh' : cardSize === 'medium' ? '25vh' : '50vh',
                minHeight: cardSize === 'small' ? '100px' : cardSize === 'medium' ? '150px' : '300px'
            }}
        >
            <div>{`${event.startTime.getHours().toString().padStart(2, '0')}:${event.startTime.getMinutes().toString().padStart(2, '0')}`}</div>
            <div>
                <div className='text-2xl'>{event.name}</div>
                <div>{durationDisplay}</div>
            </div>
            <div>{`${event.endTime.getHours().toString().padStart(2, '0')}:${event.endTime.getMinutes().toString().padStart(2, '0')}`}</div>
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
import React from 'react';
import { DeleteTask } from './delete-task';
import { getTaskMindset } from '@/app/lib/data';
import { Task } from '@prisma/client';

interface EventCardProps {
    task: Task;
    className?: string;
}

export default async function EventCard({ task, className } : EventCardProps) {
    const mindset = await getTaskMindset(task);
    

    // Get duration display
    const hours = task.duration / 60;
    const minutes = task.duration - hours * 60;
    const durationDisplay = `${hours > 0 ? String(hours) + 'h' : ''}${minutes > 0 ? String(minutes) + 'min' : ''}`;
    
    return (<>
        <div className={`${className} w-1/3 max-w-[400px] bg-violet-600 text-white rounded-2xl flex flex-col justify-center align-middle p-6 text-center`}
            style = {{
                // backgroundColor: mindset.colour
            }}
        >
            <div className='text-2xl'>{task.name}</div>
            <div>{durationDisplay}</div>
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
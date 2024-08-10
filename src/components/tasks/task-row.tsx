import React from 'react';
import { DeleteTask } from '@/components/task/delete-task';
import { getTaskMindset } from '@/lib/data';
import { Task } from '@prisma/client';
import { dateToDDMMYYYY } from '@/utils/dateUtils';

interface TaskCardProps {
    task: Task
}

export default async function TaskRow({ task } : TaskCardProps) {
    const mindset = await getTaskMindset(task);
    
    return (<>
        <div className='rounded-md flex flex-row justify-between align-middle p-6 w-full text-white' style={{background: mindset.colour}}>
            <div className='text-2xl w-1/5 text-left min-w-[200px]'>{task.name}</div>
            <div className='overflow-scroll flex flex-row justify-start align-middle gap-8 w-2/3'>
                <div><div className='font-bold'>Score</div><div>{task.timeScore}</div></div>
                <div><div className='font-bold'>Status</div><div>{task.status}</div></div>
                <div><div className='font-bold'>Mindset</div><div>{mindset.name}</div></div>
                <div><div className='font-bold'>Priority</div><div>{task.priority}</div></div>
                { task.duration && 
                    <div><div className='font-bold'>Duration</div><div>{task.duration}</div></div> 
                }
                { task.startTime && task.fixed &&
                    <div><div className='font-bold'>Start</div><div>{task.startTime.getHours()}</div></div> 
                }
                { task.startTime && !task.fixed &&
                    <div><div className='font-bold'>Ideal time</div><div>{task.startTime.getHours()}</div></div> 
                }
                { task.endTime && task.fixed &&
                    <div><div className='font-bold'>End</div><div>{task.endTime.getHours()}</div></div> 
                }
                { (task.repeat && task.repeatUnit === 'sessions' && task.repeatFrequency && task.repeatTimespan) && 
                    <div><div className='font-bold'>Frequency</div><div>x {task.repeatFrequency} / {task.repeatTimespan}</div></div> 
                }
                { task.preferredTimeOfDay.length > 0 && 
                    <div><div className='font-bold'>Fav Daytimes</div><div className='flex flex-col'>{
                        task.preferredTimeOfDay.map((time : string, idx : number) => {
                            return <span key={idx}>{time}</span>
                        })
                    }</div></div> 
                }
                { task.preferredDayOfWeek.length > 0 && 
                    <div><div className='font-bold'>Fav Days</div><div className='flex flex-col'>{
                        task.preferredDayOfWeek.map((day : string, idx : number) => {
                            return <span key={idx}>{day.slice(3)}</span>
                        })
                    }</div></div> 
                }
                { task.deadline && 
                    <div><div className='font-bold'>Repeat ends on</div><div>{dateToDDMMYYYY(task.deadline)}</div></div> 
                }
                { task.totalRepetitions && 
                    <div><div className='font-bold'>Repeat for</div><div>{task.totalRepetitions} reps</div></div> 
                }
                { task.totalDuration && 
                    <div><div className='font-bold'>Repeat up to</div><div>{task.totalDuration / 60} hours</div></div> 
                }

            </div>
            
            <DeleteTask id={task.id} />
        </div>
    </>);
}
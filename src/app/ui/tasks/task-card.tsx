import React from "react";
import { DeleteTask } from "./delete-task";

export default function TaskCard(props : any) {
    const task = props.task;
    return (<>
        <div className='rounded-md bg-violet-400 dark:bg-violet-700 flex flex-row justify-between align-middle p-6 w-auto'>
            <div className='text-2xl'>{task.name}</div>
            <div className='overflow-scroll flex flex-row justify-start align-middle gap-8 w-2/3'>
                <div><div className='font-bold'>Score</div><div>{task.priorityScore}</div></div>
                <div><div className='font-bold'>Status</div><div>{task.status}</div></div>
                <div><div className='font-bold'>Mindset</div><div>{task.mindset}</div></div>
                <div><div className='font-bold'>Priority</div><div>{task.priority}</div></div>
                { task.duration && 
                    <div><div className='font-bold'>Duration</div><div>{task.duration}</div></div> 
                }
                { task.startTime && task.scheduled &&
                    <div><div className='font-bold'>Start</div><div>{task.startTime.getHours()}</div></div> 
                }
                { task.startTime && !task.scheduled &&
                    <div><div className='font-bold'>Ideal time</div><div>{task.startTime.getHours()}</div></div> 
                }
                { task.endTime && task.scheduled &&
                    <div><div className='font-bold'>End</div><div>{task.endTime.getHours()}</div></div> 
                }
                { (task.repeat && task.repeatFrequency && task.repeatTimespan) && 
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
                { task.endRepeatDate && 
                    <div><div className='font-bold'>Repeat ends on</div><div>{task.endRepeatDate}</div></div> 
                }
                { task.totalRepetitions && 
                    <div><div className='font-bold'>Repeat ends after</div><div>{task.endRepeatDate} reps</div></div> 
                }
                { task.totalDuration && 
                    <div><div className='font-bold'>Repeat ends after</div><div>{task.endRepeatDate} hours spent</div></div> 
                }

            </div>
            
            <DeleteTask id={task.id} />
        </div>
    </>);
}
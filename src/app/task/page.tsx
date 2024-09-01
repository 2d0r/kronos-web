import { getTaskById, getEventById, getMindsetByTaskId, getRelatedProjects, getRelatedGoals, getRelatedTasks } from '@/lib/data';
import { EventWithRelations, TaskWithRelations, URLSearchParamsKronos } from '@/lib/types';
import BottomBar from '@/components/ui/bottom-bar';
import Menu from '@/components/menu';
import TopBar from '@/components/ui/top-bar';
import React from 'react';
import { addMinutesToDate, dateToHHMM, minutesBetweenDates } from '@/utils/date-utils';
import { adjustLightness } from '@/utils/colour-utils';
import NotesEditor from '@/components/notes-editor/notes-editor';
import CircleTimer from '@/components/circle-timer';
import { createEventPrisma } from '@/lib/actions';
import { Event } from '@prisma/client';
import '@/app/globals.css';
import Doing from '@/components/doing';

export default async function Page({ searchParams }: { searchParams: URLSearchParamsKronos }) {

    // const showMenu = searchParams.menu;
    // const taskId = searchParams.task;
    // const eventId = searchParams.event;

    // console.log('taskId, eventId', taskId, eventId);

    // let task = await getTaskById(taskId) || {} as TaskWithRelations;
    // let event: EventWithRelations;
    // const mindset = await getMindsetByTaskId(task.id);
    // const mindsetColour = mindset.colour;
    // const taskProjects = await getRelatedProjects(taskId);
    // const taskGoals = await getRelatedGoals(taskId);
    // const chainedTasks = await getRelatedTasks(taskId, 'task', 'all');

    // // If eventId => user has clicked on an existing event
    // if (eventId) {
    //     event = await getEventById(eventId) || {} as EventWithRelations;
    // } else {
    //     const response = await createEventPrisma({
    //         startTime: new Date(),
    //         endTime: addMinutesToDate(new Date(), task.duration || 60),
    //         taskId: taskId,
            
    //     } as Event);
    //     const data = await response.json();
    //     event = data.newEvent;
    // }

    // return <Doing />;
    return <></>

    // return (<div className='w-screen h-screen text-white flex justify-center'
    //     style={{ backgroundImage: `linear-gradient(to bottom left, ${adjustLightness(mindsetColour, 0.2)}, ${adjustLightness(mindsetColour, -0.2)})`}}>
    //     <TopBar/>
    //     {showMenu && <Menu />}
    //     <div className='w-full h-full items-start justify-start flex flex-row text-center'>

    //         {/* Left area */}
    //         <div className='h-full w-1/3 flex flex-col items-end py-16'>
    //             <div className='w-5/6 min-h-[16vh] max-h-[90vh] overflow-scroll'>
    //                 <NotesEditor 
    //                     notes={task.notes || ''} 
    //                     taskId={task.id} 
    //                     page='doing-task'
    //                 />
    //             </div>
    //         </div>

    //         {/* Central widget */}
    //         <div className='h-full w-1/3 flex flex-col gap-4 items-center justify-start py-4'>
    //             <div>{event ? dateToHHMM(event.startTime) : ''}</div>
    //             <div className='bg-white w-[0.5px] h-1/5'></div>
    //             <div className='text-3xl pb-2'>{event?.name || ''}</div>
    //             <div className='bg-glass-white wire-card w-[240px] h-[300px] flex flex-col justify-between items-center py-6'>
    //                 {/* <div className='text-sm'>{minutesToDisplayDuration(minutesBetweenDates(event.startTime, event.endTime))}</div> */}
    //                 <CircleTimer duration={event ? minutesBetweenDates(event.startTime, event.endTime) : 0}/>
    //             </div>
    //             <div className='bg-white w-[0.5px] h-1/5'></div>
    //             <div>{event ? dateToHHMM(event.endTime) : ''}</div>
    //         </div>

    //         {/* Right area */}
    //         <div className='h-full w-1/3 flex flex-col items-start py-16'>
    //             <div className='p-4 w-5/6 min-h-[16vh] max-h-[90vh] flex flex-col gap-2 items-start justify-startt text-white/50'>
    //                 { (taskGoals && taskGoals.length) ? <>
    //                     <span className='text-white/50 mt-2'>Goals</span>
    //                     <div className='flex gap-2 w-full overflow-scroll'>
    //                         {taskGoals.map(((goal) => {
    //                             return (<div className='border rounded-3xl border-white/20 h-36 w-32 flex items-center justify-center p-2' key={goal.id}>{goal ? goal.name : ''}</div>)
    //                         }))}
    //                     </div>
    //                 </> : <></>}
    //                 { (taskProjects && taskProjects.length) ? <>
    //                     <span className='text-white/50'>Projects</span>
    //                     <div className='flex gap-2 w-full overflow-scroll'>
    //                         { taskProjects.map(((project) => {
    //                             return (<div className='border rounded-3xl border-white/20 h-36 w-32 flex items-center justify-center p-2' key={project.id}
    //                             >{project ? project.name : ''}</div>)
    //                         })) }
    //                     </div>
    //                 </> : <></>}
    //                 { (chainedTasks && chainedTasks.length) ? <>
    //                     <span className='text-white/50'>Chained</span>
    //                     <div className='flex gap-2 w-full overflow-scroll'>
    //                         { chainedTasks.map(((task) => {
    //                             return (<div className='border rounded-3xl border-white/20 h-24 w-32 flex flex-col items-center justify-center p-2' key={task.id}>
    //                                     {task ? task.name : ''}
    //                                 </div>)
    //                         })) }
    //                     </div>
    //                 </> : <></>}
    //             </div>
    //         </div>
    //     </div>
    //     {/* Next task */}
    //     {/* {(eventQueue.length > 1 && minutesBetweenDates(new Date(), nextEvent.startTime) < 30) && 
    //         <EventCard event={nextEvent} mindset={nextEventMindset} nextEvent={true}  className='fixed bottom-[-10px] mb-[-45px] drop-shadow-2xl drop-shadow-white'/>
    //     } */}
    //     <BottomBar/>
    // </div> 
    // );
}
'use client';

import { fetchTask, fetchEventById } from '@/lib/data';
import { EventWithRelations, TaskWithRelations } from '@/lib/types';
import React, { useEffect, useState } from 'react';
import { addMinutesToDate, convertPropsToDate, dateToHHMM, minutesBetweenDates } from '@/utils/date-utils';
import { adjustLightness } from '@/utils/colour-utils';
import NotesEditor from '@/components/notes-editor/notes-editor';
import CircleTimer from '@/components/circle-timer';
import { createEventPrisma } from '@/lib/actions';
import { Event } from '@prisma/client';
import '@/app/globals.css';
import { usePathname, useSearchParams } from 'next/navigation';
import { NEUTRAL_MINDSET_COLOUR } from '@/lib/definitions';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import TopBar from './ui/top-bar';
import Menu from './menu';
import BottomBar from './ui/bottom-bar';

export default function Doing() {

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const showMenu = searchParams.get('menu');

    const [ task, setTask ] = useState<TaskWithRelations | null>(null);
    const [ event, setEvent ] = useState<EventWithRelations | null>(null);
    interface TaskRelations {taskProjects: TaskWithRelations[]; taskGoals: TaskWithRelations[]; chainedTasks: TaskWithRelations[]};
    const [ taskRelations, setTaskRelations ] = useState<TaskRelations>({
        taskProjects: [], taskGoals: [], chainedTasks: [],
    });
    const [ mindsetColour, setMindsetColour ] = useState<string>(NEUTRAL_MINDSET_COLOUR);
    const [ isDoing, setIsDoing ] = useState<boolean>(false);
    const [ cardHeight, setCardHeight ] = useState<string>('0px');
    const [ cardMinHeight, setCardMinHeight ] = useState<string>('0px');

    // If eventId => user has clicked on an existing event
    

    // const durationDisplay = minutesToDisplayDuration(minutesBetweenDates(event.startTime, event.endTime));
    

    // const [ start, end ] = getLocalStartAndEnd(event);
    // const [ startDate, endDate ] = [ new Date(start), new Date(end) ]

    const handleTaskStarted = async (taskId: string, eventId: string | null) => {
        // console.log('handleTaskStarted - taskId:', taskId, 'eventId:', eventId);
        let newTask: TaskWithRelations = taskId ? await fetchTask(taskId) || {} as TaskWithRelations : {} as TaskWithRelations;
        setTask(newTask);
        setMindsetColour(newTask.mindset?.colour || NEUTRAL_MINDSET_COLOUR);
        setTaskRelations((relations: any) => ({ 
            ...relations,
            taskProjects: newTask?.type === 'task' ? newTask.tasksParent.filter(el => el.type === 'project') : [],
            taskGoals: newTask?.type === 'task' ? newTask.tasksParent.filter(el => el.type === 'goal') : [],
            // chainedTasks: task?.type === 'task' ? task.task.filter(el => el.type === 'goal') : [],
        }));

        let newEvent: EventWithRelations;
        if (eventId) {
            newEvent = await fetchEventById(eventId) || {} as EventWithRelations;
            newEvent = convertPropsToDate(newEvent)
            setEvent(newEvent);
            // console.log('handleTaskStarted - newEvent:', newEvent);
        } else {
            const response = await createEventPrisma({
                startTime: new Date(),
                endTime: addMinutesToDate(new Date(), newTask.duration || 60),
                taskId: taskId,
                
            } as Event);
            const data = await response.json();
            newEvent = data.newEvent;
            setEvent(newEvent);
        }

        // Set card size
        const currEventDuration = newEvent ? (newEvent.endTime?.getTime() - newEvent.startTime?.getTime()) / 1000 / 60 :
            newTask.duration;
        const cardSize : ('small' | 'medium' | 'large') = currEventDuration > 180 ? 'large' :
            currEventDuration > 60 ? 'medium' : 'small';
        setCardHeight(cardSize === 'small' ? '20vh' : cardSize === 'medium' ? '30vh' : '50vh');
        setCardMinHeight(cardSize === 'small' ? '100px' : cardSize === 'medium' ? '150px' : '300px');
        // console.log('handleTaskStarted - cardSize:', cardSize);
    }

    useEffect(() => {
        const taskId = searchParams.get('task');
        const eventId = searchParams.get('event');
        if (taskId && taskId !== 'new') {
            handleTaskStarted(taskId, eventId);
        }
        // setTimeout(() => {
            setIsDoing(pathname.includes('task') ? true : false);
        // }, 1000)
        
    }, [searchParams]);

    return (<AnimatePresence>{isDoing && <div className='absolute w-screen h-screen flex items-center justify-center top-0 left-0'>
        <motion.div className={clsx('text-white flex justify-center', isDoing ? 'w-screen' : 'md:w-[350px] w-[90vw]')}
        style={{ 
            backgroundImage: `linear-gradient(to bottom left, ${adjustLightness(mindsetColour, 0.2)}, ${adjustLightness(mindsetColour, -0.2)})`,
            // height: isDoing ? '100vh' : cardHeight,
            // minHeight: isDoing ? 'none' : cardMinHeight,
        }}
        initial={{ opacity: 0, height: cardHeight, minHeight: cardMinHeight, borderRadius: 24, width: '350px' }} 
        animate={{ opacity: 1, height: '100vh', minHeight: 'none', borderRadius: 0, width: '100vw' }} 
        exit={{ opacity: 0, height: cardHeight, minHeight: cardMinHeight, borderRadius: 24, width: '350px' }} 
        layout>
            <TopBar/>
            {showMenu && <Menu />}
            <div className='w-full h-full items-start justify-start flex flex-row text-center'>

                {/* Left area */}
                <div className='h-full w-1/3 flex flex-col items-end py-16'>
                    <div className='w-5/6 min-h-[16vh] max-h-[90vh] overflow-scroll'>
                        {task && <NotesEditor 
                            notes={task?.notes || ''} 
                            taskId={task.id} 
                            page='doing-task'
                        />}
                    </div>
                </div>

                {/* Central widget */}
                <div className='h-full w-1/3 flex flex-col gap-4 items-center justify-start py-4'>
                    <div>{event ? dateToHHMM(event.startTime) : ''}</div>
                    <div className='bg-white w-[0.5px] h-1/5'></div>
                    <div className='text-3xl pb-2'>{event?.name || ''}</div>
                    <div className='bg-glass-white wire-card w-[240px] h-[300px] flex flex-col justify-between items-center py-6'>
                        {/* <div className='text-sm'>{minutesToDisplayDuration(minutesBetweenDates(event.startTime, event.endTime))}</div> */}
                        <CircleTimer duration={event ? minutesBetweenDates(event.startTime, event.endTime) : 0}/>
                    </div>
                    <div className='bg-white w-[0.5px] h-1/5'></div>
                    <div>{event ? dateToHHMM(event.endTime) : ''}</div>
                </div>

                {/* Right area */}
                <div className='h-full w-1/3 flex flex-col items-start py-16'>
                    <div className='p-4 w-5/6 min-h-[16vh] max-h-[90vh] flex flex-col gap-2 items-start justify-startt text-white/50'>
                        { (taskRelations.taskGoals && taskRelations.taskGoals.length) ? <>
                            <span className='text-white/50 mt-2'>Goals</span>
                            <div className='flex gap-2 w-full overflow-scroll'>
                                {taskRelations.taskGoals.map(((goal) => {
                                    return (<div className='border rounded-3xl border-white/20 h-36 w-32 flex items-center justify-center p-2' key={goal.id}>{goal ? goal.name : ''}</div>)
                                }))}
                            </div>
                        </> : <></>}
                        { (taskRelations.taskProjects && taskRelations.taskProjects.length) ? <>
                            <span className='text-white/50'>Projects</span>
                            <div className='flex gap-2 w-full overflow-scroll'>
                                { taskRelations.taskProjects.map(((project) => {
                                    return (<div className='border rounded-3xl border-white/20 h-36 w-32 flex items-center justify-center p-2' key={project.id}
                                    >{project ? project.name : ''}</div>)
                                })) }
                            </div>
                        </> : <></>}
                        { (taskRelations.chainedTasks && taskRelations.chainedTasks.length) ? <>
                            <span className='text-white/50'>Chained</span>
                            <div className='flex gap-2 w-full overflow-scroll'>
                                { taskRelations.chainedTasks.map(((task) => {
                                    return (<div className='border rounded-3xl border-white/20 h-24 w-32 flex flex-col items-center justify-center p-2' key={task.id}>
                                            {task ? task.name : ''}
                                        </div>)
                                })) }
                            </div>
                        </> : <></>}
                    </div>
                </div>
            </div>
            <BottomBar />
        </motion.div>
    </div>}</AnimatePresence>);
}

// {<motion.div className='text-white rounded-2xl flex flex-col justify-between items-center text-center cursor-pointer p-4 md:w-[350px] w-[90vw]'
//         initial={{ opacity: 0 }} animate={{ opacity: 0 }} exit={{ opacity: 1 }}
//         style = {{
//             backgroundColor: mindset.colour || NEUTRAL_MINDSET_COLOUR,
//             height: cardSize === 'small' ? '20vh' : cardSize === 'medium' ? '30vh' : '50vh',
//             minHeight: cardSize === 'small' ? '100px' : cardSize === 'medium' ? '150px' : '300px'
//         }}>
//             {/* <div className='text-sm w-full flex items-start'>{dateToHHMM(startDate)}</div>
//             <div>
//                 <div className='text-2xl'>{event.name}</div>
//                 <div>{durationDisplay}</div>
//             </div>
//             <div className='h-4'></div> */}
// </motion.div>}
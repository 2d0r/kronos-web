import { fetchTasksPrisma } from '@/app/lib/data';
import { CARD_SCALES, SearchParamProps } from '@/app/lib/definitions';
import { whiteGlassBg, wireCard } from '@/app/lib/styles';
import BottomBar from '@/app/ui/bottom-bar';
import Menu from '@/app/ui/menu';
import CreateTask from '@/app/ui/tasks/create-task';
import EventCard from '@/app/ui/tasks/event-card';
import TransportControls from '@/app/ui/tasks/transport-controls';
import TopBar from '@/app/ui/top-bar';
import clsx from 'clsx';
import React from 'react';

export default async function Page({ searchParams }: SearchParamProps) {
    const taskId = searchParams?.taskId;
    const tasks = await fetchTasksPrisma();
    const currTask = tasks.sort((a, b) => b.priorityScore - a.priorityScore)[0];
    const nextTask = tasks.sort((a, b) => b.priorityScore - a.priorityScore)[1];
    const showAddTask = searchParams?.showAddTask;

    return (<div className='w-screen h-screen bg-gradient-to-br from-violet-500 to-violet-800 text-white flex justify-center'>
        <TopBar searchParams={searchParams}/>
        {showAddTask && <CreateTask />}
        <div className='w-full h-full content-center justify-center flex flex-row text-center'>
            {/* Left space */}
            <div className='h-full w-1/3 flex flex-col items-end justify-center'>
                <div className={clsx(
                        wireCard, 'p-3 w-5/6'
                    )}>
                        <textarea 
                            className='w-full bg-transparent border-0 placeholder:text-white/40 focus:outline-none focus:outline-0'
                            placeholder={'Add notes'}
                        />
                </div>
            </div>
            {/* Timer */}
            <div className='h-full w-1/3 flex flex-col items-center justify-around'>
                <div>11:55</div>
                <div className={clsx('w-1/3 max-w-[400px] min-w-[240px] h-1/2 flex flex-col justify-between items-center py-6', whiteGlassBg, wireCard)}>
                    <div>
                        <div className='text-3xl'>Film TikToks</div>
                        <div className='text-sm'>1h 45min</div>
                    </div>
                    <div className={`border-[10px] border-white rounded-full w-5/6 aspect-square
                        flex flex-col items-center justify-center gap-1
                        `}
                    >
                        <div className='text-3xl'>2h</div>
                        <div className='text-xs'>LEFT</div>
                    </div>
                    <TransportControls taskId={taskId} context='taskPage' className='w-5/6'/>
                </div>
                <div>13:00</div>
            </div>
            {/* Right space */}
            <div className='h-full w-1/3 flex flex-col items-start justify-center'>
                <div className={clsx(
                    wireCard, 'p-3 w-5/6'
                )}>
                    <textarea 
                        className='w-full bg-transparent border-0 placeholder:text-white/40 focus:outline-none focus:outline-0'
                        placeholder={'Add item'}
                    />
                </div>
            </div>
        </div>
        {/* Next task */}
        <EventCard task={nextTask} key={nextTask.id} className='fixed bottom-[-10px] mb-[-45px] opacity-70 drop-shadow-2xl drop-shadow-white'/>

        <BottomBar searchParams={searchParams}/>
        { searchParams?.showMenu && <>
            <Menu />
        </>}  
    </div> 
    );
}
import React, { useEffect, useState } from 'react';
import { fetchTasksPrisma } from '../lib/data';
import TopBar from '../ui/top-bar';
import EventCard from '../ui/tasks/event-card';
import BottomBar from '../ui/bottom-bar';
import { CARD_SCALES, SMALL_CARD_HEIGHT, SearchParamProps } from '../lib/definitions';
import TransportControls from '../ui/tasks/transport-controls';
import Menu from '../ui/menu';
import { useSearchParams } from 'next/navigation';
import CreateTask from '../ui/tasks/create-task';

export default async function Page({ searchParams }: SearchParamProps) {
    const tasks = await fetchTasksPrisma();
    const currTask = tasks.sort((a, b) => b.priorityScore - a.priorityScore)[0];
    const nextTask = tasks.sort((a, b) => b.priorityScore - a.priorityScore)[1];
    const currCardDimension : ('small' | 'medium' | 'large') = currTask.duration > 180 ? 'large' :
        currTask.duration > 60 ? 'medium' : 'small';
    // const eventCardHeightPerc = CARD_SCALES[currCardDimension] * SMALL_CARD_HEIGHT / window.innerHeight * 100;
    const showAddTask = searchParams?.showAddTask;
    const showMenu = searchParams?.showMenu;

    return (<div className='w-screen h-screen bg-gradient-to-br from-violet-200 to-violet-400'>
        <TopBar searchParams={searchParams}/>
        { showAddTask && <CreateTask />}
        <div className='w-full h-full flex flex-col items-center justify-center'>
            {showMenu && <Menu />}
            <div className='w-full items-center justify-center flex flex-col gap-4'>
                <EventCard task={currTask} key={currTask.id}/>
                <TransportControls taskId={currTask.id} context='timeline'/>
            </div>
            {/* Next task */}
            <EventCard task={nextTask} key={nextTask.id} className='fixed bottom-[-10px] mb-[-45px] bg-gradient-to-br from-gray-400 to-gray-600 opacity-70'/>
        </div>
        <BottomBar searchParams={searchParams}/>
        
    </div>);
}
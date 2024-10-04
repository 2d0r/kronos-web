'use client';

import React, { useState } from 'react';
import OrganiseButton from '../buttons/organise-button';
import TaskBrowser from '../browser/task-browser';
import { setEvents, setMindsetColour, setTasks, useMindsetColour } from '@/store/store';
import useWindowSize from '@/lib/useWindowSize';
import { useDispatch } from 'react-redux';
import { deleteAllEvents } from '@/lib/actions';
import { fetchCurrentMindsetColour, fetchEvents, fetchTasks } from '@/lib/data';
import { addDaysToDate } from '@/utils/date-utils';
import { organiseTimespan } from '@/lib/organise-timespan';
import { adjustLightness } from '@/utils/colour-utils';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import Button from '../buttons/button';
import { TrashIcon } from 'lucide-react';

export default function TaskDrawer({className, onToggleDrawer} : {className?: string, onToggleDrawer: (bool: boolean) => void}) {

    const dispatch = useDispatch();
    const mindsetColour = useMindsetColour();
    const { windowWidth } = useWindowSize();
    const [ showDrawer, setShowDrawer ] = useState<boolean>(true);

    const handleDeleteAllEvents = async () => {
        await deleteAllEvents();
        const newEvents = await fetchEvents();
        dispatch(setEvents(newEvents));
    }
    const handleOrganise = async (daysAhead: number = 30) => {
        const currentTime = new Date();
        const xDaysFromNow = addDaysToDate(currentTime, daysAhead);
        await organiseTimespan({
            timespan: [currentTime, xDaysFromNow],
            // eventsToSchedule: [
            //     { taskId: '6d955a12-031e-4085-91a0-8a71d6b801cd', count: 0 },
            //     { taskId: '7d299836-67e2-482e-bac8-da6fb5ec8708', count: 2 },
            // ],
            // displaceAllFlexEvents: false,
        });
        // Update redux store
        setTimeout(async () => {
            const newEvents = await fetchEvents();
            const newTasks = await fetchTasks();
            const newMindsetColour = await fetchCurrentMindsetColour();
            dispatch(setEvents(newEvents));
            dispatch(setTasks(newTasks));
            dispatch(setMindsetColour(newMindsetColour));
        }, 1000);
    }
    const toggleDrawer = () => {
        const newState = !showDrawer;
        setShowDrawer(newState);
        onToggleDrawer(newState);
    }

    return (
    <motion.div 
        className={clsx(className, 'fixed z-[51] md:z-40 flex flex-col md:top-1/2 md:-translate-y-1/2 h-[40vh] md:h-[80vh] p-6 md:py-4 w-screen md:w-[24vw] bg-white shadow-xl',
            (windowWidth && windowWidth > 768) ? 'rounded-l-3xl shadow-xl' : 'rounded-t-3xl shadow-above',
            (windowWidth && windowWidth > 768) ? showDrawer ? 'right-0' : 'left-[98vw] pl-[2vw]'
                : showDrawer ? 'bottom-0' : 'top-[97vh]',
        )}
        transition={{ duration: 0.2 }} 
        // initial={{ translateY: '-50%', top: '50%' }} animate={{ translateY: '-50%', top: '50%' }}
    >
        {/* Drawer handle */}
        {windowWidth && windowWidth > 768 ? 
            <div className='bg-gray-200 h-10 w-1 rounded-sm cursor-pointer fixed left-[6px] top-1/2 -translate-y-1/2' onClick={toggleDrawer}></div>
            : <div className='w-full flex justify-center cursor-pointer h-0' onClick={toggleDrawer}>
                <div className='bg-gray-200 h-1 w-10 rounded-full cursor-pointer -mt-4 mb-2' ></div>
            </div>}
        <div className='overflow-y-scroll h-[80%]'>
            <TaskBrowser height='100%' direction='vertical' filterButtons={['mindset', 'sort']} />
        </div>
        <div className={('container w-full h-[10%] flex flex-row gap-4 justify-start items-start my-2 md:my-0')}>
            {/* <div className='divider' hidden={windowWidth && windowWidth <= 768 || false}></div> */}
            <OrganiseButton onOrganise={handleOrganise} colour={mindsetColour} />
            {/* Delete all events */}
            <Button 
                className='rounded-lg from-neutral-950 p-6 md:w-1/4 h-[4rem] items-center justify-center flex' 
                style={{ background: adjustLightness(mindsetColour, 0.95) }}
                onClick={handleDeleteAllEvents}
                ><TrashIcon color={mindsetColour} width={24} />
            </Button>
            {/* <div className='divider' hidden={windowWidth && windowWidth <= 768 || false}></div> */}
        </div>
        
    </motion.div>)
}

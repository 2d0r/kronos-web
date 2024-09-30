'use client';

import clsx from 'clsx';
import CalendarComponent from '@/components/calendar/calendar';
import { useSearchParams } from 'next/navigation';
import useWindowSize from '@/lib/useWindowSize';
import { useRef, useState } from 'react';
import TopBar from './ui/top-bar';
import { motion } from 'framer-motion';
import BottomBar from './ui/bottom-bar';
import Menu from './menu';
import TaskDrawer from './tasks/task-drawer';

interface TimelineBoardProps {
    children?: JSX.Element | JSX.Element[];
    back?: boolean;
    cardClassName?: string;
    timelineClassName?: string;
}

export default function Organiser ({
    children, back, cardClassName, timelineClassName,
} : TimelineBoardProps ) {

    const searchParams = useSearchParams();
    const showMenu = searchParams.get('menu');
    const { windowWidth } = useWindowSize();
    const [ showDrawer, setShowDrawer ] = useState<boolean>(true);

    const divRef = useRef<HTMLDivElement>(null);
    const drawerRef = useRef<HTMLDivElement>(null);

    return (
    <div className={clsx(timelineClassName, 'w-screen h-screen flex flex-col gap-8 justify-start',
        showDrawer ? '' : 'items-center'
    )}>
        <TopBar back={back} searchBar={true} />
        {showMenu && <Menu />}
        <motion.div id='whiteBoard' ref={divRef} 
            className={clsx(cardClassName, 
                'w-full md:max-h-[80vh] h-full md:h-[80vh]',
                'bg-white mt-[8vh] md:mt-[20vh] p-4 flex rounded-t-3xl md:rounded-3xl shadow-xl overflow-hidden',
                showDrawer ? 'md:w-[70vw] ml-[3vw]' : 'md:w-[80vw]',
            )}
            initial={{ y: windowWidth && windowWidth > 500 ? -300 : 300, opacity: 0, minHeight: '30vh' }} 
            animate={{ y: 0, opacity: 1, minHeight: 'none' }} 
            exit={{ y: windowWidth && windowWidth > 500 ? -300 : 300 }} 
            transition={{ duration: 0.2 }}
            layout='position'
        >
            <CalendarComponent  startWeekToday={true} />
        </motion.div>
        <TaskDrawer className='w-[100vw] md:w-[24vw] min-w-[18rem]' onToggleDrawer={(bool) => {setShowDrawer(bool)}} />
        <BottomBar />
    </div>);
};

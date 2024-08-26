'use client';

import { useRef } from 'react';
import BottomBar from '@/components/ui/bottom-bar';
import TopBar from '@/components/ui/top-bar';
import SearchBar from '@/components/search';
import Menu from '@/components/menu';
import clsx from 'clsx';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

interface TimelineBoardProps {
    children?: JSX.Element | JSX.Element[];
    back?: boolean;
    cardClassName?: string;
    timelineClassName?: string;
}

export default function TimelineBoard ({
    children, back, cardClassName, timelineClassName,
} : TimelineBoardProps ) {

    // Modals
    const searchParams = useSearchParams();
    const showMenu = searchParams.get('menu');

    // Detect resize and reload, in order to animate
    // const [, updateState] = useState<any>();
    // const forceUpdate = useCallback(() => updateState({}), []);
    const divRef = useRef<HTMLDivElement>(null);
    // useEffect(() => {
    //     if (divRef.current) {
    //       const resizeObserver = new ResizeObserver((entries) => {
    //         // console.log('resizing');
    //         forceUpdate();
    //       });
    //       resizeObserver.observe(divRef.current);
    //       // Clean up the observer on component unmount
    //       return () => {
    //         resizeObserver.disconnect();
    //       };
    //     }
    // }, []);


    return (<div className={clsx(timelineClassName, 'w-screen h-screen flex flex-col gap-8 items-center justify-start pt-[20vh]')}>
        <TopBar back={back}><SearchBar /></TopBar>
        {showMenu && <Menu />}
        <motion.div id='whiteBoard' ref={divRef} className={clsx(cardClassName, 'bg-white max-h-[80vh] rounded-3xl shadow-xl w-fit p-4 flex items-center justify-start')}
        initial={{ y: -300, opacity: 0, minHeight: '30vh' }} animate={{ y: 0, opacity: 1, minHeight: 'none' }} exit={{ y: -300 }} 
        transition={{ duration: 0.2 }}
        >
            {children}
        </motion.div>
        <BottomBar />
    </div>);
}
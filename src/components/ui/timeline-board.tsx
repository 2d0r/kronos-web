'use client';

import { useRef } from 'react';
import BottomBar from '@/components/ui/bottom-bar';
import TopBar from '@/components/ui/top-bar';
import SearchBar from '@/components/search';
import Menu from '@/components/menu';
import clsx from 'clsx';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import useWindowSize from '@/lib/useWindowSize';

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
    const { windowWidth } = useWindowSize();

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

    return (<div className={clsx(timelineClassName, 'w-screen h-screen flex flex-col gap-8 items-center justify-start')}>
        <TopBar back={back} searchBar={true} />
        {showMenu && <Menu />}
        <motion.div id='whiteBoard' ref={divRef} 
        className={clsx(cardClassName, 'bg-white mt-[10vh] md:mt-[20vh] md:max-h-[80vh] h-full md:h-auto w-full md:w-fit p-4 flex rounded-t-3xl md:rounded-3xl shadow-xl overflow-hidden')}
        initial={{ y: windowWidth && windowWidth > 500 ? -300 : 300, opacity: 0, minHeight: '30vh' }} 
        animate={{ y: 0, opacity: 1, minHeight: 'none' }} 
        exit={{ y: windowWidth && windowWidth > 500 ? -300 : 300 }} 
        transition={{ duration: 0.2 }}
        >
            {children}
        </motion.div>
        <BottomBar />
    </div>);
}
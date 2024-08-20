'use client';

import { FC } from 'react';
import BottomBar from '@/components/ui/bottom-bar';
import TopBar from '@/components/ui/top-bar';
import { NEUTRAL_MINDSET_COLOUR } from '@/lib/definitions';
import SearchBar from '@/components/search';
import Menu from '@/components/menu';
import { adjustLightness } from '@/utils/colour-utils';
import clsx from 'clsx';
import { useSearchParams } from 'next/navigation';
import { useMindsetColour } from '@/store/store';
import { motion } from 'framer-motion';

interface TimelineBoardProps {
    children?: JSX.Element | JSX.Element[];
    back?: boolean;
    cardClassName?: string;
    timelineClassName?: string;
}

const TimelineBoard: FC<TimelineBoardProps> = ({
    children, back, cardClassName, timelineClassName,
}) => {

    // Modals
    const searchParams = useSearchParams();
    const showMenu = searchParams.get('menu');
    const mindsetColour = useMindsetColour();

    return (<div className={clsx(timelineClassName, 'w-screen h-screen flex flex-col gap-8 items-center justify-start pt-[20vh]')} style={{
        backgroundImage: `linear-gradient(to bottom right, ${adjustLightness(mindsetColour || NEUTRAL_MINDSET_COLOUR, 0.5)}, ${adjustLightness(mindsetColour || NEUTRAL_MINDSET_COLOUR, 0.7)})`
    }}>
        <TopBar back={back}><SearchBar placeholder='Search events, dates...'/></TopBar>
        {showMenu && <Menu />}
        <motion.div className={clsx(cardClassName, 'bg-white max-h-[70vh] rounded-3xl shadow-xl w-fit p-4 flex items-center justify-start')}
        initial={{ y: -300, opacity: 0, minHeight: '30vh' }} animate={{ y: 0, opacity: 1, minHeight: 'none' }} exit={{ y: -300 }}
        transition={{ duration: 0.2 }}>
            {children}
        </motion.div>
        <BottomBar />
    </div>);
}

export default TimelineBoard;
'use client';

import BottomBar from '@/components/ui/bottom-bar';
import TopBar from '@/components/ui/top-bar';
import { NEUTRAL_MINDSET_COLOUR } from '@/lib/definitions';
import { adjustLightness } from '@/utils/colour-utils';
import clsx from 'clsx';
import CalendarComponent from '@/components/calendar/calendar';
import TaskBrowser from '@/components/browser/task-browser';
import Button from './buttons/button';
import { deleteAllEvents } from '@/lib/actions';
import { addDaysToDate } from '@/utils/date-utils';
import { organiseTimespan } from '@/lib/organise-timespan';
import { fetchCurrentMindsetColour, fetchEvents, fetchTasks } from '@/lib/data';
import { setTasks, setEvents, useMindsetColour, setMindsetColour } from '@/store/store';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';

interface TestViewProps {
    children?: JSX.Element | JSX.Element[];
    back?: boolean;
}

export default function TestView ({back} : TestViewProps) {

    const dispatch = useDispatch();
    const mindsetColour = useMindsetColour();


    // HANDLERS

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
        setTimeout(async () => {
            const newEvents = await fetchEvents();
            const newTasks = await fetchTasks();
            dispatch(setEvents(newEvents));
            dispatch(setTasks(newTasks));
            // const newMindsetColour = await fetchCurrentMindsetColour();
            // dispatch(setMindsetColour(newMindsetColour));
        }, 1000);
    }


    return (<div className={clsx('pt-[10vh] pb-[10vh] overflow-scroll w-screen h-screen flex flex-col gap-8 items-center justify-start')} style={{
        backgroundImage: `linear-gradient(to bottom right, ${adjustLightness(mindsetColour || NEUTRAL_MINDSET_COLOUR, 0.5)}, ${adjustLightness(mindsetColour || NEUTRAL_MINDSET_COLOUR, 0.7)})`
    }}>
        <TopBar back={back} className='!z-50' />
        <motion.div className={clsx('max-h-none z-[39] bg-white rounded-3xl shadow-xl md:w-fit w-full p-4 flex flex-col gap-4 items-center justify-start')}
        initial={{ y: -200 }} animate={{ y: 0 }}>
            <div className='h-[60vh] md:w-[80vw] w-[90vw]'>
                <CalendarComponent  startWeekToday={true} />
            </div>
            <TaskBrowser />
            <div className='container w-full flex flex-row gap-8 p-4 justify-center'>
                <Button 
                    className='rounded-md from-neutral-950 p-6 md:w-1/4' 
                    style={{ background: mindsetColour }}
                    onClick={() => handleOrganise(7)}
                    >Organise this week
                </Button>
                <Button 
                    className='rounded-md from-neutral-950 p-6 md:w-1/4' 
                    style={{ background: mindsetColour }}
                    onClick={handleDeleteAllEvents}
                    >Delete all events
                </Button>
            </div>
        </motion.div>
        <BottomBar />
    </div>)
};
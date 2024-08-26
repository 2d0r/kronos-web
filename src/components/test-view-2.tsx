'use client';

import clsx from 'clsx';
import CalendarComponent from '@/components/calendar/calendar-hexaflexa';
import TaskBrowser from '@/components/browser/task-browser';
import Button from './buttons/button';
import { deleteAllEvents } from '@/lib/actions';
import { addDaysToDate } from '@/utils/date-utils';
import { organiseTimespan } from '@/lib/organise-timespan';
import { fetchEvents, fetchTasks } from '@/lib/data';
import { setTasks, setEvents, useMindsetColour } from '@/store/store';
import { useDispatch } from 'react-redux';

interface TestViewProps {
    children?: JSX.Element | JSX.Element[];
    back?: boolean;
}

export default function TestView2 ({back} : TestViewProps) {

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
            dispatch(setEvents(newEvents));
            const newTasks = await fetchTasks();
            dispatch(setTasks(newTasks));
        }, 1000);
    }


    return (
        <div className={clsx('md:h-[100vh] h-[150vh] z-[39] md:w-fit w-full flex flex-col gap-4 items-center justify-start')}>
            <div className='md:h-[60vh] h-full md:w-[80vw] w-[90vw]'>
                <CalendarComponent  startWeekToday={true} />
            </div>
            <TaskBrowser />
            <div className='container w-full flex flex-row md:gap-8 gap-4 md:p-4 justify-center'>
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
        </div>
    );
};
'use client';

import clsx from 'clsx';
import CalendarComponent from '@/components/calendar/calendar';
import TaskBrowser from '@/components/browser/task-browser';
import Button from './buttons/button';
import { deleteAllEvents } from '@/lib/actions';
import { addDaysToDate } from '@/utils/date-utils';
import { organiseTimespan } from '@/lib/organise-timespan';
import { fetchCurrentMindsetColour, fetchEvents, fetchTasks, getCurrentMindsetColour } from '@/lib/data';
import { setTasks, setEvents, useMindsetColour, setMindsetColour } from '@/store/store';
import { useDispatch } from 'react-redux';
import OrganiseButton from './buttons/organise-button';
import useWindowSize from '@/lib/useWindowSize';
import { TrashIcon } from '@heroicons/react/24/outline';

interface TestViewProps {
    children?: JSX.Element | JSX.Element[];
    back?: boolean;
}

export default function TestView2 ({back} : TestViewProps) {

    const dispatch = useDispatch();
    const mindsetColour = useMindsetColour();
    const { windowWidth }= useWindowSize();
    

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

    return (
        <div className={clsx('md:h-[100vh] h-[150vh] z-30 md:w-fit w-full flex flex-col gap-4 items-center justify-start')}>
            <div className='md:h-[60vh] h-full md:w-[80vw] w-[90vw]'>
                <CalendarComponent  startWeekToday={true} />
            </div>
            <div className='container w-full flex flex-row gap-4 md:py-4 justify-center items-center'>
                <div className='divider' hidden={windowWidth && windowWidth <= 768 || false}></div>
                <OrganiseButton onOrganise={handleOrganise} colour={mindsetColour} />
                {/* <Button 
                    className='rounded-md from-neutral-950 p-6 md:w-1/4' 
                    style={{ background: mindsetColour }}
                    onClick={() => handleOrganise(7)}
                    >Organise this week
                </Button> */}
                <Button 
                    className='rounded-lg from-neutral-950 p-6 md:w-1/4 h-[4rem] items-center justify-center flex' 
                    style={{ background: mindsetColour }}
                    onClick={handleDeleteAllEvents}
                    ><TrashIcon color='white' width={24} />
                </Button>
                <div className='divider' hidden={windowWidth && windowWidth <= 768 || false}></div>
            </div>
            <TaskBrowser height='50svh' />
        </div>
    );
};
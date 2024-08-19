'use client';

import { FC } from 'react';
import BottomBar from '@/components/ui/bottom-bar';
import TopBar from '@/components/ui/top-bar';
import { NEUTRAL_MINDSET_COLOUR } from '@/lib/definitions';
import { adjustLightness } from '@/utils/colour-utils';
import clsx from 'clsx';
import CalendarComponent from '@/components/calendar/calendar-hexaflexa';
import TaskBrowser from '@/components/browser/task-browser';
import Button from './buttons/button';
import { deleteAllEvents } from '@/lib/actions';
import { addDaysToDate } from '@/utils/date-utils';
import { organiseTimespan } from '@/lib/organise-timespan';
import { fetchEvents, fetchTasks } from '@/lib/data';
import { setTasks, setEvents } from '@/store/store';
import { useDispatch } from 'react-redux';

interface TestViewProps {
    children?: JSX.Element | JSX.Element[];
    back?: boolean;
    mindsetColour: string;
}

const TestView: FC<TestViewProps> = ({
    back, mindsetColour,
}) => {

    const dispatch = useDispatch();


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


    return (<div className={clsx('pt-[10vh] pb-[10vh] overflow-scroll w-screen h-screen flex flex-col gap-8 items-center justify-start')} style={{
        backgroundImage: `linear-gradient(to bottom right, ${adjustLightness(mindsetColour || NEUTRAL_MINDSET_COLOUR, 0.5)}, ${adjustLightness(mindsetColour || NEUTRAL_MINDSET_COLOUR, 0.7)})`
    }}>
        <TopBar back={back}>
            {/* <SearchBar placeholder='Search events, dates...'/> */}
        </TopBar>
        <div className={clsx('max-h-none z-[39] bg-white rounded-3xl shadow-xl w-fit p-4 flex flex-col gap-4 items-center justify-start')}>
            <div className='h-[60vh] w-[80vw]'>
                <CalendarComponent 
                    mindsetColour={mindsetColour || NEUTRAL_MINDSET_COLOUR} 
                    startWeekToday={true}
                    ownTaskCard={false}
                />
            </div>
            <TaskBrowser 
                mindsetColour={mindsetColour || NEUTRAL_MINDSET_COLOUR}
                parentName='TestView'
            />
            <div className='container w-full flex flex-row gap-8 p-4 justify-center'>
                <Button 
                    className='rounded-md bg-gray-400 from-neutral-950 p-6 w-1/4' 
                    onClick={() => handleOrganise(7)}
                    >Organise this week
                </Button>
                <Button 
                    className='rounded-md bg-gray-400 from-neutral-950 p-6 w-1/4' 
                    onClick={handleDeleteAllEvents}
                    >Delete all events
                </Button>
            </div>
        </div>
        <BottomBar mindsetColour={mindsetColour} />
    </div>)
}

export default TestView;
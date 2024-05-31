import { fetchMindsets, fetchMindsetsWithRelations, fetchTasks, getCurrentMindsetColour, getEventMindset, getMindsetNames } from '../lib/data';
import { updateTimeScores } from '../lib/actions';
import { handleOrganise } from '../lib/organiser-idealFirst';
import TaskRow from '../ui/tasks/task-row';
import Link from 'next/link';
import TopBar from '../ui/top-bar';
import { EventWithRelations, NEUTRAL_MINDSET_COLOUR, URLSearchParamsKronos } from '../lib/definitions';
import BottomBar from '../ui/bottom-bar';
import Button from '@/components/button';
import prisma from '../lib/db';
import CalendarComponent from '../ui/calendar/calendar-hexaflexa';

export default async function Page({ searchParams }: {searchParams: URLSearchParamsKronos}) {
  const tasks = await fetchTasks();
  const mindsetList = await getMindsetNames();
  const mindsets = await fetchMindsetsWithRelations();
  const mindsetColour = await getCurrentMindsetColour();
  const events: EventWithRelations[] = await prisma.event.findMany({
      include: {
          task: true,
      }
  });
  const eventQueue = events.filter(event => event.startTime >= new Date());
  const eventMindset = await getEventMindset(eventQueue[0]);

  return (<>
    <TopBar searchParams={searchParams}/>
    <main className='flex flex-col items-center'>
      <div className='container w-full flex flex-row gap-8 p-4 justify-center'>
        <Button className='rounded-md bg-gray-400 from-neutral-950 p-6 w-1/4' onClick={updateTimeScores}>Rescore</Button>
        <Button className='rounded-md bg-gray-400 from-neutral-950 p-6 w-1/4' onClick={() => handleOrganise()}>Organise for 7 days</Button>
        <Link
          href="/timeline"
          className="flex bg-gray-400 items-center justify-center w-1/4 rounded-md px-4 py-2 text-sm text-white transition-colors"
          style={{background: NEUTRAL_MINDSET_COLOUR}}
        >
          Timeline
        </Link>
      </div>
      <div className='h-[60vh] w-[80vw]'>
        <CalendarComponent events={events} mindsetColour={mindsetColour || NEUTRAL_MINDSET_COLOUR} mindsets={mindsets} firstDayOfWeek={new Date().getDay()} />
      </div>
      <div className='container w-full p-4 flex flex-col gap-2 text-center items-center'>
        <h1 className='text-2xl font-semibold p-4'>Tasks</h1>
        {tasks.sort((a, b) => b.priorityScore - a.priorityScore).map((task, idx) => {
          return (
            <TaskRow task={task} key={idx}/>
        )})}
      </div>
      
    </main>
    <BottomBar searchParams={searchParams}/>
  </>);
}
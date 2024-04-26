import Calendar from '../ui/calendar/calendar-hexaflexa';
import TimelineCard from '../ui/timeline-card';
import { URLSearchParamsKronos } from '../lib/definitions';
import Menu from '../ui/menu';
import CreateTask from '../ui/tasks/create-task';
import { fetchEvents } from '../lib/data';

export default async function Page({searchParams}: {searchParams: URLSearchParamsKronos}) {
  const showMenu: boolean = searchParams?.showMenu;
  const showAddTask = searchParams?.showAddTask;
  const events = await fetchEvents();

  return (<>
    <TimelineCard searchParams={searchParams} back={true}>
      <>
        {showMenu && <Menu />}
        {showAddTask && <CreateTask />}
        <div className='h-[60vh] w-[80vw]'>
          <Calendar events={events}/>
        </div>
      </>
    </TimelineCard>
  </>);
}
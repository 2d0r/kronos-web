import CalendarComponent from '../ui/calendar/calendar-hexaflexa';
import TimelineCard from '../ui/timeline-card';
import { NEUTRAL_MINDSET_COLOUR, URLSearchParamsKronos } from '../lib/definitions';
import Menu from '../ui/menu';
import CreateTask from '../ui/tasks/create-task';
import { fetchEvents, fetchMindsetsWithRelations, getCurrentMindsetColour } from '../lib/data';

export default async function Page({searchParams}: {searchParams: URLSearchParamsKronos}) {
  const showMenu: boolean = searchParams?.menu;
  const showAddTask = searchParams?.addTask;
  const events = await fetchEvents();
  const mindsets = await fetchMindsetsWithRelations();
  const eventColours = events.map(event => {
    const eventMindset = mindsets.filter(mindset => mindset.tasks.some(task => {
      return Object.values(task).includes(event.taskId);
    }));
    return eventMindset[0].colour;
  });
  const mindsetColour = await getCurrentMindsetColour();

  return (<>
    <TimelineCard searchParams={searchParams} back={true}>
      <>
        {showMenu && <Menu />}
        {showAddTask && <CreateTask mindsets={mindsets}/>}
        <div className='h-[60vh] w-[80vw]'>
          <CalendarComponent events={events} eventColours={eventColours} mindsetColour={mindsetColour || NEUTRAL_MINDSET_COLOUR}/>
        </div>
      </>
    </TimelineCard>
  </>);
}
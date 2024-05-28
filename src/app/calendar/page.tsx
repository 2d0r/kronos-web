import CalendarComponent from '../ui/calendar/calendar-hexaflexa';
import TimelineCard from '../ui/timeline-card';
import { NEUTRAL_MINDSET_COLOUR, URLSearchParamsKronos } from '../lib/definitions';
import { fetchEvents, fetchMindsetsWithRelations, fetchTasks, getCurrentMindsetColour } from '../lib/data';
import TaskCard from '../ui/tasks/task-card';

export default async function Page({searchParams}: {searchParams: URLSearchParamsKronos}) {
  const showTaskCard = searchParams?.editTask;
  const events = await fetchEvents();
  const tasks = await fetchTasks();
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
        <div className='h-[60vh] w-[80vw]'>
          <CalendarComponent events={events} eventColours={eventColours} mindsetColour={mindsetColour || NEUTRAL_MINDSET_COLOUR} mindsets={mindsets}/>
        </div>
      </>
    </TimelineCard>
  </>);
}
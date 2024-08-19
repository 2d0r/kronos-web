import CalendarComponent from '@/components/calendar/calendar-hexaflexa';
import TimelineBoard from '@/components/ui/timeline-board';
import { NEUTRAL_MINDSET_COLOUR, URLSearchParamsKronos } from '@/lib/definitions';
import { getCurrentMindsetColour } from '@/lib/data';
import TaskCard from '@/components/tasks/task-card';

export default async function Page({ searchParams } : {searchParams: URLSearchParamsKronos}) {
  const mindsetColour = await getCurrentMindsetColour();
  const showTaskCard = !!searchParams.task;

  return (<>
    <TimelineBoard back={true} mindsetColour={mindsetColour || NEUTRAL_MINDSET_COLOUR}>
      <>
        <div className='h-[60vh] w-[80vw]'>
          <CalendarComponent mindsetColour={mindsetColour || NEUTRAL_MINDSET_COLOUR}/>
        </div>
      </>
    </TimelineBoard>
    {showTaskCard && <TaskCard />}
  </>);
}
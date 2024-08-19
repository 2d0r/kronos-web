import CalendarComponent from '@/components/calendar/calendar-hexaflexa';
import TimelineBoard from '@/components/ui/timeline-board';
import { URLSearchParamsKronos } from '@/lib/definitions';
import TaskCard from '@/components/tasks/task-card';

export default async function Page({ searchParams } : {searchParams: URLSearchParamsKronos}) {

  const showTaskCard = !!searchParams.task;

  return (<>
    <TimelineBoard back={true}>
      <>
        <div className='h-[60vh] w-[80vw]'>
          <CalendarComponent />
        </div>
      </>
    </TimelineBoard>
    {showTaskCard && <TaskCard />}
  </>);
}
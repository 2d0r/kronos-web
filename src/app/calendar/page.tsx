import CalendarComponent from '@/components/calendar/calendar';
import TimelineBoard from '@/components/ui/timeline-board';

export default async function Page() {

  return (<>
    <TimelineBoard back={true}>
      <div className='md:h-[60vh] h-full md:w-[80vw] w-[90vw]'>
        <CalendarComponent />
      </div>
    </TimelineBoard>
  </>);
}
import CalendarComponent from '@/components/calendar/calendar-hexaflexa';
import TimelineBoard from '@/components/ui/timeline-board';

export default async function Page() {

  return (<>
    <TimelineBoard back={true}>
      <div className='h-[60vh] w-[80vw]'>
        <CalendarComponent />
      </div>
    </TimelineBoard>
  </>);
}
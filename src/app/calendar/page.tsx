import CalendarComponent from '@/components/calendar/calendar-hexaflexa';
import TimelineBoard from '@/components/ui/timeline-board';
import { Suspense } from 'react';

export default async function Page() {

  return (<>
    
    <TimelineBoard back={true}>
      <div className='md:h-[60vh] h-full md:w-[80vw] w-[90vw]'>
        <Suspense>
          <CalendarComponent />
        </Suspense>
      </div>
    </TimelineBoard>
    
  </>);
}
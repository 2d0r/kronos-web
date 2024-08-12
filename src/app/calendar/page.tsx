import CalendarComponent from '@/components/calendar/calendar-hexaflexa';
import TimelineCard from '@/components/ui/timeline-board';
import { NEUTRAL_MINDSET_COLOUR, URLSearchParamsKronos } from '@/lib/definitions';
import { getEvents, getMindsetsWithRelations, getCurrentMindsetColour } from '@/lib/data';

export default async function Page({searchParams}: {searchParams: URLSearchParamsKronos}) {
  const events = await getEvents();
  const mindsets = await getMindsetsWithRelations();
  const mindsetColour = await getCurrentMindsetColour();

  return (<>
    <TimelineCard back={true} mindsets={mindsets} mindsetColour={mindsetColour || NEUTRAL_MINDSET_COLOUR}>
      <>
        <div className='h-[60vh] w-[80vw]'>
          <CalendarComponent events={events} mindsetColour={mindsetColour || NEUTRAL_MINDSET_COLOUR} mindsets={mindsets}/>
        </div>
      </>
    </TimelineCard>
  </>);
}
import CalendarComponent from '../ui/calendar/calendar-hexaflexa';
import TimelineCard from '../ui/timeline-card';
import { NEUTRAL_MINDSET_COLOUR, URLSearchParamsKronos } from '../lib/definitions';
import { fetchEvents, fetchMindsetsWithRelations, getCurrentMindsetColour } from '../lib/data';

export default async function Page({searchParams}: {searchParams: URLSearchParamsKronos}) {
  const events = await fetchEvents();
  const mindsets = await fetchMindsetsWithRelations();
  const mindsetColour = await getCurrentMindsetColour();

  return (<>
    <TimelineCard searchParams={searchParams} back={true} mindsets={mindsets} mindsetColour={mindsetColour || NEUTRAL_MINDSET_COLOUR}>
      <>
        <div className='h-[60vh] w-[80vw]'>
          <CalendarComponent events={events} mindsetColour={mindsetColour || NEUTRAL_MINDSET_COLOUR} mindsets={mindsets}/>
        </div>
      </>
    </TimelineCard>
  </>);
}
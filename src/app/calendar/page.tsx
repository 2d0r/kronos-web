'use client';

import Calendar from '../ui/calendar/calendar-hexaflexa';
import TimelineCard from '../ui/timeline-card';
import { URLSearchParamsKronos } from '../lib/definitions';

export default function Page({searchParams}: {searchParams: URLSearchParamsKronos}) {

  return (<TimelineCard searchParams={searchParams} back={true}>
    <div className='h-[60vh] w-[80vw]'>
      <Calendar />
    </div>
  </TimelineCard>);
}
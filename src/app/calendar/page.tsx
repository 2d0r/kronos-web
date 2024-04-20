'use client';

import Calendar from '../ui/calendar/calendar-hexaflexa';
import TimelineCard from '../ui/timeline-card';
import { URLSearchParamsKronos } from '../lib/definitions';
import Menu from '../ui/menu';

export default function Page({searchParams}: {searchParams: URLSearchParamsKronos}) {
  const showMenu: boolean = searchParams?.showMenu;

  return (<TimelineCard searchParams={searchParams} back={true}>
    <div className='h-[60vh] w-[80vw]'>
      {showMenu && <Menu />}
      <Calendar />
    </div>
  </TimelineCard>);
}
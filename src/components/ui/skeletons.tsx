'use client';

import useWindowSize from '@/lib/useWindowSize';
import TopBar from './top-bar';
import AddTaskButton from '../buttons/add-task-button';
import { AdjustmentsVerticalIcon, PauseCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Edit2, ShuffleIcon } from 'lucide-react';
import PlaySVG from '../svg/play-svg';

// Loading animation
const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export function TaskCardSkeleton() {
  return (<div className='z-50 absolute w-full h-full left-0 top-0 flex items-center justify-center bg-black/20 backdrop-blur-sm py-4'>
    <div className='m-20 z-50 top-1/3 rounded-2xl bg-white shadow-2xl text-sm text-black overflow-hidden'>
      {/* Top bar */}
      <div className={`${shimmer} w-full h-16 flex justify-between items-center p-4 border-b-[0.5px]`}></div>
      <div className='w-full flex overflow-hidden'>
        {/* Settings panel */}
        <div className={`${shimmer} w-[350px] h-[70vh] py-2 border-r-[0.5px] flex flex-col overflow-y-scroll task-input-fields`}></div>
        {/* Notes and checklist panel */}
        <div className={`${shimmer} w-[350px] flex flex-col task-card`}>
          <div className=''></div>
          <div className='h-[25vh] border-b-[0.5px] overflow-y-scroll'></div>
          <div className='h-[25vh]'></div>
        </div>
      </div>
      <div className='flex justify-between items-center gap-4 p-4 h-12 border-t-[0.5px]'>

      </div>
    </div>
  </div>)
}

export function EventCardSkeleton() {
    return (<>
        <div className='bg-white animate-shimmer rounded-2xl min-h-[150px] flex flex-col justify-between items-center text-center cursor-pointer p-4 md:w-[350px] w-[90vw]'>
            <div className='text-sm w-full flex items-start text-gray-100'>00:00</div>
            <div>
                <div className='text-2xl text-gray-100'>Event</div>
                <div>1h</div>
            </div>
            <div className='h-4'></div>
        </div>
    </>);
}

export function TransportControlsSkeleton({context}: {context: ('doingEvent' | 'timeline')}) {
    return (<>
        <div className='w-[350px] flex justify-between items-center'>
            { context === 'doingEvent' && <>
                <XMarkIcon width={32} color='white' className='animate-shimmer'/>
                <PauseCircleIcon color='white' width={48} />
                <AdjustmentsVerticalIcon width={32} />
            </>} { context === 'timeline' && <>
                <ShuffleIcon width={48} color={'white'} className='animate-shimmer' />
                <PlaySVG fill={'white'} />
                <Edit2 color={'white'} fill={'white'} className='animate-shimmer' />
            </>}      
        </div>
    </>);
}

export function TimelineSkeleton() {
    return (<>
        <div className='w-full h-full flex flex-col items-center justify-center overflow-hidden'>
            <div className='w-full justify-center items-center flex flex-col gap-4'>
                <div className='flex flex-col gap-4 w-full items-center'>
                    <EventCardSkeleton />
                    <TransportControlsSkeleton context='timeline'/>
                    {/* <TransportControls eventId={eventQueue[0].id} taskId={eventQueue[0].taskId} mindsetColour={mindsetColour} context='timeline'/> */}
                </div>
            </div>
        </div>
    </>)
}

export function OrganiserSkeleton() {
  return (<div className='w-screen h-screen flex flex-col gap-8 justify-start items-center'>
      <TopBar searchBar={true} />
      <div id='whiteBoard'
          className='animate-shimmer bg-white mt-[8vh] md:mt-[10vh] p-4 flex rounded-t-3xl md:rounded-3xl shadow-xl overflow-hidden
          md:w-[70vw] md:ml-[2.5vw] pb-[5vh] md:h-[80vh] h-[55vh]'
      >
          {/* <CalendarComponent  startWeekToday={true} /> */}
      </div>
      {/* <TaskDrawer className='w-[100vw] md:w-[25vw] md:justify-between' onToggleDrawer={(bool) => {setShowDrawer(bool)}} /> */}
      {/* {windowWidth && windowWidth > 768 && <BottomBar />} */}
  </div>)
}

export function TaskDrawerSkeleton() {
    const { windowWidth } = useWindowSize();

    return (<>
        <div 
            className='animate-shimmer fixed md:z-30 flex flex-col md:top-1/2 md:-translate-y-1/2 h-[40vh] md:h-[80vh] p-6 pb-2 md:py-4 w-screen md:w-[24vw] bg-white shadow-xl
            md:rounded-l-3xl md:shadow-xl rounded-t-3xl md:right-0 bottom-0'
            style={{ boxShadow: windowWidth && windowWidth <= 768 ? '0 -4px 10px 0px rgba(0, 0, 0, 0.1), 0 -2px 8px 0px rgba(0, 0, 0, 0.02)' : '' }}
        >
            {/* Drawer handle */}
            {windowWidth && windowWidth > 768 ? 
                <div className='bg-gray-200 h-10 w-1 rounded-sm cursor-pointer fixed left-[6px] top-1/2 -translate-y-1/2'></div>
                : <div className='w-full flex justify-center cursor-pointer h-0'>
                    <div className='bg-gray-200 h-1 w-10 rounded-full cursor-pointer -mt-4 mb-2' ></div>
                </div>}
            <div className='overflow-y-scroll h-[80%]'>
                {/* <TaskBrowser height='100%' direction='vertical' filterButtons={['mindset', 'sort']} /> */}
            </div>
            <div className={('container w-full flex gap-4 md:justify-start justify-center mb-2 md:my-0')}>
                <div className='animate-shimmer rounded-lg bg-gray-200 p-6 md:w-1/2 h-[4rem] items-center justify-center flex'></div>
                <div className='animate-shimmer rounded-lg bg-gray-200 p-6 md:w-1/2 h-[4rem] items-center justify-center flex'></div>
                {windowWidth && windowWidth < 768 && <AddTaskButton />}
                {/* <div className='divider' hidden={windowWidth && windowWidth <= 768 || false}></div> */}
            </div>
        </div>
    </>)
}
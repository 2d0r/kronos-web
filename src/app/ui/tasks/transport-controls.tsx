import clsx from 'clsx';
import Link from 'next/link';
import React from 'react';

export default function TransportControls ({ eventId, context, className }: { 
    eventId: string | undefined, context?: string, className?: string 
}) {
    return (<div className={clsx('w-1/3 max-w-[400px] flex justify-between items-center', className)}>
        { context === 'taskPage' && <>
            <Link href='/timeline'>
                <img src='../icons/close.svg' className='h-8 w-8' />
            </Link>
            <img src='../icons/pause.svg' className='h-12 w-12' />
            <img src='../icons/adjust.svg' className='h-8 w-8' />
        </>} { context === 'timeline' && <>
            <img src='../icons/shuffle.svg' className='h-8 w-8' />
            <Link href={`/timeline/task/?eventId=${eventId || '-1'}`}>
                <img src='../icons/play-pause.svg' className='h-12 w-12' />
            </Link>
            <img src='../icons/add-purple.svg' className='h-8 w-8' />
        </>}
        
    </div>);
}
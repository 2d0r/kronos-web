'use client';

import { recolorSVG, recolorSVGRef } from '@/app/utils/colourUtils';
import clsx from 'clsx';
import Link from 'next/link';
import React, { useEffect, useRef } from 'react';
import CloseIconSVG from '../svg/close-svg';
import PlaySVG from '../svg/play-svg';
import AddSVG from '../svg/add-svg';
import ShuffleSVG from '../svg/shuffle-svg';
import { Edit, Edit2, Edit3 } from 'lucide-react';

export default function TransportControls ({ eventId, taskId, context, className, mindsetColour }: { 
    eventId: string | undefined, taskId: string, context?: string, className?: string, mindsetColour: string
}) {


    return (<div className={clsx('w-[350px] flex justify-between items-center', className)}>
        { context === 'taskPage' && <>
            <Link href='/timeline'>
                <img src='../icons/close.svg' className='h-8 w-8' />
            </Link>
            <img src='../icons/pause.svg' className='h-12 w-12' />
            <img src='../icons/adjust.svg' className='h-8 w-8' />
        </>} { context === 'timeline' && <>
            <ShuffleSVG fill={mindsetColour} />
            <Link href={'/task'}>
                {/* <img src='../icons/play.svg' className='h-12 w-12' /> */}
                <PlaySVG fill={mindsetColour} />
            </Link>
            <Link href={`?editTask=${taskId}`}>
                <Edit2 color={mindsetColour} fill={mindsetColour} />
            </Link>
        </>}
        
    </div>);
}
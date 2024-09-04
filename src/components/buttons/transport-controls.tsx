'use client';

import clsx from 'clsx';
import Link from 'next/link';
import React from 'react';
import PlaySVG from '@/components/svg/play-svg';
import ShuffleSVG from '@/components/svg/shuffle-svg';
import { Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AdjustmentsVerticalIcon, PauseCircleIcon, PauseIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function TransportControls ({ eventId, taskId, context, className, mindsetColour }: { 
    eventId: string | undefined, 
    taskId: string | undefined,
    context?: string, 
    className?: string, 
    mindsetColour: string
}) {


    return (<motion.div className={clsx('w-[350px] flex justify-between items-center', className)}
    initial={{ opacity: 1 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        { context === 'taskPage' && <>
            <Link href='/'>
                <XMarkIcon width={32}/>
            </Link>
            <PauseCircleIcon color='white' width={48} />
            <AdjustmentsVerticalIcon width={32} />
        </>} { context === 'timeline' && <>
            <ShuffleSVG fill={mindsetColour} />
            <Link href={`/task?task=${taskId}&event=${eventId}&status=doing`}>
                <PlaySVG fill={mindsetColour} />
            </Link>
            <Link href={`?task=${taskId}&status=edit`}>
                <Edit2 color={mindsetColour} fill={mindsetColour} />
            </Link>
        </>}
        
    </motion.div>);
}
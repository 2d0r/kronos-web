'use client';

import React, { useState } from 'react';
import TimelineCard from '../ui/timeline-card';
import { URLSearchParamsKronos } from '../lib/definitions';
import Button from '@/components/button';

export default function Page({searchParams}: {searchParams: URLSearchParamsKronos}) {

    const [ view, setView ] = useState<string>('tasks');

    return (<>
        <TimelineCard searchParams={searchParams}>
            <div className='flex items-center justify-center h-16'>
                <Button />
            </div>
        </TimelineCard>
    </>);
}
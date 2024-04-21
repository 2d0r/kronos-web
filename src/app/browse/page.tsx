import React, { useState } from 'react';
import TimelineCard from '../ui/timeline-card';
import { URLSearchParamsKronos } from '../lib/definitions';
import Button from '@/components/button';
import { fetchMindsets, fetchTasksPrisma } from '../lib/data';
import TaskBrowser from '../ui/browse/task-browser';
import { Mindset, Task } from '@prisma/client';

export default async function Page({searchParams}: {searchParams: URLSearchParamsKronos}) {

    const tasks: Task[] = await fetchTasksPrisma();
    const mindsets: Mindset[] = await fetchMindsets();

    return (<>
        <TimelineCard searchParams={searchParams} back={true}>
            <TaskBrowser tasks={tasks} mindsets={mindsets}/>
        </TimelineCard>
    </>);
}
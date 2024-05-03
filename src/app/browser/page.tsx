import React, { useState } from 'react';
import TimelineCard from '../ui/timeline-card';
import { TaskWithRelations, URLSearchParamsKronos } from '../lib/definitions';
import Button from '@/components/button';
import { fetchMindsets, fetchTasks, fetchTasksWithRelations } from '../lib/data';
import TaskBrowser from '../ui/browse/task-browser';
import { Mindset, Task } from '@prisma/client';
import prisma from '../lib/db';

export default async function Page({searchParams}: {searchParams: URLSearchParamsKronos}) {

    const tasks: TaskWithRelations[] = await fetchTasksWithRelations(); 
    const mindsets: Mindset[] = await fetchMindsets();

    return (<>
        <TimelineCard searchParams={searchParams} back={true}>
            <TaskBrowser tasks={tasks} mindsets={mindsets}/>
        </TimelineCard>
    </>);
}
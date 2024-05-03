import React, { useState } from 'react';
import TimelineCard from '../ui/timeline-card';
import { NEUTRAL_MINDSET_COLOUR, TaskWithRelations, URLSearchParamsKronos } from '../lib/definitions';
import Button from '@/components/button';
import { fetchMindsets, fetchTasks, fetchTasksWithRelations, getCurrentMindsetColour } from '../lib/data';
import TaskBrowser from '../ui/browser/task-browser';
import { Mindset, Task } from '@prisma/client';
import prisma from '../lib/db';
import { getTaskColour } from '../utils/taskUtils';
import { adjustLightness } from '../utils/colourUtils';

export default async function Page({searchParams}: {searchParams: URLSearchParamsKronos}) {

    const tasks: TaskWithRelations[] = await fetchTasksWithRelations(); 
    const mindsets: Mindset[] = await fetchMindsets();
    const mindsetColour = await getCurrentMindsetColour();

    return (<>
        <TimelineCard searchParams={searchParams} back={true}>
            <TaskBrowser tasks={tasks} mindsets={mindsets} mindsetColour={adjustLightness(mindsetColour || NEUTRAL_MINDSET_COLOUR,  0.4)}/>
        </TimelineCard>
    </>);
}
import React from 'react';
import TimelineCard from '../ui/timeline-card';
import { NEUTRAL_MINDSET_COLOUR, TaskWithRelations, URLSearchParamsKronos } from '../lib/definitions';
import { fetchMindsets, fetchTaskWithRelations, fetchTasksWithRelations, getCurrentMindsetColour } from '../lib/data';
import TaskBrowser from '../ui/browser/task-browser';
import { Mindset } from '@prisma/client';
import EditTask from '../ui/tasks/edit-task';
import { useSearchParams } from 'next/navigation';
import TaskCard from '../ui/tasks/task-card';

export default async function Page({searchParams}: {searchParams: URLSearchParamsKronos}) {

    const tasks: TaskWithRelations[] = await fetchTasksWithRelations(); 
    const mindsets: Mindset[] = await fetchMindsets();
    const mindsetColour = await getCurrentMindsetColour();

    // const searchParams2 = useSearchParams();
    const editTaskId = searchParams.editTask;
    const editTask = await fetchTaskWithRelations(editTaskId || '');

    return (<>
        <TimelineCard searchParams={searchParams} back={true}>
            <TaskBrowser 
                tasks={tasks} 
                mindsets={mindsets} 
                mindsetColour={mindsetColour || NEUTRAL_MINDSET_COLOUR}
                searchParams={searchParams}
            />
        </TimelineCard>
        {editTaskId && <TaskCard task={editTask} mindsets={mindsets} />}
    </>);
}
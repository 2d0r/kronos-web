import React from 'react';
import TimelineCard from '../ui/timeline-card';
import { NEUTRAL_MINDSET_COLOUR, TaskWithRelations, URLSearchParamsKronos } from '../lib/definitions';
import { fetchMindsets, fetchTaskWithRelations, fetchTasksWithRelations, getCurrentMindsetColour } from '../lib/data';
import TaskBrowser from '../ui/browser/task-browser';
import { Mindset } from '@prisma/client';
import TaskCard from '../ui/tasks/task-card';

export default async function Page({searchParams}: {searchParams: URLSearchParamsKronos}) {

    let tasks: TaskWithRelations[] = await fetchTasksWithRelations(); 
    const mindsets: Mindset[] = await fetchMindsets();
    const mindsetColour = await getCurrentMindsetColour();
    
    // const showEditTask = !!searchParams.editTask;
    // const taskToEditId = searchParams.editTask;
    // const taskToEdit = taskToEditId === 'new' ? {} as TaskWithRelations : await fetchTaskWithRelations(taskToEditId || '');

    // const handleTasksUpdate = async () => {
    //     tasks = await fetchTasksWithRelations(); 
    // }

    return (<>
        <TimelineCard searchParams={searchParams} back={true}>
            <TaskBrowser 
                tasks={tasks} 
                mindsets={mindsets} 
                mindsetColour={mindsetColour || NEUTRAL_MINDSET_COLOUR}
                searchParams={searchParams}
                // onTasksUpdate={handleTasksUpdate}
            />
        </TimelineCard>
    </>);
}
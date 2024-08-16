'use client';

import { Priority, TaskType, Task, Mindset, Status } from '@prisma/client';
import ToDoItem from './to-do-item';
import { ActionType, TaskWithRelations } from '@/lib/definitions';
import Checkbox from './checkbox';
import { dateToDDMMYYYY, minutesToDisplayDuration } from '@/utils/dateUtils';
import { useEffect, useState } from 'react';

type SortItem = [('Priority' | 'Date' | 'Duration'), ('Ascending' | 'Descending')];

type Filters = {
    mindsetFilter: string, 
    typeFilter: TaskType, 
    tableView: boolean,
    sort?: SortItem, 
    logbookFilter?: boolean,
}

export default function TaskList ({
    initialTasks, onTaskUpdate, filters, mindsets,
} : {
    initialTasks: TaskWithRelations[],
    filters: Filters,
    onTaskUpdate: (taskId: string, action: ActionType) => void,
    mindsets: Mindset[],
}) {

    const [ taskList, setTaskList ] = useState<TaskWithRelations[]>([]);

    const updateTaskList = (newTaskList: TaskWithRelations[], filters: Filters) => {

        const { typeFilter, mindsetFilter, logbookFilter } = filters;

        console.log('task-list/updateTaskList - newTaskList:', newTaskList);

        // Filter tasks
        let filteredTasks = newTaskList.filter(task => !!task).filter(task => task.type === typeFilter);
        // Filter by status (for logbook)
        filteredTasks = filteredTasks.filter(task => logbookFilter ? task.status === 'done' : task.status !== 'done');
        // Filter by mindset
        if (mindsetFilter !== 'All') {
            const mindsetId = mindsets.filter(el => el.name === mindsetFilter)[0].id;
            filteredTasks = filteredTasks.filter(task => task.mindsetId === mindsetId);
        }
        // Sort tasks
        const priorityOrder = {
            [Priority['veryHigh']]: 0,
            [Priority['high']]: 1,
            [Priority['medium']]: 2,
            [Priority['low']]: 3
        }
        const { sort } = filters;
        let sortedTasks = sort ? sort[0] === 'Priority' ? filteredTasks.sort((a, b) => a.timeScore - b.timeScore).sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
            : sort[0] === 'Duration' ? filteredTasks.sort((a, b) => a.duration - b.duration)
            : sort[0] === 'Date' ? filteredTasks.filter(el => el.startTime !== null).sort((a, b) => (a.startTime?.getTime() || 0) - (b.startTime?.getTime() || 0)).concat(filteredTasks.filter(task => task.startTime === null))
            : filteredTasks : filteredTasks;
        (sort && sort[1] === 'Descending') && sortedTasks.reverse();

        setTaskList(sortedTasks);
    }



    // HANDLERS

    const handleTaskStatusUpdate = async (taskId: string, status: Status) => {
        const response = await fetch(`/task/${taskId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: status }),
        });
        const data = await response.json();
        const updatedTask = data.task;
        onTaskUpdate(taskId, 'edit');
        updateTaskList([...taskList.filter(task => task.id !== taskId), updatedTask], filters);
    }
    const handleTaskDelete = (taskId: string) => {
        onTaskUpdate(taskId, 'delete');
        updateTaskList(taskList.filter(task => task.id !== taskId), filters);
    }

    
    // HOOKS

    useEffect(() => {
        console.log('task-list/useEffect[]', initialTasks);
        updateTaskList(initialTasks, filters);
    }, []);
    // Update taskList when new filters come from browser
    useEffect(() => {
        console.log('task-list/useEffect[taskCache]', initialTasks);
        updateTaskList(initialTasks, filters);
    }, [initialTasks, filters]);


    const { tableView, typeFilter } = filters;
    
    if ( tableView === false ) {
        if ( typeFilter === 'task' ) {
            return (<div className='flex flex-col gap-2 w-full max-w-1/2 items-start justify-start py-2'>
                {taskList.map((task: TaskWithRelations) => {
                    return(
                        <ToDoItem key={task.id} task={task} onTaskStatusUpdated={handleTaskStatusUpdate} onTaskDelete={handleTaskDelete}/>
                    );
                })}
                { taskList.length === 0 &&
                    <div className='w-full flex justify-center text-gray-400 p-2'>Nothing left to do</div>
                }
            </div>);
        } else if ( typeFilter === 'project' || typeFilter === 'goal') {
            return (
                <div className='flex gap-2 w-full items-start justify-center'>
                    {taskList.map((task, idx) => {
                        return(
                            <div key={task.id} 
                                className='flex flex-col items-center justify-start gap-2 w-[200px] p-4 rounded-lg text-white'
                                style={{ background: task.mindset?.colour }}
                            >
                                <Checkbox type={task.type} status={task.status} taskId={task.id} fill='white' width='36' height='36'
                                    onTaskStatusUpdated={handleTaskStatusUpdate}
                                />
                                <span className='text-lg'>{task.name}</span>
                                <span className='text-sm'>{task.notes}</span>
                                <div className='w-full flex flex-col gap-2 items-start'>
                                    { initialTasks.filter(subtask => subtask.tasksParent?.some((parentTask: Task) => parentTask.id === task.id)).map(innerTask => {
                                        return(<div className={'flex gap-2 items-center text-sm'} key={innerTask.id}>
                                            <Checkbox taskId={innerTask.id} status={innerTask.status} type={innerTask.type}
                                                height='20' width='20' fill='white'
                                                onTaskStatusUpdated={handleTaskStatusUpdate}
                                            />
                                            <span>{innerTask.name}</span>
                                        </div>);
                                    })}
                                </div>
                            </div>
                        );
                    })}
                    { taskList.length === 0 &&
                        <div className='w-full flex justify-center text-gray-400 p-2'>{`No ${typeFilter}s to display`}</div>
                    }
                </div>
            )
        }
    } else if ( tableView === true ) {
        const newTaskDisplayRows = taskList.map(task => {
            return (
                <tr className='mb-4 rounded-lg' style={{background: task.mindset?.colour}} key={task.id}>
                    <td>{task.name}</td>
                    <td>{task.priority}</td>
                    <td>{minutesToDisplayDuration(task.duration)}</td>
                    <td>{task.repeat === true ? `${task.repeatFrequency} / ${task.repeatTimespan}`: 'one time'}</td>
                    <td>{task.deadline ? `on ${dateToDDMMYYYY(task.deadline)}` 
                        : task.totalDuration ? `after ${minutesToDisplayDuration(task.totalDuration)} hrs` 
                        : task.totalRepetitions ? `after ${task.totalRepetitions} reps`
                        : task.deadline ? `on ${dateToDDMMYYYY(task.deadline)}`
                        : '' }</td>
                </tr>
            );
        });
        return (<table className='task-table'>
            <thead><tr className=''>
                <th>Name</th>
                <th>Priority</th>
                <th>Duration</th>
                <th>Frequency</th>
                <th>End</th>
            </tr></thead>
            <tbody>
                {newTaskDisplayRows}
            </tbody>
        </table>);
    }
}
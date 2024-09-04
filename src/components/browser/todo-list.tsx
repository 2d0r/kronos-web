'use client';

import { useEffect, useState } from 'react';
import { TaskType, Task, Mindset, Status } from '@prisma/client';
import ToDoItem from './todo-item';
import Checkbox from './checkbox';
import { NEUTRAL_MINDSET_COLOUR, PRIORITY_ORDER } from '@/lib/definitions';
import { SortItem, TaskWithRelations } from '@/lib/types';
import { convertEmptyPropsToNull, convertPropsToDate, dateToDDMMYYYY, minutesToDisplayDuration } from '@/utils/date-utils';
import { useTasks, setTasks, useSearchQuery, setSearchQuery } from '@/store/store';
import { useDispatch } from 'react-redux';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { adjustLightness } from '@/utils/colour-utils';
import clsx from 'clsx';

type Filters = {
    mindset: string, 
    type: TaskType, 
    tableView: boolean,
    sort?: SortItem, 
    logbookView?: boolean,
}

export default function TodoList ({
    filters, mindsets,
} : {
    filters: Filters,
    mindsets: Mindset[],
}) {

    const tasks = useTasks();
    const dispatch = useDispatch();
    const [ todoList, setTodoList ] = useState<TaskWithRelations[]>(tasks);
    const pathname = usePathname();
    const searchQuery = useSearchQuery();

    const updateTodoList = (newTodoList: TaskWithRelations[], filters: Filters) => {
        // console.log('todo-list/updateTodoList - newTodoList:', newTodoList);

        // Filter by type
        let filteredTasks = newTodoList.filter(task => !!task).filter(task => task.type === filters.type);
        // Filter by status (for logbook)
        filteredTasks = filteredTasks.filter(task => filters.logbookView ? task.status === 'done' : task.status !== 'done');
        // Filter by mindset
        if (filters.mindset !== 'All') {
            const mindsetId = mindsets.filter(el => el.display === filters.mindset)[0].id;
            filteredTasks = filteredTasks.filter(task => task.mindsetId === mindsetId);
        }
        // Sort tasks
        
        let sortedTasks = filters.sort ? filters.sort[0] === 'Priority' ? filteredTasks.sort((a, b) => a.timeScore - b.timeScore).sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
            : filters.sort[0] === 'Duration' ? filteredTasks.sort((a, b) => a.duration - b.duration)
            : filters.sort[0] === 'Date' ? filteredTasks.filter(el => el.startTime !== null).sort((a, b) => (a.startTime?.getTime() || 0) - (b.startTime?.getTime() || 0)).concat(filteredTasks.filter(task => task.startTime === null))
            : filteredTasks : filteredTasks;
        (filters.sort && filters.sort[1] === 'Descending') && sortedTasks.reverse();

        setTodoList(sortedTasks);
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
        dispatch(setTasks([...todoList.filter(task => task.id !== taskId), updatedTask])); // .map(obj => convertDatePropsToLocaleStrings(obj))
    }
    const handleTaskDelete = (taskId: string) => {
        dispatch(setTasks(tasks.filter(task => task.id !== taskId))); // .map(obj => convertDatePropsToLocaleStrings(obj))
    }

    
    // HOOKS

    useEffect(() => {
        // console.log('todo-list/useEffect[]', tasks);
        updateTodoList(tasks.map(obj => convertPropsToDate(obj)), filters);
    }, []);
    // Update todoList when tasks are updated in store, or filters updated in TaskBrowser
    useEffect(() => {
        if (tasks.length) {
            const newTasks = searchQuery ? tasks.filter(task => task.name.toLowerCase().includes(searchQuery.toLowerCase())) : tasks;
            updateTodoList(newTasks.map(obj => convertPropsToDate(obj)), filters);
        }
        // console.log('todo-list/useEffect[tasks, filters]', tasks);
    }, [tasks, filters, searchQuery]);


    // RENDER
    
    if ( filters.tableView === false ) {
        if ( filters.type === 'task' ) {
            return (<div className='flex flex-col gap-2 w-full max-w-1/2 items-start justify-start py-2'>
                {todoList.map((task: TaskWithRelations) => {
                    return(
                        <ToDoItem key={task.id} task={task} onTaskStatusUpdated={handleTaskStatusUpdate} onTaskDelete={handleTaskDelete}/>
                    );
                })}
                { todoList.length === 0 &&
                    <div className='w-full flex justify-center text-gray-400 p-2'>Nothing left to do</div>
                }
            </div>);
        } else if ( filters.type === 'project' || filters.type === 'goal') {
            return (
                <div className='flex gap-2 w-full items-start justify-center'>
                    {todoList.map((task, idx) => {
                        task = convertEmptyPropsToNull(task);
                        const taskColour = task.mindset?.colour || NEUTRAL_MINDSET_COLOUR;
                        const taskColourLight = adjustLightness(taskColour, 0.2);

                        return(
                            <div key={task.id} 
                                className={clsx('flex items-center justify-start gap-2 w-[200px] p-4 rounded-lg text-white',
                                    filters.type === 'goal' ? 'flex-col items-center text-center text-lg' : 'text-md'
                                )}
                                style={{ background: filters.type === 'project' ? taskColourLight : taskColour }}
                            >
                                <Checkbox type={task.type} status={task.status} taskId={task.id} fill='white' width='36' height='36'
                                    onTaskStatusUpdated={handleTaskStatusUpdate}
                                />
                                <Link href={pathname + `?task=${task.id}&status=edit`}>{task.name}</Link>
                                <span className='text-sm'>{task.notes}</span>
                                {task.tasksChild?.length &&
                                <div className='w-full flex flex-col gap-2 items-start'>
                                    { todoList.filter(subtask => Array.isArray(subtask.tasksParent) && 
                                    subtask.tasksParent?.some((parentTask: Task) => parentTask.id === task.id)).map(innerTask => {
                                        return(<div className={'flex gap-2 items-center text-sm'} key={innerTask.id}>
                                            <Checkbox taskId={innerTask.id} status={innerTask.status} type={innerTask.type}
                                                height='20' width='20' fill='white'
                                                onTaskStatusUpdated={handleTaskStatusUpdate}
                                            />
                                            <span>{innerTask.name}</span>
                                        </div>);
                                    })}
                                </div>}
                            </div>
                        );
                    })}
                    { todoList.length === 0 &&
                        <div className='w-full flex justify-center text-gray-400 p-2'>{`No ${filters.type}s to display`}</div>
                    }
                </div>
            )
        }
    } else if ( filters.tableView === true ) {
        const newTaskDisplayRows = todoList.map(task => {
            // console.log('taskSerialised', taskSerialised);
            // const task = deserializeDates(taskSerialised);
            task = convertEmptyPropsToNull(task);

            return (
                <tr className='mb-4 rounded-lg' style={{background: task.mindset?.colour}} key={task.id}>
                    <td>{task.name}</td>
                    <td>{task.priority}</td>
                    <td>{minutesToDisplayDuration(task.duration)}</td>
                    <td>{task.repeat === true ? `${task.repeatFrequency} / ${task.repeatTimespan}`: 'one time'}</td>
                    <td>{task.deadline ? `on ${dateToDDMMYYYY(new Date(task.deadline))}` 
                        : task.totalDuration ? `after ${minutesToDisplayDuration(task.totalDuration)} hrs` 
                        : task.totalRepetitions ? `after ${task.totalRepetitions} reps`
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
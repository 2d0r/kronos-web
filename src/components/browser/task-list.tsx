'use client';

import { useEffect, useState } from 'react';
import { TaskType, Task, Mindset, Status } from '@prisma/client';
import ToDoItem from './to-do-item';
import Checkbox from './checkbox';
import { PRIORITY_ORDER, SortItem, TaskWithRelations } from '@/lib/definitions';
import { convertPropsToDate, dateToDDMMYYYY, minutesToDisplayDuration } from '@/utils/date-utils';
import { useTasks, setTasks } from '@/store/store';
import { useDispatch } from 'react-redux';

type Filters = {
    mindsetFilter: string, 
    typeFilter: TaskType, 
    tableView: boolean,
    sort?: SortItem, 
    logbookFilter?: boolean,
}

export default function TaskList ({
    filters, mindsets,
} : {
    filters: Filters,
    mindsets: Mindset[],
}) {

    const tasks = useTasks();
    const dispatch = useDispatch();
    const [ taskList, setTaskList ] = useState<TaskWithRelations[]>([]);

    const updateTaskList = (newTaskList: TaskWithRelations[], filters: Filters) => {

        const { typeFilter, mindsetFilter, logbookFilter } = filters;

        // console.log('task-list/updateTaskList - newTaskList:', newTaskList);

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
        
        const { sort } = filters;
        let sortedTasks = sort ? sort[0] === 'Priority' ? filteredTasks.sort((a, b) => a.timeScore - b.timeScore).sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
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
        dispatch(setTasks([...taskList.filter(task => task.id !== taskId), updatedTask])); // .map(obj => convertDatePropsToLocaleStrings(obj))
    }
    const handleTaskDelete = (taskId: string) => {
        dispatch(setTasks(tasks.filter(task => task.id !== taskId))); // .map(obj => convertDatePropsToLocaleStrings(obj))
    }

    
    // HOOKS

    useEffect(() => {
        // console.log('task-list/useEffect[]', tasks);
        updateTaskList(tasks.map(obj => convertPropsToDate(obj)), filters);
    }, []);
    // Update taskList when tasks are updated in store, or filters updated in TaskBrowser
    useEffect(() => {
        updateTaskList(tasks.map(obj => convertPropsToDate(obj)), filters);
        // console.log('task-list/useEffect[tasks, filters]', tasks);
    }, [tasks, filters]);


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
                                    { taskList.filter(subtask => subtask.tasksParent?.some((parentTask: Task) => parentTask.id === task.id)).map(innerTask => {
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
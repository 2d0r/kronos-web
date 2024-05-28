'use client';

import { Mindset, Priority, Status, Task, TaskType } from '@prisma/client';
import { FC, useEffect, useState } from 'react';
import { Dropdown } from '../tasks/form-fields';
import { DEFAULT_MINDSET_LIST, TaskWithRelations, URLSearchParamsKronos } from '@/app/lib/definitions';
import '@/app/globals.css';
import { dateToDDMMYYYY, minutesToDisplayDuration } from '@/app/utils/dateUtils';
import Checkbox from './checkbox';
import { getTaskColour } from '@/app/utils/taskUtils';
import { adjustLightness } from '@/app/utils/colourUtils';
import { History } from 'lucide-react';
import Link from 'next/link';
import ToDoItem from '../tasks/to-do-item';
import TaskCard from '../tasks/task-card';
import { fetchTaskWithRelations, fetchTasksWithRelations } from '@/app/lib/data';

type SortItem = [('Priority' | 'Date' | 'Duration'), ('Ascending' | 'Descending')];

const TaskBrowser: FC<{
    tasks: TaskWithRelations[], mindsets: Mindset[], mindsetColour: string, searchParams: URLSearchParamsKronos
}> = ({tasks, mindsets, mindsetColour, searchParams}) => {

    const [ tasksCache, setTasksCache ] = useState<TaskWithRelations[]>(tasks);
    const [ taskTypeFilter, setTaskTypeFilter ] = useState<TaskType>('task');
    const [ mindsetFilter, setMindsetFilter ] = useState<string>('All');
    const [ taskDisplay, setTaskDisplay ] = useState<JSX.Element[] | JSX.Element>(<></>);
    const [ tableView, setTableView ] = useState<boolean>(false);
    const [ logbookView, setLogbookView ] = useState<boolean>(searchParams?.logbook);
    const [ sort, setSort ] = useState<SortItem>(searchParams?.logbook ? ['Date', 'Descending'] : ['Priority', 'Descending']);

    const fetchTasks = async () => {
        console.log('before response');
        const response = await fetch('/api/task');
        console.log('response', response);
        const data = await response.json();
        console.log('response data', data);
        setTasksCache(data.tasks);
    };

    // Get task to edit from search parametres
    const showEditTask = !!searchParams.editTask;
    const taskToEditId = searchParams.editTask;
    const taskToEdit = taskToEditId === 'new' ? {} as TaskWithRelations : tasksCache.filter(el => el.id === taskToEditId)[0];

    const changeTaskDisplay = (mindsetFilter: string, type: TaskType, tableView: boolean, sort?: SortItem, logbookFilter?: boolean) => {
        const mindsetList = mindsetFilter === 'All' ? DEFAULT_MINDSET_LIST : [mindsetFilter];
        const tasksFilteredByType = tasksCache.filter(task => task.type === type);

        // FILTER TASKS
        let filteredTasks = tasksFilteredByType;
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
        let sortedTasks = sort ? sort[0] === 'Priority' ? filteredTasks.sort((a, b) => a.timeScore - b.timeScore).sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
            : sort[0] === 'Duration' ? filteredTasks.sort((a, b) => a.duration - b.duration)
            : sort[0] === 'Date' ? filteredTasks.filter(el => el.startTime !== null).sort((a, b) => (a.startTime?.getTime() || 0) - (b.startTime?.getTime() || 0)).concat(filteredTasks.filter(task => task.startTime === null))
            : filteredTasks : filteredTasks;
        (sort && sort[1] === 'Descending') && sortedTasks.reverse();
        
        let newTaskDisplay = () => <></>;
        if ( tableView === false ) {
            if ( type === 'task' ) {
                newTaskDisplay = () => { 
                    return (<div className='flex flex-col gap-2 w-full max-w-1/2 items-start justify-start py-2'>
                        {sortedTasks.map(task => {
                            // const taskColour = mindsets.filter(el => el.id === task.mindsetId)[0].colour;
                            return(
                                // <div key={task.id} className='flex gap-2 items-center'>
                                //     <Checkbox type={task.type} repeat={task.repeat} taskId={task.id} status={task.status} 
                                //         onTaskStatusUpdated={handleTaskStatusUpdated}
                                //         fill={task.mindset?.colour}
                                //     />
                                //     <span>{task.name}</span>
                                // </div>
                                <ToDoItem key={task.id} task={task} onTaskStatusUpdated={handleTaskStatusUpdated} onTaskDelete={handleTaskDelete}/>
                            );
                        })}
                        { sortedTasks.length === 0 &&
                            <div className='w-full flex justify-center text-gray-400 p-2'>No tasks to display</div>
                        }
                    </div>);
                };
            } else if ( type === 'project' || type === 'goal') {
                newTaskDisplay = () => {
                    return (
                        <div className='flex gap-2 w-full items-start justify-center'>
                            {sortedTasks.map((task, idx) => {
                                const taskColour = getTaskColour(task, mindsets);
                                return(
                                    <div key={task.id} 
                                        className='flex flex-col items-center justify-start gap-2 w-[200px] p-4 rounded-lg text-white'
                                        style={{ background: taskColour }}
                                    >
                                        <Checkbox type={task.type} status={task.status} taskId={task.id} fill='white' width='36' height='36'
                                            onTaskStatusUpdated={handleTaskStatusUpdated}
                                        />
                                        <span className='text-lg'>{task.name}</span>
                                        <span className='text-sm'>{task.notes}</span>
                                        <div className='w-full flex flex-col gap-2 items-start'>
                                            { tasksCache.filter(subtask => subtask.tasksParent.some((parentTask: Task) => parentTask.id === task.id)).map(innerTask => {
                                                return(<div className={'flex gap-2 items-center text-sm'} key={innerTask.id}>
                                                    <Checkbox taskId={innerTask.id} status={innerTask.status} type={innerTask.type}
                                                        height='20' width='20' fill='white'
                                                        onTaskStatusUpdated={handleTaskStatusUpdated}
                                                    />
                                                    <span>{innerTask.name}</span>
                                                </div>);
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                            { sortedTasks.length === 0 &&
                                <div className='w-full flex justify-center text-gray-400 p-2'>{`No ${type}s to display`}</div>
                            }
                        </div>
                    )
                }
            }
            
            setTaskDisplay(newTaskDisplay);
        } else if ( tableView === true ) {
            const newTaskDisplayRows = sortedTasks.map(task => {
                const taskColour = getTaskColour(task, mindsets);
                return (
                    <tr className='mb-4 rounded-lg' style={{background: taskColour}} key={task.id}>
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
            newTaskDisplay = () => {
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
            setTaskDisplay(newTaskDisplay);
        }
        
        
    }


    // Handlers

    const handleTaskStatusUpdated = (taskId: string, status: Status) => {
        setTasksCache((tasksCache) => {
            return tasksCache.map(task => {
                if (task.id === taskId) {
                    return { ...task, status: status }
                } 
                return task;
            });
        });
    };
    const handleTaskTypeFilter = (type: TaskType) => {
        setMindsetFilter('All'); // reset bucket when changing tab
        type === 'goal' && setTableView(false);
        changeTaskDisplay(mindsetFilter, type, type === 'goal' ? false : tableView, sort, logbookView);
        setTaskTypeFilter(type);
    }
    const handleMindsetFilter = (event : React.ChangeEvent<HTMLSelectElement>) => {
        const newMindsetFilter = event.target.value ? event.target.value : 'All';
        changeTaskDisplay(newMindsetFilter, taskTypeFilter, tableView, sort, logbookView);
        setMindsetFilter(newMindsetFilter);
    }
    const handleTableToggle = () => {
        changeTaskDisplay(mindsetFilter, taskTypeFilter, !tableView);
        setTableView(!tableView);
    }
    const handleSort = (event : React.ChangeEvent<HTMLSelectElement>) => {
        const newSort = [event.target.value, sort[1]] as SortItem;
        changeTaskDisplay(mindsetFilter, taskTypeFilter, tableView, newSort, logbookView);
        setSort(newSort);
    }
    const handleSortDirection = () => {
        const newSort = [sort[0], sort[1] === 'Ascending' ? 'Descending' : 'Ascending'] as SortItem;
        changeTaskDisplay(mindsetFilter, taskTypeFilter, tableView, newSort, logbookView);
        setSort(newSort);
    }
    const handleLogbookToggle = () => {
        const newLogbookView = !logbookView;
        const newSort : SortItem = newLogbookView ? ['Date', 'Descending'] : ['Priority', 'Descending'];
        changeTaskDisplay(mindsetFilter, taskTypeFilter, tableView, newSort, newLogbookView);
        setLogbookView(newLogbookView);
    }
    const handleTaskUpdate = (newTask: TaskWithRelations) => {
        // fetchTasks();
        setTasksCache(tasksCache.map(task => {
            return task.id === newTask.id ? {...task, ...newTask} : task;
        }));
    }
    const handleTaskCreate = (newTask: TaskWithRelations) => {
        // fetchTasks();
        console.log('newTask', newTask);
        const updatedTasksCache = setTasksCache(prevTaskCache => {
            const updatedTasksCache = [...prevTaskCache, {
                ...newTask,
                status: 'toDo' as Status,
                type: 'task' as TaskType,
            }];
            console.log('newTask - updatedTasksCache', updatedTasksCache);
            return updatedTasksCache;
        });
    }
    const handleTaskDelete = async (taskId: string) => {
        await fetch(`/task/${taskId}`, {
            method: 'DELETE'
        });
        setTasksCache(tasksCache.filter(task => task.id !== taskId));
        // fetchTasks();
    }


    // Hooks

    useEffect(() => {
        // fetchTasks();
        changeTaskDisplay(mindsetFilter, taskTypeFilter, tableView, sort, logbookView);
    }, []);
    // Update states for logbook
    useEffect(() => {
        (logbookView) && setSort(['Date', 'Descending']);
    }, [logbookView]);
    // Update logbookView based on searchaparams
    useEffect(() => {
        const newLogbookView = searchParams?.logbook;
        const newSort : SortItem = newLogbookView ? ['Date', 'Descending'] : ['Priority', 'Descending'];
        changeTaskDisplay(mindsetFilter, taskTypeFilter, tableView, newSort, newLogbookView);
        setLogbookView(newLogbookView);
    }, [searchParams.logbook]);
    useEffect(() => {
        changeTaskDisplay(mindsetFilter, taskTypeFilter, tableView, sort, logbookView);
    }, [tasksCache]);

    return(
        <div className='flex flex-col items-center gap-4'>
            {showEditTask && 
            <TaskCard 
                task={taskToEdit} 
                mindsets={mindsets} 
                onTaskUpdate={handleTaskUpdate} 
                onTaskCreate={handleTaskCreate}
                onTaskDelete={handleTaskDelete} 
            />}
            {/* Tab bar */}
            <div className='flex gap-4 items-center justify-center'>
                <button 
                    className='p-2 focus:text-white uppercase text-bold text-sm font-medium'
                    style={{
                        color: taskTypeFilter === 'task' ? mindsetColour : adjustLightness(mindsetColour, 0.5) ,
                        borderColor: mindsetColour,
                    }}
                    onClick={() => handleTaskTypeFilter('task')}
                >Tasks</button>
                <button 
                    className='p-2 focus:text-white uppercase text-bold text-sm font-medium'
                    style={{
                        color: taskTypeFilter === 'project' ? mindsetColour : adjustLightness(mindsetColour, 0.5) ,
                        borderColor: mindsetColour,
                    }}
                    onClick={() => handleTaskTypeFilter('project')}
                >Projects</button>
                <button 
                    className='p-2 focus:text-white uppercase text-sm font-medium'
                    style={{
                        color: taskTypeFilter === 'goal' ? mindsetColour : adjustLightness(mindsetColour, 0.5),
                        borderColor: mindsetColour,
                    }}
                    onClick={() => handleTaskTypeFilter('goal')}
                >Goals</button>
            </div>
            {/* Filter and sort bar */}
            { taskTypeFilter !== 'goal' && 
            <div className='flex gap-4 items-center'>
                <Dropdown 
                    fieldName='chooseMindset'
                    list={DEFAULT_MINDSET_LIST.concat('All')}
                    defaultValue='All'
                    onChange={handleMindsetFilter}
                    prompt=''
                    colour={mindsetColour}
                />
                <div className='rounded-md flex items-center' style={{ backgroundColor: adjustLightness(mindsetColour, 0.95) }}>
                    <Dropdown 
                        fieldName='chooseMindset'
                        list={['Priority', 'Date', 'Duration']}
                        defaultValue={sort[0]}
                        onChange={handleSort}
                        prompt=''
                        colour={mindsetColour}
                        className='!outline-0 border-0'
                    />
                    <div className='h-8 w-8 flex items-center cursor-pointer border-gray-200 rounded-md' onClick={() => handleSortDirection()}>
                        <img src={sort[1] === 'Ascending' ? './icons/sort-desc.svg' : './icons/sort-asc.svg'} />
                    </div>
                </div>
                
                <div className='h-8 w-8 flex items-center cursor-pointer border-gray-200 rounded-md' onClick={() => handleTableToggle()}>
                    <img src={ tableView === false ? './icons/table-rows.svg' : './icons/list-bulleted.svg'} />
                </div>
                <Link 
                    href={logbookView ? '/browser' : '/browser?logbook=true'} 
                    className='h-8 w-8 flex items-center cursor-pointer border-gray-200 rounded-md' 
                    onClick={() => handleLogbookToggle()}
                >
                    <History color={logbookView ? 'black' : 'lightgrey'}/>
                </Link>
            </div>}
            <div className='flex h-2/3 w-full items-start justify-center gap-6'>
                {taskDisplay}
            </div>
        </div>
    );
}

export default TaskBrowser;

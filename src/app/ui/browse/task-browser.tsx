'use client';

import { Mindset, Priority, Status, Task, TaskType } from '@prisma/client';
import { FC, useEffect, useState } from 'react';
import { Dropdown } from '../tasks/form-fields';
import { DEFAULT_MINDSET_LIST, TaskWithRelations } from '@/app/lib/definitions';
import clsx from 'clsx';
import '@/app/globals.css';
import { dateToDDMMYYYY, minutesToDisplayDuration } from '@/app/utils/dateUtils';
import Checkbox from '../buttons/checkbox';

type SortItem = [('Priority' | 'Date' | 'Duration'), ('Ascending' | 'Descending')];

const TaskBrowser: FC<{tasks: TaskWithRelations[], mindsets: Mindset[]}> = ({tasks, mindsets}) => {

    const [ taskCache, setTaskCache ] = useState<TaskWithRelations[]>(tasks);
    const handleTaskStatusUpdated = (taskId: string, status: Status) => {
        setTaskCache((taskCache) => {
            return taskCache.map(task => {
                if (task.id === taskId) {
                    return { ...task, status: status }
                } 
                return task;
            });
        });
    };

    const [ taskTypeFilter, setTaskTypeFilter ] = useState<TaskType>('task');
    const [ mindsetFilter, setMindsetFilter ] = useState<string>('All');
    const [ taskDisplay, setTaskDisplay ] = useState<JSX.Element[] | JSX.Element>(<></>);
    const [tableView, setTableView] = useState<boolean>(false);
    const [ sort, setSort ] = useState<SortItem>(['Priority', 'Descending']);

    const changeTaskDisplay = (mindsetFilter: string, type: TaskType, tableView: boolean, sort?: SortItem) => {
        const mindsetList = mindsetFilter === 'All' ? DEFAULT_MINDSET_LIST : [mindsetFilter];
        const tasksFilteredByType = taskCache.filter(task => task.type === type);

        // Filter tasks
        let filteredTasks = tasksFilteredByType;
        if (mindsetFilter !== 'All') {
            const mindsetId = mindsets.filter(el => el.name === mindsetFilter)[0].id;
            filteredTasks = tasksFilteredByType?.filter(task => task.mindsetId === mindsetId);
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
                    return (
                        <div className='flex flex-col gap-2 w-full max-w-1/2 items-start justify-start'>
                            {/* <div className='pb-2'>{camelcaseToTitlecase(mindset)}</div> */}
                            
                            {sortedTasks.map(task => {
                                const taskColour = mindsets.filter(el => el.id === task.mindsetId)[0].colour;
                                return(
                                    <div key={task.id} className='flex gap-2 items-center'>
                                        <Checkbox type={task.type} taskId={task.id} status={task.status} 
                                            onTaskStatusUpdated={handleTaskStatusUpdated}
                                            fill={taskColour}
                                        />
                                        <span>{task.name}</span>
                                    </div>
                                );
                                
                            })}
                        </div>
                    );
                };
            } else if ( type === 'project' || type === 'goal') {
                newTaskDisplay = () => {
                    return (
                        <div className='flex gap-2 w-full items-start justify-start'>
                            {sortedTasks.map((task, idx) => {
                                const taskColour = mindsets.filter(el => el.id === task.mindsetId)[0].colour;
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
                                            { taskCache.filter(subtask => subtask.tasksParent.some((parentTask: Task) => parentTask.id === task.id)).map(innerTask => {
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
                        </div>
                    )
                }
            }
            
            setTaskDisplay(newTaskDisplay);
        } else if ( tableView === true ) {
            const newTaskDisplayRows = sortedTasks.map(task => {
                return (
                    <tr className='mb-4 rounded-lg bg-violet-600' key={task.id}>
                        <td>{task.name}</td>
                        <td>{task.priority}</td>
                        <td>{minutesToDisplayDuration(task.duration)}</td>
                        <td>{task.repeat === true ? `${task.repeatFrequency} / ${task.repeatTimespan}`: 'one time'}</td>
                        <td>{task.endRepeatDate ? `on ${dateToDDMMYYYY(task.endRepeatDate)}` 
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

    const handleTaskTypeFilter = (type: TaskType) => {
        setMindsetFilter('All'); // reset bucket when changing tab
        type === 'goal' && setTableView(false);
        changeTaskDisplay(mindsetFilter, type, type === 'goal' ? false : tableView);
        setTaskTypeFilter(type);
    }
    const handleMindsetFilter = (event : React.ChangeEvent<HTMLSelectElement>) => {
        const newMindsetFilter = event.target.value ? event.target.value : 'All';
        changeTaskDisplay(newMindsetFilter, taskTypeFilter, tableView);
        setMindsetFilter(newMindsetFilter);
    }
    const handleTableToggle = () => {
        changeTaskDisplay(mindsetFilter, taskTypeFilter, !tableView);
        setTableView(!tableView);
    }
    const handleSort = (event : React.ChangeEvent<HTMLSelectElement>) => {
        const newSort = [event.target.value, sort[1]] as SortItem;
        changeTaskDisplay(mindsetFilter, taskTypeFilter, tableView, newSort);
        setSort(newSort);
    }
    const handleSortDirection = () => {
        const newSort = [sort[0], sort[1] === 'Ascending' ? 'Descending' : 'Ascending'] as SortItem;
        changeTaskDisplay(mindsetFilter, taskTypeFilter, tableView, newSort);
        setSort(newSort);
    }

    // Hooks

    useEffect(() => {
        changeTaskDisplay(mindsetFilter, taskTypeFilter, tableView);
    }, []);

    return(
        <div className='flex flex-col items-center gap-4'>
            {/* <div className='bg-gray-100 w-full'> */}
            <div className='flex gap-4 items-center justify-center'>
                <button 
                    className={clsx('border-[1px] border-gray-200 rounded-md p-2',
                        taskTypeFilter === 'goal' && 'bg-gray-200' 
                    )} 
                    onClick={() => handleTaskTypeFilter('goal')}
                >Goals</button>
                <button 
                    className={clsx('border-[0.5px] border-gray-200 rounded-md p-2',
                        taskTypeFilter === 'project' ? 'bg-gray-200' : '' 
                    )} 
                    onClick={() => handleTaskTypeFilter('project')}>Projects</button>
                <button 
                    className={clsx('border-[0.5px] border-gray-200 rounded-md p-2',
                        taskTypeFilter === 'task' ? 'bg-gray-200' : '' 
                    )} 
                    onClick={() => handleTaskTypeFilter('task')}>Tasks</button>
            </div>
            { taskTypeFilter !== 'goal' && 
            <div className='flex gap-4 items-center'>
                <Dropdown 
                    fieldName='chooseMindset'
                    list={DEFAULT_MINDSET_LIST.concat('All')}
                    defaultValue='All'
                    onChange={handleMindsetFilter}
                    prompt=''
                />
                <div className='h-8 w-8 flex items-center cursor-pointer border-gray-200 rounded-md' onClick={() => handleTableToggle()}>
                    <img src={ tableView === false ? './icons/table-rows.svg' : './icons/list-bulleted.svg'} />
                </div>
                <Dropdown 
                    fieldName='chooseMindset'
                    list={['Priority', 'Date', 'Duration']}
                    defaultValue='All'
                    onChange={handleSort}
                    prompt=''
                />
                <div className='h-8 w-8 flex items-center cursor-pointer border-gray-200 rounded-md' onClick={() => handleSortDirection()}>
                    <img src={sort[1] === 'Ascending' ? './icons/sort-desc.svg' : './icons/sort-asc.svg'} />
                </div>
            </div>}
            {/* </div> */}
            <div className='flex h-2/3 w-full items-start justify-center gap-6'>
                {taskDisplay}
            </div>
        </div>
    );
}

export default TaskBrowser;

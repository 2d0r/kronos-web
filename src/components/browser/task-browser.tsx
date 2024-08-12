'use client';

import { Mindset, Status, TaskType } from '@prisma/client';
import { FC, useEffect, useState } from 'react';
import { Dropdown } from '@/components/form-fields';
import { ActionType, DEFAULT_MINDSET_LIST, TaskWithRelations, URLSearchParamsKronos } from '@/lib/definitions';
import '@/app/globals.css';
import { adjustLightness } from '@/utils/colourUtils';
import { History } from 'lucide-react';
import Link from 'next/link';
import TaskCard from '@/components/tasks/task-card';
import TaskList from '@/components/browser/task-list';
import { fetchTask } from '@/lib/data';
import { useSearchParams } from 'next/navigation';

type SortItem = [('Priority' | 'Date' | 'Duration'), ('Ascending' | 'Descending')];

const TaskBrowser: FC<{
    tasks: TaskWithRelations[], 
    mindsets: Mindset[], 
    mindsetColour: string,
    onTasksUpdate?: (tasks: TaskWithRelations[]) => void,
    parentName?: string,
}> = ({tasks, mindsets, mindsetColour, onTasksUpdate, parentName}) => {

    const searchParams = useSearchParams();

    const [ tasksCache, setTasksCache ] = useState<TaskWithRelations[]>(tasks);
    const [ taskTypeFilter, setTaskTypeFilter ] = useState<TaskType>('task');
    const [ mindsetFilter, setMindsetFilter ] = useState<string>('All');
    const [ tableView, setTableView ] = useState<boolean>(false);
    const [ logbookView, setLogbookView ] = useState<boolean>(!!searchParams.get('logbook'));
    const [ sort, setSort ] = useState<SortItem>(searchParams.get('logbook') ? ['Date', 'Descending'] : ['Priority', 'Ascending']);


    // MODALS

    const showTaskCard = !!searchParams.get('task');


    // HANDLERS

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
        setTaskTypeFilter(type);
    }
    const handleMindsetFilter = (event : React.ChangeEvent<HTMLSelectElement>) => {
        const newMindsetFilter = event.target.value ? event.target.value : 'All';
        setMindsetFilter(newMindsetFilter);
    }
    const handleTableToggle = () => {
        setTableView(!tableView);
    }
    const handleSort = (event : React.ChangeEvent<HTMLSelectElement>) => {
        const newSort = [event.target.value, sort[1]] as SortItem;
        setSort(newSort);
    }
    const handleSortDirection = () => {
        const newSort = [sort[0], sort[1] === 'Ascending' ? 'Descending' : 'Ascending'] as SortItem;
        setSort(newSort);
    }
    const handleLogbookToggle = () => {
        const newLogbookView = !logbookView;
        const newSort : SortItem = newLogbookView ? ['Date', 'Descending'] : ['Priority', 'Descending'];
        setLogbookView(newLogbookView);
        setSort(newSort);
    }
    const handleTaskDelete = async (taskId: string) => {
        await fetch(`/task/${taskId}`, {
            method: 'DELETE'
        });
        const newTasksCache = tasksCache.filter(task => task.id !== taskId)
        setTasksCache(newTasksCache);
        onTasksUpdate && onTasksUpdate(newTasksCache); // Send cache to parent component
    }
    const handleTaskUpdate = async (taskId: string, action: ActionType) => {
        switch(action) {
            case 'create':
                const newTask = await fetchTask(taskId);
                setTasksCache(prevCache => ([ ...prevCache, newTask ]));
            case 'delete':
                if (tasksCache.length)
                    setTasksCache(prevCache => prevCache.filter(task => task.id !== taskId));
            case 'edit':
                const editedTask = await fetchTask(taskId);
                setTasksCache(prevCache => ([ ...prevCache.filter(task => task.id !== taskId), editedTask ]));
        }
    }


    // HOOKS

    // Update states for logbook
    useEffect(() => {
        (logbookView) && setSort(['Date', 'Descending']);
    }, [logbookView]);
    // Update logbookView based on searchaparams
    useEffect(() => {
        const newLogbookView = !!searchParams.get('logbook');
        const newSort : SortItem = newLogbookView ? ['Date', 'Descending'] : ['Priority', 'Descending'];
        setLogbookView(newLogbookView);
    }, [searchParams]);

    return(
        <div className='flex flex-col items-center gap-4'>
            {(showTaskCard && parentName !== 'TestView') &&
            <TaskCard 
                mindsets={mindsets}
                onTaskUpdate={handleTaskUpdate}
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
            {/* Filter and sort */}
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

            {/* Task list */}
            <div className='flex h-2/3 w-full items-start justify-center gap-6'>
                <TaskList 
                    mindsetFilter={mindsetFilter}
                    typeFilter={taskTypeFilter}
                    tableView={tableView}
                    sort={sort}
                    logbookFilter={logbookView}
                    tasksCache={tasksCache}
                    mindsets={mindsets}
                    onTaskDeleted={handleTaskDelete}
                    onTaskStatusUpdated={handleTaskStatusUpdated}
                />
            </div>
        </div>
    );
}

export default TaskBrowser;

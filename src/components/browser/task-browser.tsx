'use client';

import { TaskType } from '@prisma/client';
import { FC, useEffect, useState } from 'react';
import { Dropdown } from '@/components/form-fields';
import { DEFAULT_MINDSET_LIST, Filters, SortItem } from '@/lib/definitions';
import '@/app/globals.css';
import { adjustLightness } from '@/utils/colour-utils';
import { History } from 'lucide-react';
import Link from 'next/link';
import TodoList from '@/components/browser/todo-list';
import { useSearchParams } from 'next/navigation';
import { useMindsetColour, useMindsets } from '@/store/store';

const TaskBrowser: FC<{
    parentName?: string,
}> = ({parentName}) => {

    const searchParams = useSearchParams();
    const mindsets = useMindsets();
    const mindsetColour = useMindsetColour();

    const [ filters, setFilters ] = useState<Filters>({
        type: 'task', mindset: 'All', tableView: false, 
        logbookView: !!searchParams.get('logbook'), 
        sort: searchParams.get('logbook') ? ['Date', 'Descending'] : ['Priority', 'Ascending'],
    });


    // HANDLERS

    const handleTaskTypeFilter = (type: TaskType) => {
        setFilters(prevFilters => ({ ...prevFilters, 
            type: type, 
            mindset: 'All', // reset mindset filter when changing tab
            tableView: type === 'goal' ? false : filters.tableView,
        }));
    }
    const handleMindsetFilter = (event : React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prevFilters => ({ ...prevFilters, 
            mindset: event.target.value ? event.target.value : 'All' }));
    }
    const handleTableToggle = () => {
        setFilters(prevFilters => ({ ...prevFilters, tableView: !prevFilters.tableView }));
    }
    const handleSort = (event : React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prevFilters => ({ ...prevFilters, sort: [event.target.value, filters.sort[1]] as SortItem }));
    }
    const handleSortDirection = () => {
        setFilters(prevFilters => ({ ...prevFilters, 
            sort: [filters.sort[0], filters.sort[1] === 'Ascending' ? 'Descending' : 'Ascending'] as SortItem }));
    }
    const handleLogbookToggle = () => {
        const newLogbookView = !filters.logbookView;
        setFilters(prevFilters => ({ ...prevFilters, 
            logbookView: newLogbookView,
            sort: newLogbookView ? ['Date', 'Descending'] : ['Priority', 'Descending'],
        }));
    }


    // HOOKS
    // Update states for logbook
    useEffect(() => {
        if (filters.logbookView) setFilters(prevFilters => ({ ...prevFilters, sort: ['Date', 'Descending']}));
    }, [filters.logbookView]);
    // Update logbookView based on searchaparams
    useEffect(() => {
        const newLogbookView = !!searchParams.get('logbook');
        setFilters(prevFilters => ({ ...prevFilters, 
            sort: newLogbookView ? ['Date', 'Descending'] : ['Priority', 'Descending'],
            logbookView: newLogbookView,
        }))
    }, [searchParams]);

    return(
        <div className='flex flex-col items-center gap-4'>
            {/* Tab bar */}
            <div className='flex gap-4 items-center justify-center'>
                <button 
                    className='p-2 focus:text-white uppercase text-bold text-sm font-medium'
                    style={{
                        color: filters.type === 'task' ? mindsetColour : adjustLightness(mindsetColour, 0.5) ,
                        borderColor: mindsetColour,
                    }}
                    onClick={() => handleTaskTypeFilter('task')}
                >Tasks</button>
                <button 
                    className='p-2 focus:text-white uppercase text-bold text-sm font-medium'
                    style={{
                        color: filters.type === 'project' ? mindsetColour : adjustLightness(mindsetColour, 0.5) ,
                        borderColor: mindsetColour,
                    }}
                    onClick={() => handleTaskTypeFilter('project')}
                >Projects</button>
                <button 
                    className='p-2 focus:text-white uppercase text-sm font-medium'
                    style={{
                        color: filters.type === 'goal' ? mindsetColour : adjustLightness(mindsetColour, 0.5),
                        borderColor: mindsetColour,
                    }}
                    onClick={() => handleTaskTypeFilter('goal')}
                >Goals</button>
            </div>

            {/* Filter and sort */}
            <div className='flex gap-4 items-center'>
                { filters.type !== 'goal' &&
                    <Dropdown 
                        fieldName='chooseMindset'
                        list={DEFAULT_MINDSET_LIST.concat('All')}
                        defaultValue='All'
                        onChange={handleMindsetFilter}
                        prompt=''
                        colour={mindsetColour}
                    />
                }
                <div className='rounded-md flex items-center' style={{ backgroundColor: adjustLightness(mindsetColour, 0.95) }}>
                    <Dropdown 
                        fieldName='chooseMindset'
                        list={['Priority', 'Date', 'Duration']}
                        defaultValue={filters.sort[0]}
                        onChange={handleSort}
                        prompt=''
                        colour={mindsetColour}
                        className='!outline-0 border-0'
                    />
                    <div className='h-8 w-8 flex items-center cursor-pointer border-gray-200 rounded-md' onClick={() => handleSortDirection()}>
                        <img src={filters.sort[1] === 'Ascending' ? './icons/sort-desc.svg' : './icons/sort-asc.svg'} alt='icon-sort' />
                    </div>
                </div>
                {/* Table view toggle */}
                { filters.type !== 'goal' &&
                    <div className='h-8 w-8 flex items-center cursor-pointer border-gray-200 rounded-md' onClick={() => handleTableToggle()}>
                        <img src={ filters.tableView === false ? './icons/table-rows.svg' : './icons/list-bulleted.svg'} alt='icon-list' />
                    </div>
                }
                <Link 
                    href={filters.logbookView ? '/browser' : '/browser?logbook=true'} 
                    className='h-8 w-8 flex items-center cursor-pointer border-gray-200 rounded-md' 
                    onClick={() => handleLogbookToggle()}
                >
                    <History color={filters.logbookView ? 'black' : 'lightgrey'}/>
                </Link>
            </div>

            {/* Task list */}
            <div className='flex h-2/3 w-full items-start justify-center gap-6'>
                <TodoList
                    mindsets={mindsets}
                    filters={filters}
                />
            </div>
        </div>
    );
}

export default TaskBrowser;

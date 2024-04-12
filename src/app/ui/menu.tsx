import React from 'react';
import MenuCard from './cards/menu-card';
import Search from './search';

export default function Menu() {
    return (<>
        <div className='w-full flex items-center justify-center'>
            <Search placeholder="Search tasks, projects, dates..." />
        </div>
        <div className='w-full max-w-[1200px] h-1/2 flex p-8 gap-4'>
            <MenuCard title='Calendar' icon='../icons/calendar-month.svg'/>
            <MenuCard title='Tasks & Projects' icon='../icons/list-bulleted.svg'/>
            <MenuCard title='Stats' subtitle='Coming soon!' icon='../icons/stats.svg' className='text-gray-400'/>
            <div className='flex flex-col h-full w-full gap-4'>
                <MenuCard title='Logbook' icon='../icons/history.svg'/>
                <MenuCard title='Settings' icon='../icons/settings.svg'/>
            </div>
        </div>
    </>);
}
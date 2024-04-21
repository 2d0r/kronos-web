'use client';

import React from 'react';
import MenuCard from './cards/menu-card';
import SearchBar from './search';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Menu() {
    const pathname = usePathname();

    if (pathname.endsWith('/timeline')) {
        return (<>
            <div className='w-full flex items-center justify-center'>
                <SearchBar placeholder="Search tasks, projects, dates..." />
            </div>
            <div className='w-full max-w-[1200px] h-1/2 flex p-8 gap-4'>
                <MenuCard title='Calendar' icon='../icons/calendar-month.svg' href='/calendar'/>
                <MenuCard title='Tasks & Projects' icon='../icons/list-bulleted-violet.svg' href='/browse'/>
                <MenuCard title='Stats' subtitle='Coming soon!' icon='../icons/stats.svg' className='text-gray-400'/>
                <div className='flex flex-col h-full w-full gap-4'>
                    <MenuCard title='Logbook' icon='../icons/history.svg'/>
                    <MenuCard title='Settings' icon='../icons/settings.svg'/>
                </div>
            </div>
        </>);
    } else {
        return (<>
            <div className='absolute z-50 right-10 top-10 w-auto h-auto p-4 gap-1 flex flex-col text-black border-[0.5px] border-white rounded-3xl 
                bg-gradient-to-br from-white to-white/50 backdrop-blur-lg shadow-lg'>
                { !pathname.includes('/task') && <Link href={'/timeline'}>Timeline</Link>}
                <Link href={'/calendar'}>Calendar</Link>
                <Link href={'/browse'}>Tasks & Projects</Link>
                <Link href={pathname}>Stats</Link>
                <Link href={pathname}>Logbook</Link>
                <Link href={pathname}>Settings</Link>
            </div>
        </>);
    }
    
}
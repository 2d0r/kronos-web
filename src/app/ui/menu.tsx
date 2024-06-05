'use client';

import React from 'react';
import MenuCard from './cards/menu-card';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import CalendarSVG from './svg/calendar-svg';
import BulletListSVG from './svg/bullet-list-svg';
import StatsSVG from './svg/stats-svg';
import HistorySVG from './svg/history-svg';
import SettingsSVG from './svg/settings-svg';
import '@/app/globals.css';

export default function Menu({mindsetColour = 'black', onBlur}: {mindsetColour?: string, onBlur?: () => void}) {
    const pathname = usePathname();

    if (pathname.endsWith('/')) {

        return (<>
            <div className='w-full flex items-center justify-center'></div>
            <div className='w-full max-w-[1200px] h-1/2 flex p-8 gap-4'>
                <MenuCard title='Calendar' href='/calendar'>
                    <CalendarSVG fill={mindsetColour} height='24' width='24' />
                </MenuCard>
                <MenuCard title='Tasks & Projects' href='/browser'>
                    <BulletListSVG fill={mindsetColour} height='24' width='24' />
                </MenuCard>
                <MenuCard title='Stats' subtitle='Coming soon!' className='text-gray-400'>
                    <StatsSVG fill={mindsetColour} height='24' width='24' />
                </MenuCard>
                <div className='flex flex-col h-full w-full gap-4'>
                    <MenuCard title='Logbook' iconURL='../icons/history.svg' href='/browser?logbook=true'>
                        <HistorySVG fill={mindsetColour} height='24' width='24' />
                    </MenuCard>
                    <MenuCard title='Settings' iconURL='../icons/settings.svg' subtitle='Coming soon!' className='text-gray-400'>
                        <SettingsSVG fill={mindsetColour} height='24' width='24' />
                    </MenuCard>
                </div>
            </div>
        </>);
    } else {
        return (<div className='absolute w-screen h-screen top-0 left-0'>
            <div className='absolute z-50 right-10 top-10 w-auto h-auto p-3 gap-1 flex flex-col text-black border-[0.5px] border-white rounded-3xl 
                bg-gradient-to-br from-white to-white/50 backdrop-blur-lg shadow-lg' onBlur={onBlur} tabIndex={0}>
                { !pathname.includes('/task') && <Link href={'/'} className='menu-link'>Timeline</Link>}
                <Link href={'/calendar'} className='menu-link'>Calendar</Link>
                <Link href={'/browser'} className='menu-link'>Tasks & Projects</Link>
                <Link href={'/tests'} className='menu-link'>Tests</Link>
                <Link href={pathname} className='menu-link'>Stats</Link>
                <Link href={'/browser?logbook=true'} className='menu-link'>Logbook</Link>
                <Link href={pathname} className='menu-link'>Settings</Link>
            </div>
        </div>);
    }
    
}
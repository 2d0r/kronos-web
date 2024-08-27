'use client';

import React from 'react';
import MenuCard from '@/components/ui/menu-card';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import '@/app/globals.css';
import { useMindsetColour } from '@/store/store';
import { motion } from 'framer-motion';
import { CalendarIcon, ChartBarIcon, Cog6ToothIcon, DocumentCheckIcon, ListBulletIcon } from '@heroicons/react/24/outline';

export default function Menu({onBlur}: {onBlur?: () => void}) {
    const pathname = usePathname();
    const mindsetColour = useMindsetColour();

    if (pathname.endsWith('/')) {

        return (
            <div className='w-[90vw] md:max-w-[1200px] md:h-1/2 flex flex-col md:flex-row md:p-8 pt-8 gap-2 md:gap-4'>
                <MenuCard title='Calendar' href='/calendar'>
                    <CalendarIcon color={mindsetColour} height={24} />
                </MenuCard>
                <MenuCard title='Tasks & Projects' href='/browser'>
                    <ListBulletIcon color={mindsetColour} height={24} />
                </MenuCard>
                <MenuCard title='Stats' subtitle='Coming soon!' className='opacity-60 cursor-default'>
                    <ChartBarIcon color={mindsetColour} height={24} />
                </MenuCard>
                <div className='flex md:flex-col h-full w-full gap-2 md:gap-4'>
                    <MenuCard title='Logbook' href='/browser?logbook=true'>
                        <DocumentCheckIcon color={mindsetColour} height={24} />
                    </MenuCard>
                    <MenuCard title='Settings' subtitle='Coming soon!' className='opacity-60 cursor-default'>
                        <Cog6ToothIcon color={mindsetColour} height={24} />
                    </MenuCard>
                </div>
            </div>
        );
    } else {
        return (<motion.div className='absolute z-50 w-screen h-screen top-0 left-0'
        initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.1 }}>
            <div className='absolute z-50 right-10 top-14 w-auto h-auto p-3 gap-1 flex flex-col text-black border-[0.5px] border-white rounded-3xl 
                bg-gradient-to-br from-white to-white/50 backdrop-blur-lg shadow-lg' onBlur={onBlur} tabIndex={0}
                style={{ color: mindsetColour }}>
                { !pathname.includes('/task') && <Link href={'/'} className='menu-link'>Timeline</Link>}
                <Link href={'/calendar'} className='menu-link'>Calendar</Link>
                <Link href={'/browser'} className='menu-link'>Tasks & Projects</Link>
                <Link href={'/tests'} className='menu-link'>Tests</Link>
                {/* <Link href={pathname} className='menu-link'>Stats</Link> */}
                <Link href={'/browser?logbook=true'} className='menu-link'>Logbook</Link>
                {/* <Link href={pathname} className='menu-link'>Settings</Link> */}
            </div>
        </motion.div>);
    }
    
}
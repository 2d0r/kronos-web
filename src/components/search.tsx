'use client';

import useWindowSize from '@/lib/useWindowSize';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChangeEvent, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { setSearchQuery, useMindsetColour } from '@/store/store';
import { useDispatch } from 'react-redux';

export default function SearchBar() {

    // Navigation
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const showMenu = searchParams.get('menu');
    const hidden = !showMenu && pathname.endsWith('/');

    const mindsetColour = useMindsetColour();
    const dispatch = useDispatch();
    
    const { windowWidth } = useWindowSize();

    const [ isFocused, setIsFocused ] = useState<boolean>(false);

    const placeholder = windowWidth && windowWidth < 500 ? 'Search' 
        : pathname === '/' ? 'Search tasks' 
        : pathname.endsWith('/browser') ? 'Search tasks, projects' 
        : pathname.endsWith('/calendar') ? 'Search events'
        : pathname.endsWith('/organiser') ? 'Search tasks, events'
    : '';


    // HANDLERS

    const handleSearchQuery = (event: ChangeEvent<HTMLInputElement>) => {
        const text = event.target.value;
        dispatch(setSearchQuery(text));
    }

    useEffect(() => {

    }, []);

    return (!hidden &&
        <motion.div className={clsx('relative flex rounded-3xl cursor-pointer', isFocused && 'bg-white/10 ')} 
        onClick={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}>
            <label htmlFor='search' className='cursor-pointer peer-focus:outline-none' >
                <MagnifyingGlassIcon color={mindsetColour || 'white'} width={24} className='absolute left-3 top-1/2 -translate-y-1/2 peer-focus:font-bold' />
            </label>
            <motion.input
                id='search'
                className='peer block bg-transparent border-0 py-[9px] pl-10 
                    text-lg placeholder:text-white placeholder:text-opacity-50
                    focus-peer:border-none focus:!outline-none  focus:!ring-transparent 
                    hover:border-x-0 hover:border-t-0 hover:border-b-white
                    active:!ring-transparent active:!outline-none'
                style={{ width: isFocused ? '100%' : '0', color: mindsetColour || 'white' }}
                placeholder={placeholder}
                defaultValue={searchParams.get('query')?.toString()}
                onChange={(event) => handleSearchQuery(event)}
                autoFocus={isFocused}
                autoComplete='false'
                // initial={{ width: 0 }} whileTap={{ width: '100%' }}
            />
        </motion.div>
    );
}
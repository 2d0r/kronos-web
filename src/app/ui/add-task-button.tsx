'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { SearchParamProps } from '../lib/definitions';

export default function AddTaskButton({ searchParams }: SearchParamProps) {
    const pathname = usePathname();
    const [showAddTask, setShowAddTask] = useState(false);
    const handleClick = () => {
        setShowAddTask(!showAddTask);
    }

    useEffect(() => {
        setShowAddTask(searchParams?.showAddTask ? true : false);
    }, [searchParams?.showAddTask]);

    return (<div className='w-8 h-8 text-white bg-violet-400 rounded-full text-2xl text-center align-middle'>
        <Link
            href={showAddTask ? pathname.slice(-1 * '?showAddTask=true'.length) : `${pathname}?showAddTask=true`}
            onClick={handleClick}
        >
            {showAddTask ? 'x' : '+'}
        </Link>
    </div>)
}
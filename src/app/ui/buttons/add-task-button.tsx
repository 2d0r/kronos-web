'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { SearchParamProps, URLSearchParamsKronos } from '../../lib/definitions';

export default function AddTaskButton({searchParams}: {searchParams: URLSearchParamsKronos}) {
    const pathname = usePathname();
    const [showAddTask, setShowAddTask] = useState(false);

    useEffect(() => {
        setShowAddTask(searchParams?.showAddTask ? true : false);
    }, [searchParams?.showAddTask]);

    return (
        <Link
            href={showAddTask ? pathname.slice(-1 * '?showAddTask=true'.length) : `${pathname}?showAddTask=true`}
            className='w-10 h-10 text-white bg-violet-600 rounded-full flex items-center justify-center'
        >
            <img src={showAddTask ? '../icons/close.svg' : '../icons/add.svg'} 
                className='w-8 h-8'/>
        </Link>
    )
}
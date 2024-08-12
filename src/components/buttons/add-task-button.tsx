'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { URLSearchParamsKronos } from '@/lib/definitions';

export default function AddTaskButton({searchParams, mindsetColour}: {searchParams: URLSearchParamsKronos, mindsetColour?: string}) {
    const pathname = usePathname();
    const [showTaskCard, setShowAddTask] = useState(false);

    useEffect(() => {
        setShowAddTask(searchParams?.task ? true : false);
    }, [searchParams?.task]);

    return (
        <Link
            href={showTaskCard ? pathname : `${pathname}?task=new`}
            className='bottom-[2vh] right-[2vw] w-10 h-10 text-white rounded-full flex items-center justify-center'
            style={{ background: mindsetColour }}
        >
            <img src={showTaskCard ? '../icons/close.svg' : '../icons/add.svg'} 
                className='w-8 h-8'/>
        </Link>
    )
}
'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function AddTaskButton({mindsetColour}: {mindsetColour?: string}) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [showTaskCard, setShowAddTask] = useState(false);

    useEffect(() => {
        setShowAddTask(searchParams.get('task') ? true : false);
    }, [searchParams]);

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
'use client';

import { useMindsetColour } from '@/store/store';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function AddTaskButton() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [showTaskCard, setShowAddTask] = useState(false);
    const mindsetColour = useMindsetColour();

    useEffect(() => {
        setShowAddTask(searchParams.get('task') ? true : false);
    }, [searchParams]);

    return (
        <Link href={showTaskCard ? pathname : `${pathname}?task=new`}>
        <motion.div
            className='bottom-[2vh] right-[2vw] w-10 h-10 text-white rounded-full flex items-center justify-center'
            style={{ background: mindsetColour }}
            whileHover={{ scale: 1.1 }}
        >
            <img src={showTaskCard ? '../icons/close.svg' : '../icons/add.svg'} 
            className='w-8 h-8' alt='icon-close'/>
        </motion.div>
        </Link>
    )
}
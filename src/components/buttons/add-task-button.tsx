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

    const buttonBg = pathname.includes('task') ? 'rgba(255,255,255,0.2)' : mindsetColour;

    useEffect(() => {
        setShowAddTask(searchParams.get('task') && searchParams.get('status') === 'edit' ? true : false);
    }, [searchParams]);

    return (
        <Link href={showTaskCard ? pathname : `${pathname}?task=new&status=edit`}>
        <motion.div
            className={'bottom-[2vh] right-[2vw] w-10 h-10 text-white rounded-full flex items-center justify-center shadow-lg shadow-black/20'}
            style={{ background: buttonBg }}
            whileHover={{ scale: 1.1 }}
        >
            <img src={showTaskCard ? '../icons/close.svg' : '../icons/add.svg'} 
            className='w-8 h-8' alt='icon-close'/>
        </motion.div>
        </Link>
    )
}
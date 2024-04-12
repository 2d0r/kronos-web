'use client';

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react';
import { SearchParamProps } from '../lib/definitions';
import { useRouter } from 'next/navigation';

export function TopBar({ searchParams } : SearchParamProps) {
    const pathname = usePathname();
    const [showMenu, setShowMenu] = useState(false);
    const router = useRouter();

    const handleMenuClick = () => {
        setShowMenu(!showMenu);
    }

    useEffect(() => {
        setShowMenu(searchParams?.showMenu && !searchParams?.showAddTask ? true : false);
    }, [searchParams?.showMenu, searchParams?.showAddTask]);


    return (<div className='fixed z-50 w-full flex justify-between p-4'>
        <button onClick={() => router.back()}>
            {/* <div className='w-8 h-8 bg-white rounded-full'></div> */}

            <img src='../icons/back.svg' className='w-8 h-8'/>
        </button>
        <Link href={showMenu ? pathname.slice(-1 * '?showMenu=true'.length) : `${pathname}?showMenu=true`} onClick={handleMenuClick}>
            {/* <div className='w-8 h-8 bg-white rounded-full'></div> */}

            <img src={showMenu ? '../icons/close.svg' : '../icons/menu.svg'} className='w-8 h-8'/>
        </Link>
        
    </div>)
}
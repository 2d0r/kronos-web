'use client';

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react';
import { SearchParamProps } from '../lib/definitions';
import { useRouter } from 'next/navigation';

export default function TopBar({ searchParams, back = false } : {
    searchParams: Record<string, string> | null | undefined, back?: boolean
}) {
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
        {back === true ?
        <button onClick={() => router.back()}>
            <img src='../icons/back.svg' className='w-8 h-8'/>
        </button> : <div></div>}
        <Link href={showMenu ? pathname.slice(-1 * '?showMenu=true'.length) : `${pathname}?showMenu=true`} onClick={handleMenuClick}>
            {/* <div className='w-8 h-8 bg-white rounded-full'></div> */}

            <img src={showMenu ? '../icons/close.svg' : '../icons/menu.svg'} className='w-8 h-8'/>
        </Link>
        
    </div>)
}
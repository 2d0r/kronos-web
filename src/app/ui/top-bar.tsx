'use client';

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FC, useEffect, useState } from 'react';
import { SearchParamProps, ContainerProps, URLSearchParamsKronos } from '../lib/definitions';
import { useRouter } from 'next/navigation';
import { URLSearchParams } from 'url';

interface TopBarProps {
    children?: JSX.Element; // Or a more specialized type
    searchParams: URLSearchParamsKronos; // Adjust the type if needed
    back?: boolean;
}

const TopBar: FC<TopBarProps> = ({children, searchParams, back}) => {
    const pathname = usePathname();
    const [showMenu, setShowMenu] = useState(false);
    const router = useRouter();

    const handleMenuClick = () => {
        setShowMenu(!showMenu);
    }

    useEffect(() => {
        setShowMenu(searchParams?.showMenu && !searchParams?.showAddTask ? true : false);
    }, [searchParams?.showMenu, searchParams?.showAddTask]);


    return (<div className='top-0 fixed z-40 w-full flex justify-between items-center px-4 py-2'>
        {back === true ?
        <button onClick={() => router.back()}>
            <img src='../icons/back.svg' className='w-8 h-8'/>
        </button> : <div></div>}
        {children}
        <Link className='top-[2vh] right-[2vw]' href={showMenu ? pathname.slice(-1 * '?showMenu=true'.length) : `${pathname}?showMenu=true`} onClick={handleMenuClick}>
            {/* <div className='w-8 h-8 bg-white rounded-full'></div> */}

            <img src={showMenu ? '../icons/close.svg' : '../icons/menu.svg'} className='w-8 h-8'/>
        </Link>
    </div>);
}

export default TopBar;
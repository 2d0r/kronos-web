'use client';

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { FC, useEffect, useState } from 'react';
import { SearchParamProps, ContainerProps, URLSearchParamsKronos } from '@/lib/definitions';
import { useRouter } from 'next/navigation';
import { URLSearchParams } from 'url';
import Menu from '@/components/menu';

interface TopBarProps {
    children?: JSX.Element; // Or a more specialized type
    back?: boolean;
}

const TopBar: FC<TopBarProps> = ({children, back}) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [showMenu, setShowMenu] = useState(false);
    const router = useRouter();

    const handleMenuClick = () => {
        setShowMenu(!showMenu);
    }

    useEffect(() => {
        setShowMenu(searchParams.get('menu') && !searchParams.get('task') ? true : false);
    }, [searchParams]);


    return (<div className='top-0 fixed z-40 w-full flex justify-between items-center px-4 py-2'>
        {back === true ?
        <button onClick={() => router.back()}>
            <img src='../icons/back.svg' className='w-8 h-8' alt='icon-back'/>
        </button> : <div className='w-8 h-8'></div>}
        {children}
        {pathname.endsWith('/') ? 
        <Link className='top-[2vh] right-[2vw]' href={showMenu ? pathname : `${pathname}?menu=true`} onClick={handleMenuClick}>
            <img src={showMenu ? '../icons/close.svg' : '../icons/menu.svg'} className='w-8 h-8'/>
        </Link> :
        <div onClick={handleMenuClick} className='cursor-default' >
            <img src={showMenu ? '../icons/close.svg' : '../icons/menu.svg'} className='w-8 h-8'/>
            {showMenu && <Menu onBlur={handleMenuClick} />}
        </div>}
        
    </div>);
}

export default TopBar;
'use client';

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react';

export function TopBar() {
    const pathname = usePathname();
    const [showingMenu, setShowingMenu] = useState(false);

    const handleMenuClick = () => {
        setShowingMenu(!showingMenu);
    }

    return (<div className='absolute w-full flex justify-between p-4'>
        <div></div>
        <Link href={showingMenu ? pathname.slice(-1 * '?showMenu=true'.length) : `${pathname}?showMenu=true`} onClick={handleMenuClick}>
            <div className='w-8 h-8 bg-white rounded-full'></div>
        </Link>
        
    </div>)
}
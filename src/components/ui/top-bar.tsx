'use client';

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Menu from '@/components/menu';
import { ArrowLeftIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useMindsetColour } from '@/store/store';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';

interface TopBarProps {
    children?: JSX.Element; // Or a more specialized type
    back?: boolean;
}

const TopBar: FC<TopBarProps> = ({children, back}) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [showMenu, setShowMenu] = useState(false);
    const router = useRouter();
    const mindsetColour = useMindsetColour();

    const handleMenuClick = () => {
        setShowMenu(!showMenu);
    }

    useEffect(() => {
        setShowMenu(searchParams.get('menu') && !searchParams.get('task') ? true : false);
    }, [searchParams]);


    return (<div className='top-0 fixed z-40 w-full flex justify-between items-center px-4 py-2'>
        {back === true ?
        <button onClick={() => router.back()}>
            <ArrowLeftIcon color={mindsetColour || 'white'} width={36}/>
        </button> : <div className='w-8 h-8'></div>}
        {children}
        {pathname.endsWith('/') ? 
            <Link className='top-[2vh] right-[2vw]' href={showMenu ? pathname : `${pathname}?menu=true`} onClick={handleMenuClick}>
                {/* <img src={showMenu ? '../icons/close.svg' : '../icons/menu.svg'} className='w-8 h-8'/> */}
                { showMenu ? <XMarkIcon color={mindsetColour || 'white'} width={36} /> : <Bars3Icon color={mindsetColour || 'white'} width={36}/>}
            </Link> :
            <div onClick={handleMenuClick} className='cursor-default' >
                { showMenu ? <XMarkIcon color={mindsetColour || 'white'} width={36} /> : <Bars3Icon color={mindsetColour || 'white'} width={36}/>}
                <AnimatePresence>
                    {showMenu && <motion.div className='w-full h-full flex items-center justify-center'>
                        <Menu onBlur={handleMenuClick} />
                    </motion.div>}
                </AnimatePresence>
            </div>
        }
        
    </div>);
}

export default TopBar;
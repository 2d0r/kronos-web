'use client';

import { useMindsetColour } from '@/store/store';
import clsx from 'clsx';
import { Url } from 'next/dist/shared/lib/router/router';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface MenuCardProps {
    className?: string,
    title: string,
    subtitle?: string,
    href?: Url,
    children?: ReactNode
}

export default function MenuCard({className, title, subtitle, href, children} : MenuCardProps) {
    const pathname = usePathname();
    const mindsetColour = useMindsetColour();

    return(<>
        <Link href={href || pathname} className={clsx(
            'rounded-2xl bg-white md:h-full h-[120px] w-full flex flex-col gap-3 items-center justify-center p-4',
            className
        )}>
            { children }
            <div className='flex flex-col md:gap-1 items-center' style={{ color: mindsetColour }}>
                <div className='text-lg'>{title}</div>
                <div className='md:text-sm text-xs'>{subtitle}</div>
            </div>
        </Link>
    </>);
}
'use client';

import { Url } from 'next/dist/shared/lib/router/router';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { FC, ReactNode } from 'react';

interface MenuCardProps {
    className?: string,
    title: string,
    subtitle?: string,
    iconURL?: string,
    iconSVG?: FC,
    href?: Url,
    children?: ReactNode
}

export default function MenuCard({className, title, subtitle, iconURL, href, children} : MenuCardProps) {
    const pathname = usePathname();

    return(<>
        <Link href={href || pathname} className={
                `rounded-2xl bg-white h-full w-full flex flex-col gap-3 items-center justify-center
                ${className}`
            }>
            {/* <img src={iconURL} className='h-6 w-6' hidden={!iconURL}/> */}
            { children }
            <div className='h-6 w-6 flex flex-col gap-1 items-center'>
                <div className='text-lg'>{title}</div>
                <div className='text-sm'>{subtitle}</div>
            </div>
        </Link>
    </>);
}
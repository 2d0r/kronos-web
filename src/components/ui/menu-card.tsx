'use client';

import { useMindsetColour } from '@/store/store';
import { Url } from 'next/dist/shared/lib/router/router';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { FC, ReactNode } from 'react';

interface MenuCardProps {
    className?: string,
    title: string,
    subtitle?: string,
    iconSVG?: FC,
    href?: Url,
    children?: ReactNode
}

export default function MenuCard({className, title, subtitle, href, children} : MenuCardProps) {
    const pathname = usePathname();
    const mindsetColour = useMindsetColour();

    return(<>
        <Link href={href || pathname} className={
                `rounded-2xl bg-white h-full w-full flex flex-col gap-3 items-center justify-center
                ${className}`
            }>
            { children }
            <div className='flex flex-col gap-1 items-center' style={{ color: mindsetColour }}>
                <div className='text-lg'>{title}</div>
                <div className='text-sm'>{subtitle}</div>
            </div>
        </Link>
    </>);
}
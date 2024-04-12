import { CardProps } from '@/app/lib/definitions';
import React from 'react';

export default function MenuCard({className, title, subtitle, icon} : CardProps) {
    return(<div className={
        `rounded-2xl bg-white h-full w-full flex flex-col gap-3 items-center justify-center
        ${className}`
    }>
        <img src={icon} className={icon !== '' ? 'h-6 w-6' : 'hidden'}/>
        <div className='flex flex-col gap-1 items-center'>
            <div className='text-lg'>{title}</div>
            <div className='text-sm'>{subtitle}</div>
        </div>
        
    </div>)
}
'use client';

import React from 'react';
import { organiseIdealFirst } from '@/app/lib/organiser-idealFirst';
import { addDaysToDate } from '@/app/utils/dateUtils';
import Button from './button';

export default function OrganiseButton({ daysAhead, name } : {
    daysAhead: number, name: string
}) {

    const handleOrganise = (daysAhead: number = 30) => {
        const currentTime = new Date();
        const xDaysFromNow = addDaysToDate(currentTime, daysAhead);
        organiseIdealFirst([currentTime, xDaysFromNow]);
    }

    return (
        <Button 
            className='rounded-md bg-gray-400 from-neutral-950 p-6 w-1/4' 
            onClick={() => handleOrganise(daysAhead)}
            >{name}
        </Button>)
}
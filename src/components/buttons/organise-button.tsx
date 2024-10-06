'use client';

import React, { ChangeEvent, useState } from 'react';
import Button from './button';
import { Dropdown } from '../form-fields';
import { ORGANISER_TIMESPANS } from '@/lib/definitions';
import { adjustLightness } from '@/utils/colour-utils';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function OrganiseButton({colour, onOrganise} : {
    colour: string, onOrganise: (daysAhead: number) => void
}) {

    const [ numDays, setNumDays ] = useState<number>(7);

    type TimespansType = keyof typeof ORGANISER_TIMESPANS;
    const handleDropdown = (event: ChangeEvent<HTMLInputElement>) => {
        const timespan = event.target.value as TimespansType;
        setNumDays(ORGANISER_TIMESPANS[timespan]);
    }

    return (
        <div className='flex items-center'>
            <Button className='!rounded-l-full md:!rounded-l-xl rounded-r-none from-neutral-950 flex items-center justify-center md:p-6 h-10 md:h-16 md:w-full w-[40vw]' 
            style={{ background: colour }}
            onClick={() => onOrganise(numDays)}>
                {/* <ArrowLeftIcon fill='white' width='16' className='md:visible hidden' /> */}
                Organise
            </Button>
            <Dropdown 
                fieldName='timespan' 
                list={Object.keys(ORGANISER_TIMESPANS)} 
                defaultValue='One Week' 
                prompt='Choose timespan'
                onChange={handleDropdown} 
                bgColour={adjustLightness(colour, 0.1)} colour={colour}
                className='rounded-l-none !rounded-r-full md:!rounded-r-xl h-10 md:h-16 text-center text-lg md:w-full md:min-w-[8rem] w-[40vw]'
            />
        </div>
    )
}

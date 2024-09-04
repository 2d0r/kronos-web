'use client';

import React, { ChangeEvent, useState } from 'react';
import Button from './button';
import { Dropdown } from '../form-fields';
import { ORGANISER_TIMESPANS } from '@/lib/definitions';
import { adjustLightness } from '@/utils/colour-utils';

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
        <div className='flex items-center md:py-0 py-4'>
            <Button className='rounded-l-lg rounded-r-none from-neutral-950 flex items-center justify-center p-6 h-[4rem] md:w-[10rem] w-[40vw]' 
            style={{ background: colour }}
            onClick={() => onOrganise(numDays)}>
                Organise
            </Button>
            <Dropdown 
                fieldName='timespan' 
                list={Object.keys(ORGANISER_TIMESPANS)} 
                defaultValue='One Week' 
                prompt='Choose timespan'
                onChange={handleDropdown} 
                bgColour={adjustLightness(colour, 0.1)} colour={colour}
                className='rounded-l-none h-[4rem] text-center text-lg md:w-[10rem] w-[40vw]'
            />
        </div>
    )
}

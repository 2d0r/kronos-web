'use client';

import { useMindsetColour } from '@/store/store';
import { adjustLightness } from '@/utils/colour-utils';
import { useEffect, useState } from 'react';

export default function Background() {

    const mindsetColour = useMindsetColour();
    const [ colour, setColour ] = useState<string>(mindsetColour);

    setInterval(() => {

    }, 5000);

    useEffect(() => {
        setColour(mindsetColour);
    }, [ mindsetColour ]);

    return (
        <div className='absolute top-0 left-0 w-screen h-screen -z-50' style={{
            backgroundImage: `linear-gradient(to bottom right, ${adjustLightness(colour, 0.5)}, ${adjustLightness(colour, 0.7)})`
            }}>
        </div>
    );
}

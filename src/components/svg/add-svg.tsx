import React, { FC } from 'react';

const AddSVG: FC<{
    fill?: string, width?: string, height?: string
}> = ({fill = 'white', width, height}) => {
    return (<svg width="36" height="37" viewBox="0 0 36 37" fill="none" xmlns="http://www.w3.org/2000/svg">
        <mask id="mask0_152_1316" style={{maskType:'alpha'}} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="37">
        <rect y="0.5" width="36" height="36" fill={fill}/>
        </mask>
        <g mask="url(#mask0_152_1316)">
        <path d="M16.2857 20.2143H6V16.7857H16.2857V6.5H19.7143V16.7857H30V20.2143H19.7143V30.5H16.2857V20.2143Z" fill={fill}/>
        </g>
    </svg>);
}

export default AddSVG;
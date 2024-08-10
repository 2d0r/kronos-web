import React, { FC } from 'react';

const ShuffleSVG: FC<{
    fill?: string, width?: string, height?: string
}> = ({fill = 'white', width, height}) => {
    return (<svg width="36" height="37" viewBox="0 0 36 37" fill="none" xmlns="http://www.w3.org/2000/svg">
        <mask id="mask0_89_290" style={{maskType:'alpha'}} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="37">
        <rect y="0.5" width="36" height="36" fill={fill}/>
        </mask>
        <g mask="url(#mask0_89_290)">
        <path d="M21 30.5V27.5H24.9L20.1375 22.7375L22.275 20.6L27 25.325V21.5H30V30.5H21ZM8.1 30.5L6 28.4L24.9 9.5H21V6.5H30V15.5H27V11.6L8.1 30.5ZM13.7625 16.3625L6 8.6L8.1 6.5L15.8625 14.2625L13.7625 16.3625Z" fill={fill}/>
        </g>
    </svg>);
}

export default ShuffleSVG;
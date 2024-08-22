export default function CloseIconSVG ({fill = 'white', width, height} : {
    fill?: string, width?: string, height?: string
}) {
    return (<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <mask id="mask0_155_2857" style={{maskType:'alpha'}} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
        <rect width="36" height="36" fill={fill}/>
        </mask>
        <g mask="url(#mask0_155_2857)">
        <path d="M9.6 28.5L7.5 26.4L15.9 18L7.5 9.6L9.6 7.5L18 15.9L26.4 7.5L28.5 9.6L20.1 18L28.5 26.4L26.4 28.5L18 20.1L9.6 28.5Z" fill={fill}/>
        </g>
    </svg>);
}
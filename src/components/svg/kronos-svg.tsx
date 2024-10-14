export default function KronosSVG ({fill = 'white', width = '48', height = '49'} : {
    fill?: string, width?: string, height?: string
}) {
    return (
        <svg width={width} height={height} viewBox='0 0 134 134' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <g clipPath='url(#clip0_481_2053)'>
                <path d='M38.422 36.6514C39.6826 39.5928 42.5749 41.5 45.7752 41.5H88.2248C91.4251 41.5 94.3174 39.5928 95.578 36.6514L100.721 24.6514C102.983 19.3724 99.111 13.5 93.3677 13.5H40.6323C34.889 13.5 31.0167 19.3724 33.2792 24.6514L38.422 36.6514Z' fill={fill}/>
                <rect width='49' height='29' rx='8' transform='matrix(1 0 0 -1 42.5 81.5)' fill={fill} />
                <path d='M38.422 97.3486C39.6826 94.4072 42.5749 92.5 45.7752 92.5H88.2248C91.4251 92.5 94.3174 94.4072 95.578 97.3486L100.721 109.349C102.983 114.628 99.111 120.5 93.3677 120.5H40.6323C34.889 120.5 31.0167 114.628 33.2792 109.349L38.422 97.3486Z' fill={fill}/>
            </g>
            <defs>
                <clipPath id='clip0_481_2053'>
                    <rect width='134' height='134' fill={fill}/>
                </clipPath>
            </defs>
        </svg>
    );
};
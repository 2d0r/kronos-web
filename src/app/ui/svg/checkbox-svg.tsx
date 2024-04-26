import { CheckboxStatus } from '@/app/lib/definitions';
import { Status, TaskType } from '@prisma/client';
import { FC } from 'react';

const CheckboxSVG: FC<{fill?: string, width?: string, height?: string, statusDisplay: CheckboxStatus, type: TaskType}> = ({
    fill = 'black', width = '36', height = '36', statusDisplay, type
}) => {

    if (type === 'task') {
        if ( statusDisplay === 'checked' ) {
            return (<svg width={width} height={height} viewBox="0 0 36 36" fill={fill} xmlns="http://www.w3.org/2000/svg">
                <mask id="mask0_362_2540" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width='36' height='36'>
                    <rect width='36' height='36' fill={fill}/>
                </mask>
                <g mask="url(#mask0_362_2540)">
                    <path d="M7.5 31.5C6.675 31.5 5.96875 31.2063 5.38125 30.6188C4.79375 30.0313 4.5 29.325 4.5 28.5V7.5C4.5 6.675 4.79375 5.96875 5.38125 5.38125C5.96875 4.79375 6.675 4.5 7.5 4.5H28.5C29.325 4.5 30.0313 4.79375 30.6188 5.38125C31.2063 5.96875 31.5 6.675 31.5 7.5V28.5C31.5 29.325 31.2063 30.0313 30.6188 30.6188C30.0313 31.2063 29.325 31.5 28.5 31.5H7.5ZM7.5 28.5H28.5V7.5H7.5V28.5Z" fill={fill}/>
                    <path d="M15.9 24.3L26.475 13.725L24.375 11.625L15.9 20.1L11.625 15.825L9.52502 17.925L15.9 24.3Z" fill={fill}/>
                </g>
            </svg>);
        } else {
            return (<svg width={width} height={height} viewBox='0 0 36 36' fill={fill} xmlns='http://www.w3.org/2000/svg'>
                <mask id='mask0_167_3343' style={{ maskType: 'alpha' }} maskUnits='userSpaceOnUse' x='0' y='0' width='36' height='36'>
                <rect width='36' height='36' fill='#D9D9D9'/>
                </mask>
                <g mask='url(#mask0_167_3343)'>
                <path d='M7.5 31.5C6.675 31.5 5.96875 31.2063 5.38125 30.6188C4.79375 30.0312 4.5 29.325 4.5 28.5V7.5C4.5 6.675 4.79375 5.96875 5.38125 5.38125C5.96875 4.79375 6.675 4.5 7.5 4.5H28.5C29.325 4.5 30.0312 4.79375 30.6188 5.38125C31.2063 5.96875 31.5 6.675 31.5 7.5V28.5C31.5 29.325 31.2063 30.0312 30.6188 30.6188C30.0312 31.2063 29.325 31.5 28.5 31.5H7.5ZM7.5 28.5H28.5V7.5H7.5V28.5Z' fill={fill} />
                </g>
            </svg>);
        }
    } else if (type === 'project') {
        if (statusDisplay === 'checked') {
            return (<svg width={width} height={height} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <mask id="mask0_362_2539" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width='36' height='36'>
                    <rect width='36' height='36' fill={fill}/>
                </mask>
                <g mask="url(#mask0_362_2539)">
                    <path d="M7.5 31.5C6.675 31.5 5.96875 31.2063 5.38125 30.6188C4.79375 30.0313 4.5 29.325 4.5 28.5V7.5C4.5 6.675 4.79375 5.96875 5.38125 5.38125C5.96875 4.79375 6.675 4.5 7.5 4.5H13.7625C14.0375 3.625 14.575 2.90625 15.375 2.34375C16.175 1.78125 17.05 1.5 18 1.5C19 1.5 19.8938 1.78125 20.6813 2.34375C21.4688 2.90625 22 3.625 22.275 4.5H28.5C29.325 4.5 30.0313 4.79375 30.6188 5.38125C31.2063 5.96875 31.5 6.675 31.5 7.5V28.5C31.5 29.325 31.2063 30.0313 30.6188 30.6188C30.0313 31.2063 29.325 31.5 28.5 31.5H7.5ZM7.5 28.5H28.5V7.5H25.5V11H10.5V7.5H7.5V28.5ZM18 7.5C18.425 7.5 18.7813 7.35625 19.0688 7.06875C19.3563 6.78125 19.5 6.425 19.5 6C19.5 5.575 19.3563 5.21875 19.0688 4.93125C18.7813 4.64375 18.425 4.5 18 4.5C17.575 4.5 17.2188 4.64375 16.9313 4.93125C16.6438 5.21875 16.5 5.575 16.5 6C16.5 6.425 16.6438 6.78125 16.9313 7.06875C17.2188 7.35625 17.575 7.5 18 7.5Z" fill={fill}/>
                    <path d="M15.9 24.3L26.475 13.725L24.375 11.625L15.9 20.1L11.625 15.825L9.52502 17.925L15.9 24.3Z" fill={fill}/>
                </g>
            </svg>);
        } else {
            return (<svg width={width} height={height} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <mask id="mask0_167_3299" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width='36' height='36'>
                    <rect width='36' height='36' fill={fill}/>
                </mask>
                <g mask="url(#mask0_167_3299)">
                    <path d="M7.5 31.5C6.675 31.5 5.96875 31.2063 5.38125 30.6188C4.79375 30.0313 4.5 29.325 4.5 28.5V7.5C4.5 6.675 4.79375 5.96875 5.38125 5.38125C5.96875 4.79375 6.675 4.5 7.5 4.5H13.7625C14.0375 3.625 14.575 2.90625 15.375 2.34375C16.175 1.78125 17.05 1.5 18 1.5C19 1.5 19.8938 1.78125 20.6813 2.34375C21.4688 2.90625 22 3.625 22.275 4.5H28.5C29.325 4.5 30.0313 4.79375 30.6188 5.38125C31.2063 5.96875 31.5 6.675 31.5 7.5V28.5C31.5 29.325 31.2063 30.0313 30.6188 30.6188C30.0313 31.2063 29.325 31.5 28.5 31.5H7.5ZM7.5 28.5H28.5V7.5H25.5V11H10.5V7.5H7.5V28.5ZM18 7.5C18.425 7.5 18.7813 7.35625 19.0688 7.06875C19.3563 6.78125 19.5 6.425 19.5 6C19.5 5.575 19.3563 5.21875 19.0688 4.93125C18.7813 4.64375 18.425 4.5 18 4.5C17.575 4.5 17.2188 4.64375 16.9313 4.93125C16.6438 5.21875 16.5 5.575 16.5 6C16.5 6.425 16.6438 6.78125 16.9313 7.06875C17.2188 7.35625 17.575 7.5 18 7.5Z" fill={fill}/>
                </g>
            </svg>);
        }
    } else if (type === 'goal') {
        if (statusDisplay === 'checked') {
            return (<svg width={width} height={height} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <mask id="mask0_363_2580" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width='36' height='36'>
                    <rect width='36' height='36' fill={fill}/>
                </mask>
                <g mask="url(#mask0_363_2580)">
                    <path d="M9.5 31.5V28.5H16.5V26.5C12 25 7.44325 23 6.44328 18.15C4.50007 16 4.50002 15 4.50002 12C4.47718 11.3221 4.50002 10.6501 4.50002 10C4.50001 8 5 7.5 6.5 7.5V4.5H29.5V7.5C31.7763 7.5 31.5 8.17077 31.5 10C31.5 10.9442 31.5 11 31.5 12C31.5 14 31.5 16 29.5 18.15C28 24 23.5 25 19.5 26.5V28.5H26.5V31.5H9.5ZM18 23.65C20.3397 23.65 26.5 21.2575 26.5 18.15V7.5H9.5V18.15C9.5 21.3034 15.2629 23.65 18 23.65Z" fill={fill}/>
                    <path d="M16.2655 20L25 11.6568L23.2655 10L16.2655 16.6864L12.7345 13.3136L11 14.9704L16.2655 20Z" fill={fill}/>
                </g>
            </svg>);
        } else {
            return (<svg width={width} height={height} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <mask id="mask0_363_2581" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width='36' height='36'>
                    <rect width='36' height='36' fill={fill}/>
                </mask>
                <g mask="url(#mask0_363_2581)">
                    <path d="M9.5 31.5V28.5H16.5V26.5C12 25 7.44325 23 6.44328 18.15C4.50007 16 4.50002 15 4.50002 12C4.47718 11.3221 4.50002 10.6501 4.50002 10C4.50001 8 5 7.5 6.5 7.5V4.5H29.5V7.5C31.7763 7.5 31.5 8.17077 31.5 10C31.5 10.9442 31.5 11 31.5 12C31.5 14 31.5 16 29.5 18.15C28 24 23.5 25 19.5 26.5V28.5H26.5V31.5H9.5ZM18 23.65C20.3397 23.65 26.5 21.2575 26.5 18.15V7.5H9.5V18.15C9.5 21.3034 15.2629 23.65 18 23.65Z" fill={fill}/>
                </g>
            </svg>);
        }
    } else {
        return <></>;
    }
    
};

export default CheckboxSVG;
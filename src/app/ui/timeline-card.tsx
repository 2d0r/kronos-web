import { FC } from 'react';
import BottomBar from './bottom-bar';
import TopBar from './top-bar';
import { URLSearchParamsKronos } from '../lib/definitions';
import SearchBar from './search';

interface TimelineCardProps {
    children?: JSX.Element | JSX.Element[];
    searchParams: URLSearchParamsKronos;
    back?: boolean
}

const TimelineCard: FC<TimelineCardProps> = ({children, searchParams, back }) => {

    return (<div className='w-screen h-screen bg-gradient-to-br from-violet-200 to-violet-400 flex flex-col gap-8 items-center justify-center'>
        <TopBar searchParams={searchParams} back={back}><SearchBar placeholder='Search events, dates...'/></TopBar>
        <div className='bg-white rounded-3xl shadow-xl w-fit p-4 flex items-center justify-center'>
            {children}
        </div>
        <BottomBar searchParams={searchParams}/>
    </div>);
}

export default TimelineCard;
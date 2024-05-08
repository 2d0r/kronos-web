'use client';

import AddSVG from '@/app/ui/svg/add-svg';
import PauseSVG from '@/app/ui/svg/pause-svg';
import PlaySVG from '@/app/ui/svg/play-svg';
import ShuffleSVG from '@/app/ui/svg/shuffle-svg';
import { minutesToDisplayDuration, minutesToTimerDisplay } from '@/app/utils/dateUtils';
import clsx from 'clsx';
import { Play } from 'lucide-react';
import Link from 'next/link';
import { FC, useState } from 'react';
import { CountdownCircleTimer } from "react-countdown-circle-timer";

const CircleTimer:FC<{
    duration: number
}> = ({duration}) => {

    const [ playing, setPlaying ] = useState<boolean>(false);

    const handlePlayPause = () => {
        setPlaying(!playing);
    }

    const handleEditTask = () => {

    }

    const handleExit = () => {

    }

    const renderTime = ({remainingTime} : {remainingTime: number}) => {
        if (remainingTime === 0) {
          return <div className="timer">Time's up!</div>;
        }
      
        return (
          <div className='flex flex-col gap-1 items-center'>
            <div className='h-8'></div>
            <div className='text-3xl'>{minutesToTimerDisplay(remainingTime / 60)}</div>
            {/* <div className="text">{remainingTime > 3600 ? 'h:mm:ss' : remainingTime > 60 ? 'mm:ss' : 'seconds'}</div> */}
            <div className='h-8'>{playing ? ' ' : 'Paused'}</div>
          </div>
        );
    };

    return (<>
        <CountdownCircleTimer
            isPlaying={playing}
            duration={duration * 60}
            colors={["#FFFFFF", "#FFFFFF"]}
            colorsTime={[duration, 0]}
            onComplete={() => ({ 
                shouldRepeat: true, 
                // delay: 1, 
                // newInitialRemainingTime: duration,
            })}
            isGrowing={true}
            trailColor='rgba(255,255,255,0.3)'
            strokeLinecap='round'
            rotation='counterclockwise'
        >
            {renderTime}
        </CountdownCircleTimer>
        <div className='w-full max-w-[400px] px-6 flex justify-between items-center'>
            <Link href='/timeline'>
                <div className='cursor-pointer ' onClick={handleExit}>
                    <img src='../icons/close.svg' className='h-8 w-8' />
                </div>
            </Link>
            <div className='cursor-pointer' onClick={handlePlayPause}>
                { playing ? <PauseSVG /> : <PlaySVG /> }
            </div>
            <div className='cursor-pointer' onClick={handleEditTask}>
                <img src='../icons/adjust.svg' className='h-8 w-8' />
            </div>
            
        </div>
    </>);
}

export default CircleTimer;

// Reference https://www.npmjs.com/package/react-countdown-circle-timer
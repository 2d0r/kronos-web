import React from 'react';

export default function Menu() {
    return (<div className='w-full h-1/2 flex p-8 gap-4'>
        <div className='rounded-2xl bg-white h-full w-full'></div>
        <div className='rounded-2xl bg-white h-full w-full'></div>
        <div className='rounded-2xl bg-white h-full w-full'></div>
        <div className='flex flex-col h-full w-full gap-4'>
            <div className='rounded-2xl bg-white h-full'></div>
            <div className='rounded-2xl bg-white h-full'></div>
        </div>
        
    </div>);
}
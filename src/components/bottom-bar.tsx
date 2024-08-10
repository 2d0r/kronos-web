import React from 'react';
import AddTaskButton from '@/components/buttons/add-task-button';
import { SearchParamProps, URLSearchParamsKronos } from '@/lib/definitions';

export default function BottomBar({searchParams, mindsetColour}: {
    searchParams: URLSearchParamsKronos,
    mindsetColour?: string
}) {
    return (<div className='fixed bottom-0 left-0 w-full p-4 flex justify-between'>
        <div></div>
        <AddTaskButton searchParams={searchParams} mindsetColour={mindsetColour}/>
    </div>);
}
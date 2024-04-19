import React from 'react';
import AddTaskButton from './buttons/add-task-button';
import { SearchParamProps, URLSearchParamsKronos } from '../lib/definitions';

export default function BottomBar({searchParams}: {searchParams: URLSearchParamsKronos}) {
    return (<div className='fixed bottom-0 left-0 z-50 w-full p-4 flex justify-between'>
        <div></div>
        <AddTaskButton searchParams={searchParams}/>
    </div>);
}
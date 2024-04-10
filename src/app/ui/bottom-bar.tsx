import React from 'react';
import AddTaskButton from './add-task-button';

export default function BottomBar() {
    return (<div className='fixed bottom-0 left-0 z-50 w-full p-4 flex justify-between'>
        <div></div>
        <AddTaskButton/>
    </div>);
}
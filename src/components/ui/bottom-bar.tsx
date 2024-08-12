'use client';

import React from 'react';
import AddTaskButton from '@/components/buttons/add-task-button';

export default function BottomBar({mindsetColour}: {
    mindsetColour?: string
}) {
    return (<div className='fixed bottom-0 left-0 w-full p-4 flex justify-between'>
        <div></div>
        <AddTaskButton mindsetColour={mindsetColour}/>
    </div>);
}
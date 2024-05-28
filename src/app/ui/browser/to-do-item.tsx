'use client';

import { Status } from '@prisma/client';
import { FC, useState } from 'react';
import Checkbox from './checkbox';
import { TaskWithRelations } from '@/app/lib/definitions';
import Link from 'next/link';

const ToDoItem: FC<{
    task: TaskWithRelations, 
    className?: string, 
    size?: ('small' | 'regular'), 
    onTaskStatusUpdated: (taskId: string, status: Status) => void,
    onTaskDelete: (taskId: string) => void,
}> = ({task, className, size = 'regular', onTaskStatusUpdated, onTaskDelete}) => {
    const [ showEdit, setShowEdit ] = useState<boolean>(false);

    const handleHoverIn = () => {
        setShowEdit(true);
    }
    const handleHoverOut = () => {
        setShowEdit(false);
    }
    const handleTaskDelete = () => {
        onTaskDelete(task.id);
    }

    return (<div className='w-full flex items-center gap-3 justify-between' onMouseOver={handleHoverIn} onMouseOut={handleHoverOut}>
        <div className={'flex gap-2 items-center ' + className}>
            <Checkbox type={task.type} repeat={task.repeat} taskId={task.id} status={task.status} 
                onTaskStatusUpdated={onTaskStatusUpdated}
                fill={task.mindset?.colour}
            />
            <span>{task.name}</span>
        </div>
        <div className='flex gap-2'>
            <Link 
                href={`?editTask=${task.id}`}
                className='text-sm text-gray-400 cursor-pointer'
            >{showEdit && 'Edit'}</Link>
            <button 
                onClick={handleTaskDelete}
                className='text-sm text-gray-400 cursor-pointer'
            >{showEdit && 'Delete'}</button>
        </div>
    </div>);
    
}

export default ToDoItem;
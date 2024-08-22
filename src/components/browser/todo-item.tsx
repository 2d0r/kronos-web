'use client';

import { Status } from '@prisma/client';
import { FC, useState } from 'react';
import Checkbox from './checkbox';
import { ActionType, TaskWithRelations } from '@/lib/definitions';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

const ToDoItem: FC<{
    task: TaskWithRelations, 
    className?: string, 
    size?: ('small' | 'regular'), 
    onTaskStatusUpdated: (taskId: string, status: Status) => void,
    onTaskDelete: (taskId: string) => void,
}> = ({task, className, size = 'regular', onTaskStatusUpdated, onTaskDelete}) => {
    
    const [ showEdit, setShowEdit ] = useState<boolean>(false);
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const handleHoverIn = () => {
        setShowEdit(true);
    }
    const handleHoverOut = () => {
        setShowEdit(false);
    }
    const handleTaskDelete = async (taskId: string) => {
        await fetch(`/task/${taskId}`, {
            method: 'DELETE'
        });
        onTaskDelete(taskId);
    }


    return (<div className='w-full flex items-center gap-3 justify-between cursor-pointer' onMouseOver={handleHoverIn} onMouseOut={handleHoverOut}>
        <div className={'flex gap-2 items-center ' + className}>
            <Checkbox type={task.type} repeat={task.repeat} taskId={task.id} status={task.status} 
                onTaskStatusUpdated={onTaskStatusUpdated}
                fill={task.mindset?.colour}
            />
            <Link href={pathname + `?task=${task.id}`}>{task.name}</Link>
        </div>
        <div className='flex gap-2'>
            <Link 
                href={`?task=${task.id}`}
                className='text-sm text-gray-400 cursor-pointer'
            >{showEdit && 'Edit'}</Link>
            <button 
                onClick={() => handleTaskDelete(task.id)}
                className='text-sm text-gray-400 cursor-pointer'
            >{showEdit && 'Delete'}</button>
        </div>
    </div>);
    
}

export default ToDoItem;
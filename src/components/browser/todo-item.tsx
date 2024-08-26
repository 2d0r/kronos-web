'use client';

import { Status } from '@prisma/client';
import { useState } from 'react';
import Checkbox from './checkbox';
import { TaskWithRelations } from '@/lib/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ToDoItemProps {
    task: TaskWithRelations, 
    className?: string, 
    onTaskStatusUpdated: (taskId: string, status: Status) => void,
    onTaskDelete: (taskId: string) => void,
};

export default function ToDoItem ({
    task, className, onTaskStatusUpdated, onTaskDelete
} : ToDoItemProps) {
    
    const [ showEdit, setShowEdit ] = useState<boolean>(false);
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


    return (<div className='w-full flex items-center gap-3 justify-between' onMouseOver={handleHoverIn} onMouseOut={handleHoverOut}>
        <div className={'flex gap-2 items-center ' + className}>
            <Checkbox type={task.type} repeat={task.repeat} taskId={task.id} status={task.status} 
                onTaskStatusUpdated={onTaskStatusUpdated}
                fill={task.mindset?.colour}
            />
            <Link href={pathname + `?task=${task.id}&status=edit`} className='cursor-pointer'>{task.name}</Link>
        </div>
        <div className='flex gap-2'>
            <Link 
                href={`?task=${task.id}&status=edit`}
                className='text-sm text-gray-400 cursor-pointer'
            >{showEdit && 'Edit'}</Link>
            <button 
                onClick={() => handleTaskDelete(task.id)}
                className='text-sm text-gray-400 cursor-pointer'
            >{showEdit && 'Delete'}</button>
        </div>
    </div>);
    
};
'use client';

import { Status, Task, TaskType } from '@prisma/client'
import Image from 'next/image';
import { FC, useState } from 'react';
import CheckboxBlankSVG from '../svg/checkbox-blank';
import Checkbox from '../buttons/checkbox';
import { TaskWithRelations } from '@/app/lib/definitions';
import Link from 'next/link';

const ToDoItem: FC<{
    task: TaskWithRelations, className?: string, size?: ('small' | 'regular'), onTaskStatusUpdated: (taskId: string, status: Status) => void
}> = ({task, className, size = 'regular', onTaskStatusUpdated}) => {
    const [ showEdit, setShowEdit ] = useState<boolean>(false);

    const handleHoverIn = () => {
        setShowEdit(true);
    }
    const handleHoverOut = () => {
        setShowEdit(false);
    }

    return (<div className='w-full flex items-center gap-3' onMouseOver={handleHoverIn} onMouseOut={handleHoverOut}>
        <div className={'flex gap-2 items-center ' + className}>
            <Checkbox type={task.type} repeat={task.repeat} taskId={task.id} status={task.status} 
                onTaskStatusUpdated={onTaskStatusUpdated}
                fill={task.mindset?.colour}
            />
            <span>{task.name}</span>
        </div>
        <Link 
            href={`?editTask=${task.id}`}
            className='text-sm text-gray-400 cursor-pointer'
        >{showEdit && 'Edit'}</Link>
    </div>);
    
}

export default ToDoItem;
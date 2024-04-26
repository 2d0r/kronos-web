import { Task, TaskType } from '@prisma/client'
import Image from 'next/image';
import { FC } from 'react';
import CheckboxBlankSVG from '../svg/checkbox-blank';
import Checkbox from '../buttons/checkbox';

const ToDoItem: FC<{
    task: Task, className: string, size?: ('small' | 'regular'), onTaskStatusUpdated: any
}> = ({task, className, size = 'regular', onTaskStatusUpdated}) => {
    return (
        <div className={'flex gap-2 items-center ' + className}>
            <Checkbox taskId={task.id} status={task.status} type={task.type} 
                fill='white' 
                height={size === 'regular' ? '24' : '20'}
                width={size === 'regular' ? '24' : '20'}
                onTaskStatusUpdated={onTaskStatusUpdated}
            />
            <span>{task.name}</span>
        </div>
    );
    
}

export default ToDoItem;
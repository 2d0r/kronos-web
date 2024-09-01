'use client';

import { Status } from '@prisma/client';
import { useState } from 'react';
import Checkbox from './checkbox';
import { TaskWithRelations } from '@/lib/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useMindsetColour } from '@/store/store';
import { adjustLightness } from '@/utils/colour-utils';

interface ToDoItemProps {
    task: TaskWithRelations, 
    className?: string, 
    onTaskStatusUpdated: (taskId: string, status: Status) => void,
    onTaskDelete: (taskId: string) => void,
};

export default function ToDoItem ({
    task, className, onTaskStatusUpdated, onTaskDelete
} : ToDoItemProps) {
    
    const [ showOptions, setShowOptions ] = useState<boolean>(false);
    const pathname = usePathname();
    const mindsetColour = useMindsetColour();
    const lightMindsetColour = adjustLightness(mindsetColour, 0.5);

    const handleHoverIn = () => {
        setShowOptions(true);
    }
    const handleHoverOut = () => {
        setShowOptions(false);
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
            <Link href={`?task=${task.id}&status=edit`} className='cursor-pointer' >
                {showOptions && <PencilSquareIcon color={lightMindsetColour} width={18} />}
            </Link>
            <button onClick={() => handleTaskDelete(task.id)} className='cursor-pointer'>
                {showOptions && <TrashIcon color={lightMindsetColour} width={18} />}
            </button>
        </div>
    </div>);
    
};
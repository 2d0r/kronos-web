'use client';

import { updateTaskField } from '@/lib/actions';
import { Status, TaskType } from '@prisma/client';
import { useEffect, useState } from 'react';
import CheckboxSVG from '@/components/svg/checkbox-svg';
import { CheckboxStatus } from '@/lib/definitions';

interface CheckboxProps {
    type: TaskType,
    repeat?: boolean,
    status: Status,
    taskId: string,
    fill?: string,
    height?: string, width?: string,
    onTaskStatusUpdated: any//(taskId: string, status: Status) => void
};

export default function Checkbox ({
    type, status, taskId, fill = 'black', height='24', width='24', onTaskStatusUpdated, repeat
}: CheckboxProps) {

    const [ statusDisplay, setStatusDisplay ] = useState<CheckboxStatus>(status === 'done' ? 'checked' : 'blank');

    const handleCheckbox = () => {
        const newStatus : Status = statusDisplay === 'checked' ? 'toDo' : 'done';
        setStatusDisplay(statusDisplay => (statusDisplay === 'checked' ? 'blank' : 'checked'));
        updateTaskField(taskId, 'status', newStatus);
        onTaskStatusUpdated(taskId, newStatus);
    }

    return (<div className='cursor-pointer' onClick={handleCheckbox}>
        <CheckboxSVG  fill={fill} width={width} height={height} statusDisplay={statusDisplay} type={type} repeat={repeat} />
    </div>);
};
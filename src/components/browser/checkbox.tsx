'use client';

import { updateTaskField } from '@/lib/actions';
import { Status, TaskType } from '@prisma/client';
import { FC, useEffect, useState } from 'react';
import CheckboxSVG from '@/components/svg/checkbox-svg';
import { CheckboxStatus } from '@/lib/definitions';

const Checkbox: FC<{
    type: TaskType,
    repeat?: boolean,
    status: Status,
    taskId: string,
    fill?: string,
    height?: string, width?: string,
    onTaskStatusUpdated: any//(taskId: string, status: Status) => void
}> = ({type, status, taskId, fill = 'black', height='24', width='24', onTaskStatusUpdated, repeat}) => {

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
}

export default Checkbox;
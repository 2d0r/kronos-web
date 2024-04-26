import { Task, TaskType } from '@prisma/client'
import Image from 'next/image';
import { FC } from 'react';
import CheckboxBlankSVG from '../svg/checkbox-blank';

const ToDoItem: FC<{
    task: Task, keyProp: string, className: string
}> = ({task, keyProp, className}) => {
    return (
        <div key={keyProp} className={'flex gap-2 items-center ' + className}>
            {/* <img src={'./icons/checkbox-blank.svg'} className='w-6 h-6 fill-white' /> */}
            {/* <Image src='./icons/checkbox-blank.svg' alt={'checkbox-blank'} width='16' height='16' /> */}
            <CheckboxBlankSVG fill='white' width='16' height='16' />
            <span>{task.name}</span>
        </div>
    );
    
}

export default ToDoItem;
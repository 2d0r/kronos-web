import { Status, TaskType } from '@prisma/client';
import { FC } from 'react';

const Checkbox: FC<{
    type: TaskType,
    status: Status,
}> = ({type, status}) => {
    return (<></>);
}

export default Checkbox;
import React from 'react';
import { URLSearchParamsKronos } from '@/lib/definitions';
import TestView from '@/components/test-view';
import TaskCard from '@/components/tasks/task-card';

export default async function Page({ searchParams } : {searchParams: URLSearchParamsKronos}) {

    const showTaskCard = searchParams.task;

    return (<>
        <TestView back={true} />
        {showTaskCard && <TaskCard />}
    </>)
}
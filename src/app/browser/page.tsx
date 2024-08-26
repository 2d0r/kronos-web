import TimelineBoard from '@/components/ui/timeline-board';
import TaskBrowser from '@/components/browser/task-browser';
import { Suspense } from 'react';

export default async function Page() {

    return (<>
        <TimelineBoard back={true}>
            <Suspense>
                <TaskBrowser />
            </Suspense>
        </TimelineBoard>
    </>);
}
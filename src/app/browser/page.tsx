import TimelineBoard from '@/components/ui/timeline-board';
import TaskBrowser from '@/components/browser/task-browser';
import TaskCard from '@/components/tasks/task-card';
import { URLSearchParamsKronos } from '@/lib/definitions';

export default async function Page({ searchParams }: { searchParams: URLSearchParamsKronos }) {

    const showTaskCard = !!searchParams.task;

    return (<>
        <TimelineBoard back={true}>
            <TaskBrowser />
        </TimelineBoard>
        {showTaskCard && <TaskCard />}
    </>);
}
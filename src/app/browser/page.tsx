import TimelineBoard from '@/components/ui/timeline-board';
import TaskBrowser from '@/components/browser/task-browser';

export default async function Page() {

    return (<>
        <TimelineBoard back={true}>
            <TaskBrowser />
        </TimelineBoard>
    </>);
}
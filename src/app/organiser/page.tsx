import TestView2 from '@/components/test-view-2';
import TimelineBoard from '@/components/ui/timeline-board';

export default async function Page() {
    return (
        <TimelineBoard cardClassName='!mt-[10vh] overflow-scroll hide-scrollbar'>
            <TestView2 back={true} />
        </TimelineBoard>
    );
    
}
import TopBar from '@/components/ui/top-bar';
import BottomBar from '@/components/ui/bottom-bar';
import Timeline from '@/components/timeline';
import { Suspense } from 'react';
import { TimelineSkeleton } from '@/components/ui/skeletons';
  
export default async function Page() {
    return (<>
        <TopBar />
        <Suspense fallback={<TimelineSkeleton />}>
            <Timeline />
        </Suspense>
        <BottomBar />
    </>);
}
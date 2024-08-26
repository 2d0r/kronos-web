import React from 'react';
import TestView from '@/components/test-view';
import TestView2 from '@/components/test-view-2';
import TimelineBoard from '@/components/ui/timeline-board';

export default async function Page() {
    // return <TestView back={true} />;
    return <TimelineBoard cardClassName='!mt-[10vh] overflow-scroll hide-scrollbar'>
        <TestView2 />
    </TimelineBoard>;
}
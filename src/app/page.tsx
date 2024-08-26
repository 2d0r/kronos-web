import React, { Suspense } from 'react';
import TopBar from '@/components/ui/top-bar';
import BottomBar from '@/components/ui/bottom-bar';
import Timeline from '@/components/timeline';
  
export default async function Page() {
    return (<>
        <Suspense>
            <TopBar />
        </Suspense>
        <Suspense>
            <Timeline />
        </Suspense>
        <BottomBar />
    </>);
}
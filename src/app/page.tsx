import React from 'react';
import TopBar from '@/components/ui/top-bar';
import BottomBar from '@/components/ui/bottom-bar';
import Timeline from '@/components/timeline';
import SearchBar from '@/components/search';

export default async function Page() {

    return (<>
        <TopBar><SearchBar /></TopBar>
        <Timeline />
        <BottomBar />
    </>);
}
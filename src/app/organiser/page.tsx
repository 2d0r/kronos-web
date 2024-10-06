import Organiser from '@/components/organiser';
import { Suspense } from 'react';

export default async function Page() {
    return (<Suspense>
        <Organiser cardClassName='overflow-scroll hide-scrollbar' />
    </Suspense>);
    
}
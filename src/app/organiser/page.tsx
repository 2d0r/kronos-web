import Organiser from '@/components/organiser';
import { OrganiserSkeleton } from '@/components/ui/skeletons';
import { Suspense } from 'react';

export default async function Page() {
    return (<>
        <Suspense fallback={<OrganiserSkeleton />}>
            <Organiser cardClassName='overflow-scroll hide-scrollbar' />
        </Suspense>
    </>);
    
}
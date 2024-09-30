import Organiser from '@/components/organiser';

export default async function Page() {
    return (<>
        <Organiser cardClassName='!mt-[10vh] overflow-scroll hide-scrollbar' />
    </>);
    
}
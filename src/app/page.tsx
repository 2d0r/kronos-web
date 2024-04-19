import Button from '@/components/Button';
import { fetchTasksPrisma, getMindsetNames } from './lib/data';
import CreateTask from './ui/tasks/create-task';
import Breadcrumbs from './ui/tasks/breadcrumbs';
import { updateTimeScores } from './lib/actions';
import { handleOrganise } from './lib/organiser-idealFirst';
import TaskCard from './ui/tasks/task-card';
import Link from 'next/link';
import TopBar from './ui/top-bar';
import { SearchParamProps, URLSearchParamsKronos } from './lib/definitions';
import BottomBar from './ui/bottom-bar';

export default async function Page({ searchParams }: {searchParams: URLSearchParamsKronos}) {
  const tasks = await fetchTasksPrisma();
  const mindsetList = await getMindsetNames();

  // const minutes = 5, interval = minutes * 60 * 1000;
  // setInterval(updatePriorityScores, interval);

  return (<>
    <TopBar searchParams={searchParams}/>
    <main>
      {/* <Breadcrumbs
            breadcrumbs={[
            { label: 'Tasks', href: '/' },
            {
                label: 'Create Task',
                href: '/',
                active: true,
            },
            ]}
        /> */}
      <div className='container w-full justify-start flex flex-row gap-8 p-4'>
        <Button className='rounded-md bg-slate-300 from-neutral-950 p-6 w-1/4' onClick={updateTimeScores}>Rescore</Button>
        <Button className='rounded-md bg-slate-300 from-neutral-950 p-6 w-1/4' onClick={handleOrganise}>Organise</Button>
        <Link
          href="/timeline"
          className="mt-4 rounded-md bg-violet-600 px-4 py-2 text-sm text-white transition-colors hover:bg-violet-600"
        >
          Timeline
        </Link>
      </div>
      <div className='container w-full p-4 flex flex-col gap-2 text-center'>
        {tasks.sort((a, b) => b.priorityScore - a.priorityScore).map((task, idx) => {
          return (
            <TaskCard task={task} key={idx}/>
        )})}
      </div>
      
    </main>
    <BottomBar searchParams={searchParams}/>
  </>);
}
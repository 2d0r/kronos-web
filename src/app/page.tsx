import Button from "@/components/Button";
import { fetchTasksPrisma, getMindsetNames } from "./lib/data";
import CreateForm from "./ui/tasks/create-form";
import Breadcrumbs from "./ui/tasks/breadcrumbs";
import TaskCard from "./ui/tasks/task-card";
import { updatePriorityScores } from './lib/actions';
import { organiseWeek } from "./lib/organiser";

export default async function Home() {
  const tasks = await fetchTasksPrisma();
  const mindsetList = await getMindsetNames();

  // const minutes = 5, interval = minutes * 60 * 1000;
  // setInterval(updatePriorityScores, interval);

  return (<>
    <main>
      <Breadcrumbs
            breadcrumbs={[
            { label: 'Tasks', href: '/' },
            {
                label: 'Create Task',
                href: '/',
                active: true,
            },
            ]}
        />
      <CreateForm mindsetList={mindsetList} />
      <div className="container mx-auto w-full justify-center flex p-4">
      </div>
      <div className="container w-full p-4 flex flex-col gap-2 text-center">
        <Button className='rounded-md bg-slate-300 from-neutral-950 p-6 w-1/4' onClick={updatePriorityScores}>Rescore</Button>
        <Button className='rounded-md bg-slate-300 from-neutral-950 p-6 w-1/4' onClick={organiseWeek}>Organise</Button>
        {tasks.sort((a, b) => b.priorityScore - a.priorityScore).map((task, idx) => {
          return (
            <TaskCard task={task} key={idx}/>
        )})}
      </div>
    </main>
  </>);
}
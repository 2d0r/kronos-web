import Button from "@/components/Button";
import { revalidatePath } from "next/cache";
import { fetchTasks, fetchTasksPrisma, fetchMindsets } from "./lib/data";
import { deleteTask, deleteTaskPrisma } from "./lib/actions";
import CreateForm from "./ui/tasks/create-form";
import Breadcrumbs from "./ui/tasks/breadcrumbs";
import prisma from "./lib/db";

export default async function Home() {
  const tasks = await fetchTasksPrisma();


  function DeleteTask({ id }: { id: string }) {
    const deleteTaskWithId = deleteTaskPrisma.bind(null, id);

    return (
        <form action={deleteTaskWithId} className="flex align-middle">
            <button className="rounded-md border p-2 hover:bg-gray-100">
              Delete
            </button>
        </form>
    );
  }

  async function getMindsetById (id : string) {
    const mindsetByID = await prisma.mindset.findUnique({
      where: {
        id: id
      },
      select: {
        name: true
      }
    });

    if (mindsetByID) {
      return mindsetByID.name;
    } else {
      console.log('Mindset not found.');
      return 'Not found';
    }
  }

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
      <CreateForm />
      <div className="container mx-auto space-x-6 w-full justify-center flex p-4">
      </div>
      <div className="container space-x-6 w-full flex p-4 flex-col text-center">
        {tasks.map((task, idx) => {
          return (
            <div className='w-full h-full flex align-middle gap-6 text-left' key={idx}>
              <span>{JSON.stringify(task)}</span>
              <DeleteTask id={task.id} />
            </div>
        )})}
      </div>
    </main>
  </>);
}
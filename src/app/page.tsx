import Button from "@/components/Button";
import { revalidatePath } from "next/cache";
import { fetchTasks } from "./lib/data";
import { deleteTask } from "./lib/actions";
import CreateForm from "./ui/tasks/create-form";
import Breadcrumbs from "./ui/tasks/breadcrumbs";

export default async function Home() {
  const tasks = await fetchTasks();

  function DeleteTask({ id }: { id: string }) {
    const deleteTaskWithId = deleteTask.bind(null, id);

    return (
        <form action={deleteTaskWithId} className="flex align-middle">
            <button className="rounded-md border p-2 hover:bg-gray-100">
              Delete
            </button>
        </form>
    );
  }

  return (
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
              <span className="inline-block align-middle">{task.name} - {task.status} - {task.mindset}</span>
              <DeleteTask id={task.id} />
            </div>
        )})}
      </div>
    </main>
  );
}
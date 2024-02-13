import Button from "@/components/Button";
import { revalidatePath } from "next/cache";
import { fetchTasks } from "./lib/data";
import { deleteTask } from "./lib/actions";
import CreateForm from "./ui/tasks/create-form";

export default async function Home() {
  const tasks = await fetchTasks();

  function DeleteTask({ id }: { id: string }) {
    const deleteInvoiceWithId = deleteTask.bind(null, id);

    return (
        <form action={deleteInvoiceWithId} className="flex align-middle">
            <button className="rounded-md border p-2 hover:bg-gray-100">
              Delete
            </button>
        </form>
    );
  }

  // const generateTasks = async () => {
  //   'use server'; 
    
  //   await db.task.createMany({
  //     data: [
  //       { title: 'Breakfast'},
  //       { title: 'Lunch' },
  //       { title: 'Dinner' } 
  //     ]
  //   })
  //   revalidatePath('/');
  // }

  // const deleteAllTasks = async () => {
  //   'use server'; 
    
  //   await db.task.deleteMany();
  //   revalidatePath('/');
  // }

  return (
    <main>
      <CreateForm />
      <div className="container mx-auto space-x-6 w-full justify-center flex p-4">
        {/* <Button onClick={generateTasks}>Generate Tasks</Button> */}
        {/* <Button onClick={deleteAllTasks}>Delete Tasks</Button> */}
      </div>
      <div className="container space-x-6 w-full flex p-4 flex-col text-center">
        {tasks.map((task) => (
            <div className='w-full h-full flex align-middle gap-6 text-left' key={task.id}>
              <span className="inline-block align-middle">{task.name} - {task.status} - {task.mindset}</span>
              <DeleteTask id={task.id} />
            </div>
        ))}
      </div>
    </main>
  );
}
import Button from "@/components/Button";
import db from "@/modules/db";
import { revalidatePath } from "next/cache";

export default async function Home() {
  const tasks = await db.task.findMany({orderBy: {createdAt: 'desc'}});

  const generateTasks = async () => {
    'use server'; 
    
    await db.task.createMany({
      data: [
        { title: 'Breakfast'},
        { title: 'Lunch' },
        { title: 'Dinner' } 
      ]
    })
    revalidatePath('/');
  }

  const deleteAllTasks = async () => {
    'use server'; 
    
    await db.task.deleteMany();
    revalidatePath('/');
  }

  return (
    <main>
      <div className="container mx-auto space-x-6 w-full justify-center flex p-4">
        <Button onClick={generateTasks}>Generate Tasks</Button>
        <Button onClick={deleteAllTasks}>Delete Tasks</Button>
      </div>
      <div className="container space-x-6 w-full flex p-4 flex-col text-center">
        {tasks.map((task) => (
            <div key={task.id}>{task.title} {task.mindset}</div>
        ))}
      </div>
    </main>
  );
}
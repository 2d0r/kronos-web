import Button from "@/components/Button";
import db from "@/modules/db";
import { revalidatePath } from "next/cache";

export default async function Home() {
  const tasks = await db.task.findMany({orderBy: {createdAt: 'desc'}})

  const generateTasks = async () => {
    'use server'; 
    
    await db.task.createMany({
      data: [
        { title: 'Breakfast' },
        { title: 'Lunch' },
        { title: 'Dinner' } 
      ]
    })
    revalidatePath('/');
  }

  return (
    <main>
      <Button onClick={generateTasks}>Generate Posts</Button>

      {tasks.map((task) => (
          <div key={task.id}>{task.title}</div>
      ))}
    </main>
  );
}
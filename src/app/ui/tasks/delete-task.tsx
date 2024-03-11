import { deleteTaskPrisma } from "@/app/lib/actions";

export async function DeleteTask({ id }: { id: string }) {
    const deleteTaskWithId = deleteTaskPrisma.bind(null, id);
  
    return (
        <form action={deleteTaskWithId} className="flex align-middle">
            <button className="rounded-md border p-2 hover:bg-gray-100">
              Delete
            </button>
        </form>
    );
  }
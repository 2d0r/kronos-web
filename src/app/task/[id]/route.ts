import prisma from '@/app/lib/db';

type Params = {
    id: string
}

export async function DELETE(req: Request, context: { params: Params }) {
    const id= context.params.id;
    try {
        await prisma.task.delete({
            where: { id: id },
        });
        return Response.json({message: 'Deleted task via API route'});
    } catch (error) {
        console.error('Error deleting task via API routes', error);
        return Response.json(
            {
                message: 'Error deleting task via API routes',
                error,
            },
            {
                status: 500,
            }
        );
    }
}

export async function PUT(req: Request, context: { params: Params }) {
    const taskData = await req.json();
    try {
        const updatedTask = await prisma.task.update({
            where: { id: taskData.id },
            data: taskData,
        });
        return Response.json({message: 'Updated task via API route', task: updatedTask});
    } catch (error) {
        console.error('Error updating task via API routes', error);
        return Response.json(
            {
                message: 'Error updating task via API routes',
                error,
            },
            {
                status: 500,
            }
        );
    }
}
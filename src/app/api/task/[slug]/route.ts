import prisma from '@/lib/db';

type Params = {
    slug: string
}

export async function GET(req: Request, context: { params: Params }) {
    const id = context.params.slug;
    try {
        const task = await prisma.task.findUnique({
            where: {
                id: id
            },
            include: { 
                events: true,
                mindset: true,
                tasksBefore: true,
                tasksAfter: true,
                tasksRightBefore: true,
                tasksRightAfter: true,
                tasksParent: true,
                tasksChild: true,
            } // Include the subtasks relation
        });
        return Response.json({message: 'OK', task});
    } catch (error) {
        console.error('Error fetching tasks via route handler', error);
        return Response.json(
            {
                message: 'Error fetching tasks via route handler',
                error,
            },
            {
                status: 500,
            }
        );
    }
}

export async function DELETE (req: Request, context: { params: Params }) {
    const id = context.params.slug;
    try {
        await prisma.task.delete({
            where: { id: id },
        });
        return Response.json({message: 'Deleted task via route handler'});
    } catch (error) {
        console.error('Error deleting task via route handler', error);
        return Response.json(
            {
                message: 'Error deleting task via route handler',
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
        console.error('Error updating task via route handler', error);
        return Response.json(
            {
                message: 'Error updating task via route handler',
                error,
            },
            {
                status: 500,
            }
        );
    }
}

export async function PATCH (req: Request, context: { params: Params }) {
    const id = context.params.slug;
    const body = await req.json();
    const { status } = body;

    const updatedTask = await prisma.task.update({
        where: {
            id: id,
        },
        data: {
            status: status,
        }
    });
    return Response.json({ message: 'Updated task status', task: updatedTask.name, status: updatedTask.status});
};
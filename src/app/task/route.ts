import prisma from '@/app/lib/db';

type Params = {
    taskId: string
}

export async function GET(req: Request) {
    try {
        const tasks = await prisma.task.findMany({
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
        return Response.json({message: 'OK', tasks});
    } catch (error) {
        console.error('Error fetchings tasks via API routes', error);
        return Response.json(
            {
                message: 'Error fetchings tasks via API routes',
                error,
            },
            {
                status: 500,
            }
        );
    }
}
import prisma from '@/lib/db';

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
import prisma from '@/app/lib/db';

type Params = {
    task: string
}

export async function GET(req: Request, context: { params: Params }) {
    const taskId = context.params.task;
    try {
        const now = new Date();
        const events = await prisma.event.findMany({
            where: { 
                taskId: taskId,
                startTime: {
                    gt: now
                }
            },
        });
        return Response.json({message: 'Fetched task by event ID', events});
    } catch (error) {
        console.error('Error fetching events by taskId', error);
        return Response.json(
            {
                message: 'Error fetching events by taskId',
                error,
            },
            {
                status: 500,
            }
        );
    }
}
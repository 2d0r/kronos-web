import prisma from '@/lib/db';

type Params = {
    event: string
}

export async function GET(req: Request, context: { params: Params }) {
    const id = context.params.event;
    try {
        const event = await prisma.event.findUnique({
            where: { id: id },
        });
        const task = await prisma.task.findUnique({
            where: { id: event?.taskId },
        })
        return Response.json({message: 'Fetched task by event ID', task: task});
    } catch (error) {
        console.error('Error fetching task by eventId', error);
        return Response.json(
            {
                message: 'Error fetching task by eventId',
                error,
            },
            {
                status: 500,
            }
        );
    }
}
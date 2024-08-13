import prisma from '@/lib/db';

export async function GET(req: Request) {

    try {
        const events = await prisma.event.findMany({
            include: { 
                task: true,
            }, // Include the subtasks relation
            where: {
                endTime: { gte: new Date() },
            },
            orderBy: {
                startTime: 'asc'
            },
        });
        return Response.json({message: 'OK', events: events});
    } catch (error) {
        console.error('Error fetchings upcoming events via route handler', error);
        return Response.json(
            {
                message: 'Error fetchings upcoming events via route handler',
                error,
            },
            {
                status: 500,
            }
        );
    }
}
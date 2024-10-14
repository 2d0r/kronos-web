import prisma from '@/lib/db';

export async function GET(req: Request) {

    try {
        const events = await prisma.event.findMany({
            include: { 
                task: true,
            }, // Include the subtasks relation
            // where: {
            //     startTime: { gte: new Date() },
            // },
            // orderBy: {
            //     startTime: 'asc'
            // },
        });
        return Response.json({message: 'OK', events: events});
    } catch (error) {
        console.error('Error fetching events via route handler', error);
        return Response.json(
            {
                message: 'Error fetching events via route handler',
                error,
            },
            {
                status: 500,
            }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        await prisma.event.deleteMany();
        return Response.json({message: 'Deleted all events'});
    } catch (error) {
        console.error('Error deleting all events', error);
        return Response.json(
            {
                message: 'Error deleting all events',
                error,
            },
            {
                status: 500,
            }
        );
    }
}
import prisma from '@/lib/db';

type Params = {
    count: string,
}

export async function GET(req: Request, context: { params: Params }) {
    const count = context.params.count;
    // const { searchParams } = new URL(req.url);
    // const count = searchParams.get('count'); // Example filter parameter

    try {
        const events = await prisma.event.findMany({
            include: { 
                task: true,
            }, // Include the subtasks relation
            orderBy: {
                startTime: 'asc'
            },
            take: count ? Number(count) : undefined,
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
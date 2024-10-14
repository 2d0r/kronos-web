import prisma from '@/lib/db';

type Params = {
    count: string,
}

export async function GET(req: Request, context: { params: Params }) {
    const count = context.params.count;
    const now = new Date();

    try {
        const events = await prisma.event.findMany({
            where: {
                OR: [
                    { startTime: { gt: now }},
                    { endTime: { gt: now }},
                ]
            },
            orderBy: {
                startTime: 'asc'
            },
            include: { 
                task: true,
            }, 
            take: count ? Number(count) : undefined,
        });
        return Response.json({message: 'OK', events: events});
    } catch (error) {
        console.error('Error fetching upcoming events via route handler', error);
        return Response.json(
            {
                message: 'Error fetching upcoming events via route handler',
                error,
            },
            {
                status: 500,
            }
        );
    }
}
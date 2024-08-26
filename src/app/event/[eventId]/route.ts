import prisma from '@/lib/db';

type Params = {
    id: string
}

export async function GET(req: Request, context: { params: Params }) {
    const id = context.params.id;
    try {
        const event = await prisma.event.findUnique({
            where: {
                id: id
            },
            include: { 
                task: true,
            } // Include the subtasks relation
        });
        return Response.json({message: 'OK', event});
    } catch (error) {
        console.error('Error fetching event by id via route handler', error);
        return Response.json(
            {
                message: 'Error fetching event by id via route handler',
                error,
            },
            {
                status: 500,
            }
        );
    }
}
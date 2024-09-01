import prisma from '@/lib/db';

type Params = {
    taskId: string
}

export async function GET(req: Request, context: { params: Params }) {
    const id = context.params.taskId;
    try {
        const mindset = await prisma.mindset.findUnique({
            where: {
                id: id
            },
        });
        return Response.json({message: 'OK', mindset});
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
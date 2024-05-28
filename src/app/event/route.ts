import prisma from '@/app/lib/db';

export async function GET(req: Request) {
    try {
        const events = await prisma.event.findMany({
            include: { 
            } // Include the subtasks relation
        });
        return Response.json({message: 'OK', events});
    } catch (error) {
        console.error('Error fetchings events via API routes', error);
        return Response.json(
            {
                message: 'Error fetchings events via API routes',
                error,
            },
            {
                status: 500,
            }
        );
    }
}
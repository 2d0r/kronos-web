import prisma from '@/lib/db';

type Params = {
    slug: string
}

export async function GET(req: Request, context: { params: Params }) {
    const slug = context.params.slug;

    if (slug.includes('of-task-')) {
        const taskId = slug.split('-')[-1];
        try {
            const mindset = await prisma.task.findUnique({
                where: {
                    id: taskId,
                },
                select: {
                    mindset: true,
                }
            });
            return Response.json({message: 'OK', mindset});
        } catch (error) {
            console.error('Error fetching mindset of task via route handler', error);
            return Response.json(
                {
                    message: 'Error fetching mindset of task via route handler',
                    error,
                },
                {
                    status: 500,
                }
            );
        }
    }
    
}
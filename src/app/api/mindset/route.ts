import prisma from '@/lib/db';

export async function GET(req: Request) {

    try {
        const mindsets = await prisma.mindset.findMany();
        return Response.json({message: 'OK', mindsets: mindsets});
    } catch (error) {
        console.error('Error fetching mindsets via route handler', error);
        return Response.json(
            {
                message: 'Error fetching mindsets via route handler',
                error,
            },
            {
                status: 500,
            }
        );
    }
}
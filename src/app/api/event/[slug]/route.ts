import { getCurrentMindsetColour } from '@/lib/data';
import prisma from '@/lib/db';
import { NEUTRAL_MINDSET_COLOUR } from '@/lib/definitions';

type Params = {
    slug: string
}

export async function GET(req: Request, context: { params: Params }) {
    const slug = context.params.slug;

    // Fetch upcoming events
    if (slug.includes('upcoming')) {
        let count = undefined;
        let now = new Date();
        // Fetch a specific number of upcoming events
        if (slug.includes('upcoming-')) {
            count = Number(slug.slice('upcoming-'.length));
        }
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
                take: count,
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
    
    // Fetch all events of a specified task
    else if (slug.includes('of-task-')) {
        const taskId = slug.slice('of-task-'.length);
        try {
            const now = new Date();
            const events = await prisma.event.findMany({
                where: { 
                    taskId: taskId,
                    startTime: {
                        gt: now
                    }
                },
            });
            return Response.json({message: 'Fetched task by event ID', events});
        } catch (error) {
            console.error('Error fetching events by taskId', error);
            return Response.json(
                {
                    message: 'Error fetching events by taskId',
                    error,
                },
                {
                    status: 500,
                }
            );
        }
    }

    // Fetch current mindset colour
    else if (slug === 'current-mindset-colour') {
        try {
            const currentMindsetColour = await getCurrentMindsetColour() || NEUTRAL_MINDSET_COLOUR;
            return Response.json({message: 'OK', currentMindsetColour});
        } catch (error) {
            console.error('Error fetching current mindset colour via route handler', error);
            return Response.json(
                {
                    message: 'Error fetching current mindset colour via route handler',
                    error,
                },
                { status: 500, }
            );
        }
    }

    // Fetch event by id
    else {
        const id = slug;
        try {
            const event = await prisma.event.findUnique({
                where: {
                    id: id,
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
}
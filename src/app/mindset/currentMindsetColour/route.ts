import { getCurrentMindsetColour } from '@/lib/data';
import { NEUTRAL_MINDSET_COLOUR } from '@/lib/definitions';

export async function GET(req: Request) {
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
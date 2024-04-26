import { TaskWithRelations } from '@/app/lib/definitions';
import prisma from '@/app/lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';

export async function GET() {
    // try {
        const tasks = await prisma.task.findMany({
            include: { 
                tasksBefore: true,
                tasksAfter: true,
                tasksRightBefore: true,
                tasksRightAfter: true,
                tasksParent: true,
                tasksChild: true,
            } // Include the subtasks relation
        });
        return Response.json(tasks);
    // } catch (error) {
    //     console.error("Request error", error);
    //     res.status(500).json({ error: "Error fetching tasks" });
    // }
}
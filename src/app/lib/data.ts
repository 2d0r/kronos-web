import { sql } from '@vercel/postgres';
import { unstable_noStore as noStore } from 'next/cache';
import {
    Task,
    User,
} from './definitions';
import prisma from './db';



export async function fetchTasksPrisma() {

    try {
        const allTasks = await prisma.task.findMany();
        await prisma.$disconnect();
        return allTasks;
    } catch (error) {
        console.error('Database Error:', error);
        // throw new Error('Failed to fetch the latest tasks.');
        await prisma.$disconnect();
        process.exit(1);
    }
}

export async function fetchMindsets() {

    try {
        const allMindsets = await prisma.mindset.findMany();
        await prisma.$disconnect();
        return allMindsets;
    } catch (error) {
        console.error('Database Error:', error);
        // throw new Error('Failed to fetch the latest tasks.');
        await prisma.$disconnect();
        process.exit(1);
    }
}

export async function fetchTasks() {
    noStore();
    try {
        const data = await sql<Task>`
        SELECT tasks.id, tasks.name, tasks.status, tasks.mindset
        FROM tasks
        ORDER BY tasks.name ASC
        LIMIT 10`;

        const latestTasks = data.rows;
        return latestTasks;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch the latest tasks.');
    }
}

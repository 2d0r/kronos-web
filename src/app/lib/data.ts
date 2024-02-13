import { sql } from '@vercel/postgres';
import { unstable_noStore as noStore } from 'next/cache';
import {
    Task,
    User,
} from './definitions';

export async function fetchTasks() {
    noStore();
    try {
        const data = await sql<Task>`
        SELECT tasks.name, tasks.status, tasks.mindset
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
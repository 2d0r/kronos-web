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
        const mindsets = await prisma.mindset.findMany();
        await prisma.$disconnect();
        return mindsets;
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

export async function updateTaskField(entryId: string, field: string, value: any) {
    // get type of field from database
    try {
      await prisma.task.update({
          where: {
            id: entryId,
          },
          data: {
            [field]: value
          }
      });
      await prisma.$disconnect();
    } catch (error) {
        console.error('Failed to find and update task with id:', entryId, error);
        // throw new Error('Failed to fetch the latest tasks.');
        await prisma.$disconnect();
        process.exit(1);
    }
  }

  export async function getMindsetNames() {
    try {
      // Use Prisma to query all 'name' values from the 'mindset' table
      const mindsetNames = await prisma.mindset.findMany({
        select: {
          name: true,
        },
      });
  
      // Extract the 'name' values from the result
      const namesArray = mindsetNames.map((mindset) => mindset.name);
  
      console.log(namesArray);
      return namesArray;
    } catch (error) {
      console.error('Error fetching mindsets:', error);
      throw error;
    } finally {
      await prisma.$disconnect(); // Disconnect the Prisma client when done
    }
  }
  
  export async function getMindsetById (id : string) {
    try {
      const mindsetByID = await prisma.mindset.findUnique({
        where: {
          id: id
        },
        select: {
          name: true
        }
      });
      if (mindsetByID) {
        return mindsetByID.name;
      }
    } catch (error) {
        console.error('Error getting mindset by id:', id);
        await prisma.$disconnect();
        process.exit(1);
    }
  }
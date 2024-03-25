import { sql } from '@vercel/postgres';
import { unstable_noStore as noStore, revalidatePath } from 'next/cache';
import {
    User,
} from './definitions';
import prisma from './db';
import { calculatePriorityScores } from './priorityScore';
import { Mindset, Task } from '@prisma/client';


export async function fetchTasksPrisma() {
  try {
      const allTasks = await prisma.task.findMany();
      return allTasks;
  } catch (error) {
      console.error('Database Error:', error);
      // throw new Error('Failed to fetch the latest tasks.');
      process.exit(1);
  }
}

export async function fetchEvents() {
  try {
    const allEvents = await prisma.event.findMany();
    return allEvents;
} catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest events.');
}
}

export async function getCurrentTask() {
  const now = new Date();
  try {
    const currentEvents = await prisma.event.findMany({
      where: {
        startTime: {
          lt: now, // Start time is less than (before) now
        }, 
        endTime: {
          gt: now, // End time is greater than (after) now 
        },
      }, 
      select: {
        taskId: true
      }
    });
    if (currentEvents.length > 0) {
      const currentEventsTaskIds = currentEvents.map(el => el.taskId);
      const tasks = await fetchTasksPrisma();
      const currentTasks = tasks.filter(el => currentEventsTaskIds.includes(el.id))
        .sort((a,b) => (a.priorityScore - b.priorityScore));
      return currentTasks;
    } else {
      return [];
    }
  } catch (error) {
    console.log('Failed to fetch mindset list', error);
    throw error;
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

export async function allTasksHaveActiveEvents() {
  const tasksWithoutActiveEvents = await prisma.task.findMany({
    where: {
      events: {
        none: {}  // Filter for tasks where 'events' is empty
      }
    }
  })
  if (tasksWithoutActiveEvents.length === 0) {
    return true;
  } else {
    return false;
  }
}

export async function getTaskMindset(task: Task) {
  try {
    const taskMindset = await prisma.mindset.findMany({
      where: {
        tasks: {
          some: {
            id: task.id
          } 
        }
      },
      select: {
        name: true
      }
    });
    return taskMindset[0].name;
  } catch (error) {
    console.error('Error getting mindset of task:', task.name);
    await prisma.$disconnect();
    process.exit(1);
  }
}
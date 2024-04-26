import { sql } from '@vercel/postgres';
import { unstable_noStore as noStore, revalidatePath } from 'next/cache';
import {
  TaskWithRelations,
    User,
} from './definitions';
import prisma from './db';
import { calculatePriorityScores } from './priorityScore';
import { Mindset, Task } from '@prisma/client';
import { Emilys_Candy } from 'next/font/google';
import { createEventPrisma } from './actions';


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

export async function fetchTasksWithRelations() {
  try {
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
    return tasks;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest tasks.');
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
    return mindsets;
  } catch (error) {
    console.log('Failed to fetch mindset list', error);
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
      }
    });
    return taskMindset[0];
  } catch (error) {
    console.error('Error getting mindset of task:', task.name);
    await prisma.$disconnect();
    process.exit(1);
  }
}

export async function fetchMindsetList() {
  try {
    const mindsetNames = await prisma.mindset.findMany({
      select: {
        name: true
      }
    });
    const mindsetList = mindsetNames.map(el => {
      return el.name;
    });
    return mindsetList;
  } catch (error) {
    console.log('Failed to fetch mindset list', error);
    return [];
  }
}
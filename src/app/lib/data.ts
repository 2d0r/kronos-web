import {
  MindsetWithRelations,
  EventWithRelations,
  TaskWithRelations,
  NEUTRAL_MINDSET_COLOUR,
} from './definitions';
import prisma from './db';
import { Event, Task } from '@prisma/client';
import { addHours } from 'date-fns';


// Tasks

export async function fetchTasks() {
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
    const tasks: TaskWithRelations[] = await prisma.task.findMany({
      include: { 
          tasksBefore: true,
          tasksAfter: true,
          tasksRightBefore: true,
          tasksRightAfter: true,
          tasksParent: true,
          tasksChild: true,
          mindset: true,
          events: true,
      } // Include the subtasks relation
    }); 
    return tasks;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest tasks.');
  }
}

export async function fetchTaskWithRelations(taskId: string) {
  try {
    const task: TaskWithRelations = await prisma.task.findUnique({
      where: {
        id: taskId
      },
      include: { 
          tasksBefore: true,
          tasksAfter: true,
          tasksRightBefore: true,
          tasksRightAfter: true,
          tasksParent: true,
          tasksChild: true,
          mindset: true,
          events: true,
      } // Include the subtasks relation
    }) || {} as TaskWithRelations; 
    return task;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest tasks.');
  }
}

export async function getCurrentTask() {
  const now = new Date();
  try {
    const currentEvents = await prisma.event.findMany({
      where: {
        startTime: {
          lt: now, // Start time is less than now
        }, 
        endTime: {
          gt: now, // End time is greater than now 
        },
      }, 
      
      select: {
        taskId: true
      }
    });
    if (currentEvents.length > 0) {
      const currentEventsTaskIds = currentEvents.map(el => el.taskId);
      const tasks = await fetchTasks();
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


// Events

export async function fetchEvents() {
  try {
    const allEvents = await prisma.event.findMany();
    return allEvents;
  } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch the latest events.');
  }
}

export async function fetchEventsWithRelations() {
  try {
    const events: EventWithRelations[] = await prisma.event.findMany({
        include: {
            task: true
        }
    });
    return events;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest events with relations.');
  }
}


// Mindsets

export async function fetchMindsets() {
  try {
    const mindsets = await prisma.mindset.findMany();
    return mindsets;
  } catch (error) {
    console.log('Failed to fetch mindset list', error);
    process.exit(1);
  }
}

export async function fetchMindsetsWithRelations() {
  try {
    const mindsets = await prisma.mindset.findMany({
      include: {
        tasks: true
      }
    });
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
  }
}
  
export async function getMindsetById (id : string) {
  try {
    const mindset = await prisma.mindset.findUnique({
      where: {
        id: id
      }
    });
    return mindset;
  } catch (error) {
      console.error('Error getting mindset by id:', id);
      process.exit(1);
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

export async function getEventMindset(event: Event) {
  try {
      const mindsets: MindsetWithRelations[] = await fetchMindsetsWithRelations();
      const eventMindset = mindsets.filter(mindset => mindset.tasks.some(task => {
        return Object.values(task).includes(event.taskId);
      }))[0];
    return eventMindset;
  } catch (error) {
    console.log('Failed to find event mindset', error);
    process.exit(1);
  }
}

export async function getCurrentMindsetColour() {
  // Get nearest event with task
  // Get its task id
  const now = new Date();
  try {
    const nearestEvents: EventWithRelations[] = await prisma.event.findMany({
      where: {
        // startTime: {
        //   lt: now, // Start time is less than now
        // }, 
        endTime: {
          gt: now, // End time is greater than now 
          // lt: addHours(now, 3)
        },
      }, 
      include: {
        task: true
      },
    });
    const nearestMindsetId = nearestEvents[0].task.mindsetId;
    const nearestMindset = await getMindsetById(nearestMindsetId);
    return nearestMindset?.colour;
  } catch (error) {
    console.log('Failed to get mindset', error);
  } 
  
  
}
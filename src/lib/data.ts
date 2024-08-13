import {
  MindsetWithRelations,
  EventWithRelations,
  TaskWithRelations,
  NEUTRAL_MINDSET_COLOUR,
} from '@/lib/definitions';
import prisma from '@/lib/db';
import { Event, Mindset, Task } from '@prisma/client';


// Tasks

export async function getTasks() {
  try {
      const allTasks = await prisma.task.findMany();
      return allTasks;
  } catch (error) {
      console.error('Database Error:', error);
      // throw new Error('Failed to fetch the latest tasks.');
      process.exit(1);
  }
}

export async function getTasksWithRelations() {
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

export async function getTaskWithRelations(taskId: string) {
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
      const tasks = await getTasks();
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

export const getTasksToSchedule = async () => {
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
      }, // Include the subtasks relation
      where: {
        status: {not: 'done'},
        fixed: false,
        AND: [{
            type: { not: 'goal' }
        }, {
            type: { not: 'project' }
        }],
      }
    }); 
    return tasks;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch all tasks to schedule.');
  }
}

export const getTasksByIds = async (taskIds: string[]) => {
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
      }, // Include the subtasks relation
      where: {
        id: { in: taskIds },
        status: {not: 'done'},
        fixed: false,
        AND: [{
            type: { not: 'goal' }
        }, {
            type: { not: 'project' }
        }],
      }
    }); 
    return tasks;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch tasks by ID.');
  }
}



// EVENTS

export async function getEvents() {
  try {
    const allEvents = await prisma.event.findMany();
    return allEvents;
  } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch the latest events.');
  }
}

export async function getEventsWithRelations() {
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

export const getUpcomingEvents = async (count: number) => {
  try {
    const events: EventWithRelations[] = await prisma.event.findMany({
        include: {
            task: true
        },
        where: {
            OR: [
            {
              startTime: { gte: new Date() },
            },
            {
              endTime: { gte: new Date() },
            }
          ]
        },
        orderBy: {
          startTime: 'asc',
        }
    });
    return events;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to get the next ${count} events.`);
  }
}

export async function findEventIdsInTimespan(start: Date, end?: Date) {
  try {
    const events = await prisma.event.findMany({
      where: {
        OR: [{
          startTime: { gte: start, lte: end },
        }, {
          endTime: { gte: start, lte: end }
        }, {
          startTime: { lte: start },
          endTime: { gte: end }
        }],
      },
      select: {
        id: true,
      }
    });
    return events;
  } catch (error) {
    console.error('Failed to find events in timespan:', error);
  }
}

export async function findEventsInTimespan(start: Date, end?: Date) {
  try {
    const events = await prisma.event.findMany({
      where: {
        OR: [{
          startTime: { gte: start, lte: end },
        }, {
          endTime: { gte: start, lte: end }
        }, {
          startTime: { lte: start },
          endTime: { gte: end }
        }],
      },
      include: {
        task: true,
      }
    });
    return events;
  } catch (error) {
    console.error('Failed to find events in timespan:', error);
  }
}



// MINDSETS

export async function getMindsets() {
  try {
    const mindsets = await prisma.mindset.findMany();
    return mindsets;
  } catch (error) {
    console.log('Failed to fetch mindset list', error);
    process.exit(1);
  }
}

export async function getMindsetsWithRelations() {
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
    const namesArray = mindsetNames.map((mindset : any) => mindset.name);
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

export async function getMindsetByName (name: string) {
  try {
    const mindset = await prisma.mindset.findUnique({
      where: {
        name: name
      }
    });
    return mindset;
  } catch (error) {
      console.error('Error getting mindset by name:', name);
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

export async function getMindsetList() {
  try {
    const mindsetNames = await prisma.mindset.findMany({
      select: {
        name: true
      }
    });
    const mindsetList = mindsetNames.map((el: any) => {
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
      const mindsets: MindsetWithRelations[] = await getMindsetsWithRelations();
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
    if (nearestEvents.length === 0) {
      return NEUTRAL_MINDSET_COLOUR;
    }
    // Sort them by start time
    nearestEvents.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    const nearestMindsetId = nearestEvents[0].task.mindsetId;
    const nearestMindset = await getMindsetById(nearestMindsetId);
    return nearestMindset?.colour;
  } catch (error) {
    console.log('Failed to get current mindset colour ❌', error);
  } 
  
  
}


// DATA FETCH

export const fetchEvents = async () => {
  const response = await fetch('/event');
  const data = await response.json();
  const newEvents = data.events;
  return newEvents as EventWithRelations[];
}
export const fetchUpcomingEvents = async (count?: number) => {
  // const response = await fetch(`/event?count=${count}`);
  const address = count ? `/event/upcoming/${count}` : '/event/upcoming/'
  const response = await fetch(address);
  const data = await response.json();
  const upcomingEvents = data.events;
  return upcomingEvents as EventWithRelations[];
}
export const fetchTasks = async () => {
  const response = await fetch('/task');
  const data = await response.json();
  const newTasks = data.tasks;
  return newTasks;
}
export const fetchTask = async (taskId: string) => {
  const response = await fetch(`/task/${taskId}`);
  const data = await response.json();
  return data.task;
}
export const fetchUpdatedTaskEvents = async (taskId: string) => {
  const response = await fetch(`/event/${taskId}`);
  const data = await response.json();
  return data.events;
}
export const fetchTaskOfEvent = async (eventId: string) => {
  const response = await fetch(`/task/event/${eventId}`);
  const data = await response.json();
  return data.task;
}
export const fetchMindsets = async () => {
  const response = await fetch(`/mindset`);
  const data = await response.json();
  return data.mindsets;
}
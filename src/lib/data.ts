import { MindsetWithRelations, EventWithRelations, TaskWithRelations } from '@/lib/types';
import prisma from '@/lib/db';
import { Event, Task, TaskType } from '@prisma/client';
import { NEUTRAL_MINDSET_COLOUR } from './definitions';


// Tasks

export const getTasks = async () => {
  try {
      const allTasks = await prisma.task.findMany();
      return allTasks;
  } catch (error) {
      console.error('Database Error:', error);
      // throw new Error('Failed to fetch the latest tasks.');
      process.exit(1);
  }
}

export const getTasksWithRelations = async () => {
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

export const getTaskWithRelations = async (taskId: string) => {
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

export const getCurrentTask = async () => {
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

export const getRelatedProjects = async (taskId: string) => {
  try {
    const currentTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        tasksParent: {
          where: { type: 'project' }
        }, // Include the parent task
      },
    });
  
    // Extract the related tasks of type 'project'
    const relatedTasks = currentTask?.tasksParent;
  
    return relatedTasks;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to get task\'s related projects.');
  }
}

export const getRelatedGoals = async (taskId: string) => {
  try {
    const currentTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        tasksParent: {
          where: { type: 'goal' }
        }, // Include the parent task
      },
    });
  
    // Extract the related tasks of type 'project'
    const relatedTasks = currentTask?.tasksParent;
  
    return relatedTasks;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to get task\'s related goals.');
  }
}

export const getRelatedTasks = async (taskId: string, type?: TaskType, chained?: 'after' | 'before' | 'rightAfter' | 'rightBefore' | 'all') => {
  try {
    const currentTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        tasksBefore: true,
        tasksAfter: true,
        tasksRightBefore: true,
        tasksRightAfter: true,
        tasksParent: true,
        tasksChild: true,
      },
    });

    const taskTypeHierarchy = {
      'step': 1,
      'task': 2,
      'project': 3,
      'goal': 4,
    }
  
    // Extract the related tasks of type 'project'
    const relatedTasks = currentTask ? 
      type && taskTypeHierarchy[currentTask.type] < taskTypeHierarchy[type] ? currentTask.tasksParent.filter(task => task.type === type)
      : type && taskTypeHierarchy[currentTask.type] > taskTypeHierarchy[type] ? currentTask.tasksChild.filter(task => task.type === type)
      : chained === 'all' ? [...currentTask.tasksAfter, ...currentTask.tasksBefore, ...currentTask.tasksRightAfter, ...currentTask.tasksRightBefore ]
      : chained === 'after' ? currentTask.tasksAfter
      : chained === 'before' ? currentTask.tasksBefore
      : chained === 'rightBefore' ? currentTask.tasksRightBefore
      : chained === 'rightAfter' ? currentTask.tasksRightAfter
      : [] : [];
  
    return relatedTasks;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to get task\'s related goals.');
  }
}

export const allTasksHaveActiveEvents = async () => {
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

export const getTaskById = async (taskId: string) => {
  try {
    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
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
      }, // Include the subtasks relation
    }); 
    return task;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch task by ID.');
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

export const getEvents = async () => {
  try {
    const allEvents = await prisma.event.findMany();
    return allEvents;
  } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch the latest events.');
  }
}

export const getEventById = async (eventId: string) => {
  try {
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
      include: { 
          task: true,
      }, // Include the subtasks relation
    }); 
    return event;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch event by ID.');
  }
}

export const getEventsWithRelations = async () => {
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

export const findEventIdsInTimespan = async (start: Date, end?: Date) => {
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

export const findEventsInTimespan = async (start: Date, end?: Date) => {
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

export const getMindsets = async () => {
  try {
    const mindsets = await prisma.mindset.findMany();
    return mindsets;
  } catch (error) {
    console.log('Failed to fetch mindset list', error);
    process.exit(1);
  }
}

export const getMindsetsWithRelations = async () => {
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

export const getMindsetNames = async () => {
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
  
export const getMindsetById  = async (id : string) => {
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

export const getMindsetByName  = async (name: string) => {
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

export const getMindsetByTaskId = async (taskId: string) => {
  try {
    const taskMindset = await prisma.mindset.findMany({
      where: {
        tasks: {
          some: {
            id: taskId
          } 
        }
      }
    });
    return taskMindset[0];
  } catch (error) {
    console.error('Error getting mindset of task:', taskId);
    process.exit(1);
  }
}

export const getMindsetList = async () => {
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

export const getEventMindset = async (event: Event) => {
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

export const getCurrentMindsetColour = async () => {
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

export const getMindsetDisplayValues = async () => {
  const mindsets = await prisma.mindset.findMany({
    select: {
      display: true,
    },
  });

  return mindsets.map((mindset) => mindset.display);
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
  const address = count ? `/event/upcoming/${count}` : '/event/upcoming'
  const response = await fetch(address);
  const data = await response.json();
  const upcomingEvents = data.events;
  return upcomingEvents as EventWithRelations[];
}
export const fetchTasks = async () => {
  const response = await fetch('/task/api');
  const data = await response.json();
  const newTasks = data.tasks;
  return newTasks;
}
export const fetchTask = async (taskId: string) => {
  const response = await fetch(`/task/${taskId}`);
  const data = await response.json();
  return data.task;
}
export const fetchEventsOfTask = async (taskId: string) => {
  const response = await fetch(`/event/task/${taskId}`);
  const data = await response.json();
  return data.events;
}
export const fetchEventById = async (eventId: string) => {
  const response = await fetch(`/event/${eventId}`);
  const data = await response.json();
  return data.event;
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
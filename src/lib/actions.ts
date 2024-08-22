'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';
import { Event, Task, TaskType, TimespanType } from '@prisma/client';
import { DEFAULT_MINDSET_LIST, MIN_TASK_DURATION } from '@/lib/definitions';
import { TaskWithRelations } from './types';
import { getMindsets, getTasks, findEventIdsInTimespan, getMindsetByName } from '@/lib/data';
import { calculatePriorityScores } from '@/lib/priority-score';
import { calculateTimeScore } from '@/lib/time-score';
import { v4 as uuidv4 } from 'uuid';
import { organiseTask } from '@/lib/organise-task';
import { addDays } from 'date-fns';

const FormSchema = z.object({
  id: z.string(),
  date: z.date(),
  name: z.string(),
  type: z.string(),
  mindset: z.enum(DEFAULT_MINDSET_LIST, { invalid_type_error: 'Please select a valid mindset.' }),
  status: z.enum(['toDo', 'inProgress', 'done'], { invalid_type_error: 'Please select a valid status.' }).nullable(),
  priority: z.enum(['veryHigh', 'high', 'medium', 'low'], { invalid_type_error: 'Please select a valid priority.' }),
  startTime: z.string().nullable(),
  startDate: z.string().nullable(),
  endTime: z.string().nullable(),
  endDate: z.string().nullable(),
  // duration: z.string(),
  durationHours: z.string().nullable(),
  durationMinutes: z.string().nullable(),
  deadline: z.string().nullable(),
  // repeat: z.coerce.boolean(),
  repeatUnit: z.enum(['sessions', 'minutes'], { invalid_type_error: 'Please select a valid Repeat Unit.' }).nullable(),
  repeatFrequency: z.string().nullable(),
  repeatTimespan: z.enum(['hour', 'day', 'week', 'month', 'year'], { invalid_type_error: 'Please select a valid Repeat Timespan.' }).nullable(),
  repeatTimespanMultiplier: z.string().nullable(),
  repeatDurationHours: z.string().nullable(),
  repeatDurationMinutes: z.string().nullable(),
  idealStart: z.string().nullable(),
  preferredTimeOfDay: z.array(z.enum(['morning', 'afternoon', 'evening', 'night'], { invalid_type_error: 'Please select a valid time of day.' })).nullable(), // z.array(z.string().refine(value => timeOfDayList.includes(value))), // 
  preferredDayOfWeek: z.array(z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], { invalid_type_error: 'Please select a valid day of the week.' })).nullable(),
  endRepeat: z.string().nullable(),
  totalDuration: z.string().nullable(),
  totalRepetitions: z.string().nullable(),
  endRepeatDate: z.string().nullable(),
});

export type State = {
  errors?: {
    id?: string[];
    name?: string[];
    type?: string[];
    mindset?: string[];
    status?: string[];
    priority?: string[];
    startTime?: string[];
    startDate?: string[];
    endTime?: string[];
    endDate?: string[];
    deadline?: number[];
    durationHours?: number[];
    durationMinutes?: number[];
    // repeat?: boolean[];
    repeatUnit?: string[];
    repeatFrequency?: number[];
    repeatDurationHours?: number[];
    repeatDurationMinutes?: number[];
    repeatTimespan?: string[];
    repeatTimespanMultiplier?: number[];
    idealStart?: string[];
    preferredTimeOfDay?: string[][];
    preferredDayOfWeek?: string[][];
    endRepeat?: string[];
    totalDuration?: number[];
    totalRepetitions?: number[];
    endRepeatDate?: number[];
  };
  message?: string | null;
  success?: boolean;
};

const CreateTask = FormSchema.omit({ date: true });
const EditTask = FormSchema.omit({ date: true });

export const createTaskPrisma = async (prevState: State, formData: FormData) => {

  const validatedFields = CreateTask.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    type: formData.get('type'),
    mindset: formData.get('mindset'),
    status: formData.get('status'),
    priority: formData.get('priority'),
    startTime: formData.get('startTime'),
    startDate: formData.get('startDate'),
    endTime: formData.get('endTime'),
    endDate: formData.get('endDate'),
    durationHours: formData.get('durationHours'),
    durationMinutes: formData.get('durationMinutes'),
    deadline: formData.get('deadline'),
    // repeat: formData.get('repeat'),
    repeatFrequency: formData.get('repeatFrequency'),
    repeatTimespan: formData.get('repeatTimespan'),
    repeatTimespanMultiplier: formData.get('repeatTimespanMultiplier'),
    repeatDurationHours: formData.get('repeatDurationHours'),
    repeatDurationMinutes: formData.get('repeatDurationMinutes'),
    repeatUnit: formData.get('repeatUnit'),
    idealStart: formData.get('idealStart'),
    preferredTimeOfDay: formData.getAll('preferredTimeOfDay'),
    preferredDayOfWeek: formData.getAll('preferredDayOfWeek'),
    endRepeat: formData.get('endRepeat'),
    totalDuration: formData.get('totalDuration'),
    totalRepetitions: formData.get('totalRepetitions'),
    endRepeatDate: formData.get('endRepeatDate')
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    console.log('validatedFields', validatedFields, validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Task.',
      success: false,
    };
  }

  const { id, name, type, mindset, status, priority, startDate, startTime, endDate, endTime,
    durationHours, durationMinutes, idealStart,
    /* repeat, */ repeatTimespanMultiplier, repeatFrequency, repeatTimespan,
    repeatUnit, repeatDurationHours, repeatDurationMinutes,
    preferredTimeOfDay, preferredDayOfWeek,
    endRepeat, totalDuration, totalRepetitions, endRepeatDate, deadline,
  } = validatedFields.data;
  // Merge start date and time; Also end date and time
  const startDateTime = (startDate && startTime) ? new Date(`${startDate}T${startTime}:00`) :
    (startTime && !startDate) ? new Date(`00/00/00T${startTime}:00`) : null;
  const endDateTime = (endDate && endTime) ? new Date(`${endDate}T${endTime}:00`) : null;
  const duration = (durationHours || durationMinutes) ? (Number(durationMinutes) || 0) + (Number(durationHours) || 0) * 60 :
    (startDateTime && endDateTime) ? endDateTime.getTime() - startDateTime.getTime() : MIN_TASK_DURATION;
  const repeatDurationInMinutes = (repeatDurationHours || repeatDurationMinutes) ?
    (Number(repeatDurationMinutes) || 0) + (Number(repeatDurationHours) || 0) * 60 : null;
  const idealStartHHMM = idealStart?.length && idealStart?.split(':')[0].length ? `${idealStart?.split(':')[0]}:${idealStart?.split(':')[1]}` : null;

  // Calculate timeScore
  const mockTask = {
    duration: duration,
    repeat: (!!repeatFrequency && !!repeatTimespanMultiplier && !!repeatTimespan),
    deadline: endRepeatDate ? endRepeatDate : deadline,
    completion: 0,
    repeatUnit: repeatUnit || 'sessions',
    repeatFrequency: Number(repeatFrequency) || repeatDurationInMinutes,
    repeatTimespanMultiplier: (repeatFrequency && Number(repeatFrequency) > 1) ?  Number(repeatTimespanMultiplier) || 1 : 1,
    repeatTimespan: repeatTimespan,
    repetitionsDone: 0,
  } as Task;
  const timeScore = calculateTimeScore(mockTask);

  // Get mindset id from mindset name (input)
  const matchingMindset = await getMindsetByName(mindset);
  if (!matchingMindset) {
    //  Handle error - invalid mindset
    return { message: 'Invalid mindset selected.' };
  }
  // let mindsetId = '';
  // getMindsets().then(mindsets => {
  //   mindsetId = mindsets.filter(el => el.name === mindset)[0].id;
  // });

  try {
    const newTask = await prisma.task.create({
      data: {
        id: id,
        name: name,
        status: status || 'toDo',
        type: type as TaskType || 'task',
        mindsetId: matchingMindset.id,
        priority: priority,
        timeScore: timeScore,
        fixed: !!startDateTime && !!endDateTime,
        startTime: startDateTime,
        endTime: endDateTime,
        duration: duration,
        repeat: (!!repeatFrequency && !!repeatTimespanMultiplier && !!repeatTimespan),
        repeatUnit: repeatUnit || 'sessions',
        repeatTimespanMultiplier: (repeatFrequency && Number(repeatFrequency) >= 1) ?  Number(repeatTimespanMultiplier) || 1 : 1,
        repeatFrequency: Number(repeatFrequency) || repeatDurationInMinutes,
        repeatTimespan: repeatTimespan,
        idealStart: idealStartHHMM,
        preferredTimeOfDay: preferredTimeOfDay || [],
        preferredDayOfWeek: preferredDayOfWeek || [],
        endRepeat: Boolean(endRepeat),
        totalDuration: Number(totalDuration),
        totalRepetitions: Number(totalRepetitions),
        deadline: endRepeatDate ? endRepeatDate : deadline,
      },
    });

    try {
      await organiseTask(newTask as TaskWithRelations, [new Date(), addDays(new Date(), 7)]);
    } catch (error) {
      console.log('Failed to organise task ❌', error);
    }

    return {
      success: true, message: 'Successfully created task'
    }

  } catch (error) {
    console.log('Failed to create task ❌', error);
    return {
      success: false, message: 'Database Error: Failed to create task.',
    };
  }
}

export const editTaskPrisma = async (prevState: State, formData: FormData) => {

  const validatedFields = EditTask.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    type: formData.get('type'),
    mindset: formData.get('mindset'),
    status: formData.get('status'),
    priority: formData.get('priority'),
    startTime: formData.get('startTime'),
    startDate: formData.get('startDate'),
    endTime: formData.get('endTime'),
    endDate: formData.get('endDate'),
    durationHours: formData.get('durationHours'),
    durationMinutes: formData.get('durationMinutes'),
    deadline: formData.get('deadline'),
    // repeat: formData.get('repeat'),
    repeatFrequency: formData.get('repeatFrequency'),
    repeatTimespan: formData.get('repeatTimespan'),
    repeatTimespanMultiplier: formData.get('repeatTimespanMultiplier'),
    repeatDurationHours: formData.get('repeatDurationHours'),
    repeatDurationMinutes: formData.get('repeatDurationMinutes'),
    repeatUnit: formData.get('repeatUnit'),
    idealStart: formData.get('idealStart'),
    preferredTimeOfDay: formData.getAll('preferredTimeOfDay'),
    preferredDayOfWeek: formData.getAll('preferredDayOfWeek'),
    endRepeat: formData.get('endRepeat'),
    totalDuration: formData.get('totalDuration'),
    totalRepetitions: formData.get('totalRepetitions'),
    endRepeatDate: formData.get('endRepeatDate')
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    console.log('validatedFields', validatedFields, validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Task.',
      success: false,
    };
  }

  const { id, name, type, mindset, status, priority, startDate, startTime, endDate, endTime,
    durationHours, durationMinutes, idealStart,
    /* repeat, */ repeatTimespanMultiplier, repeatFrequency, repeatTimespan,
    repeatUnit, repeatDurationHours, repeatDurationMinutes,
    preferredTimeOfDay, preferredDayOfWeek,
    endRepeat, totalDuration, totalRepetitions, endRepeatDate, deadline,
  } = validatedFields.data;
  // Merge start date and time; Also end date and time
  const startDateTime = (startDate && startTime) ? new Date(`${startDate}T${startTime}:00`) :
    (startTime && !startDate) ? new Date(`00/00/00T${startTime}:00`) : null;
  const endDateTime = (endDate && endTime) ? new Date(`${endDate}T${endTime}:00`) : null;
  const durationInMinutes = (durationHours || durationMinutes) ? (Number(durationMinutes) || 0) + (Number(durationHours) || 0) * 60 :
    (startDateTime && endDateTime) ? endDateTime.getTime() - startDateTime.getTime() : null;
  const repeatDurationInMinutes = (repeatDurationHours || repeatDurationMinutes) ?
    (Number(repeatDurationMinutes) || 0) + (Number(repeatDurationHours) || 0) * 60 : null;
  const idealStartHHMM = idealStart?.length && idealStart?.split(':')[0].length ? `${idealStart?.split(':')[0]}:${idealStart?.split(':')[1]}` : null;

  const matchingMindset = await getMindsets().then(mindsets =>
    mindsets.find(el => el.name === mindset)
  );
  if (!matchingMindset) {
    //  Handle error - invalid mindset
    return { message: 'Invalid mindset selected.', success: false };
  }

  // Calculate timeScore
  const mockTask = {
    duration: durationInMinutes,
    repeat: (!!repeatFrequency && !!repeatTimespanMultiplier && !!repeatTimespan),
    deadline: endRepeatDate ? endRepeatDate : deadline,
    completion: 0,
    repeatUnit: repeatUnit || 'sessions',
    repeatFrequency: Number(repeatFrequency) || repeatDurationInMinutes,
    repeatTimespanMultiplier: (repeatFrequency && Number(repeatFrequency) > 1) ?  Number(repeatTimespanMultiplier) || 1 : 1,
    repeatTimespan: repeatTimespan,
    repetitionsDone: 0,
  } as Task;
  const timeScore = calculateTimeScore(mockTask);

  try {
    const newTask = await prisma.task.update({
      where: {
        id: id
      },
      data: {
        name: name,
        type: type as TaskType || 'task',
        status: status || 'toDo',
        // mindsetId: matchingMindset.id,
        mindset: { connect: { id: matchingMindset.id }},
        priority: priority,
        timeScore: timeScore,
        fixed: !!startDateTime && !!endDateTime,
        startTime: startDateTime,
        endTime: endDateTime,
        duration: durationInMinutes || MIN_TASK_DURATION,
        repeat: (!!repeatFrequency && !!repeatTimespan),
        repeatUnit: repeatUnit || 'sessions',
        repeatTimespanMultiplier: (repeatFrequency && Number(repeatFrequency) >= 1) ?  Number(repeatTimespanMultiplier) || 1 : 1,
        repeatFrequency: Number(repeatFrequency) || repeatDurationInMinutes,
        repeatTimespan: repeatTimespan,
        idealStart: idealStartHHMM,
        preferredTimeOfDay: preferredTimeOfDay || [],
        preferredDayOfWeek: preferredDayOfWeek || [],
        endRepeat: !!totalDuration || !!totalRepetitions || !!endRepeatDate,
        totalDuration: Number(totalDuration),
        totalRepetitions: Number(totalRepetitions),
        deadline: deadline !== null ? deadline : endRepeatDate,
      },
    });

    try {
      await organiseTask(newTask as TaskWithRelations, [new Date(), addDays(new Date(), 7)]);
    } catch (error) {
      console.log('Failed to organise task ❌', error);
    }

    return {
      success: true,
      message: 'Successfully edited task'
    }

  } catch (error) {
    console.log('Failed to edit task ❌', error);
    return {
      message: 'Database Error: Failed to edit task.',
      success: false,
    };
  }



  revalidatePath('/');
  if (typeof window !== "undefined") {
    window.history.back();
  }
  
}

export const deleteTask = async (id: string) => {
  try {
    await sql`DELETE FROM tasks WHERE id = ${id}`;
  } catch (error) {
    return {
      message: 'Database Error: Failed to delete task.',
    };
  }

  revalidatePath('/');
  // redirect('/');
}

export const deleteTaskPrisma = async (id: string) => {

  const taskEvents = await prisma.event.findMany({
    where: {
      taskId: id
    }
  });

  // Delete related events first
  if (taskEvents.length > 0) {
    try {
      await prisma.event.deleteMany({
        where: {
          taskId: id
        },
      });
    } catch (error) {
      return {
        message: 'Database Error: Failed to delete events related to task.'
      }
    }
  }

  try {
    await prisma.task.delete({
      where: {
        id: id,
      },
    });
  } catch (error) {
    return {
      message: 'Database Error: Failed to delete task.'
    }
  }

  revalidatePath('/');
}

export const updateTaskField = async (entryId: string, field: keyof Task, value: any) => {
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
  } catch (error) {
      console.error('Failed to find and update task with id:', entryId, error);
      // throw new Error('Failed to fetch the latest tasks.');
      process.exit(1);
  }
}

export const updatePriorityScores = async () => {
  const tasks = await getTasks();
  const mindsets = await getMindsets();
  const updatedTasks = calculatePriorityScores(tasks, mindsets);
  updatedTasks.forEach((task) => {
    updateTaskField(task.id, 'priorityScore', task.priorityScore);
  })

  revalidatePath('/');
}

export const updateTimeScores = async () => {
  const tasks = await getTasks();
  tasks.forEach((task) => {
    const timeScore = calculateTimeScore(task);
    updateTaskField(task.id, 'timeScore', timeScore);
  })

  revalidatePath('/');
}

export const updateTaskNotes = async (notes: string, taskId: string) => {
  try {
    const updateTaskNotes = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        notes: notes
      }
    });
  } catch (error) {
    console.log('Failed to update task notes for task:', taskId);
  }
}


// EVENTS

export const createEventPrisma = async (event: Event) => {
  try {
    await prisma.event.create({
      data: {
        ...event,
        startTime: event.startTime
      },
    });
  } catch (error) {
    console.log('Failed to create event ❌', error);
    return {
      message: 'Database Error: Failed to create event.',
    };
  }

}

export const scheduleEventForTask = async (
  task: Task, startTimeProp: Date, duration?: number, localTime?: string
) => {

  const startTime = new Date(startTimeProp);
  const endTime = new Date(startTime.getTime() + (duration || task.duration) * 60 * 1000);

  const eventToSchedule: Event = {
    id: uuidv4(),
    name: task.name,
    status: task.status,
    fixed: task.fixed,
    taskId: task.id,
    startTime: startTime,
    endTime: endTime,
    localTime: localTime || null,
    // duration: task.duration,
    userStartTime: null,
    userEndTime: null,
    notes: null,
    createdAt: new Date()
  }

  await createEventPrisma(eventToSchedule);

  return eventToSchedule as Event;
}

export const updateEventField = async (
  eventId: string, field: keyof Event, value: any
) => {
  try {
    await prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        [field]: value,
      }
    });
  } catch (error) {
    console.log(`Failed to update event ${field} with value ${value}`, error);
    return {
      message: `Database Error: Failed to update event ${field} with value ${value}`,
    };
  }
}

export const deleteAllEvents = async () => {
  try {
    await prisma.event.deleteMany();
  } catch (error) {
    console.log(`Failed to delete all events`, error);
    return {
      message: `Database Error: Failed to delete all events`,
    };
  }
}

export const deleteEventsById = async (eventIds: string[]) => {
  try {
    await prisma.event.deleteMany({
      where: {
        id: { in: eventIds }
      }
    });
  } catch (error) {
    console.log('Failed to delete events by id', error);
    return {
      message: `Database Error: Failed to delete events by id`,
    };
  }
}

export const deleteEventsInTimespan = async (timespan: [Date, Date]) => {
  const eventIdsInTimespan = await findEventIdsInTimespan(timespan[0], timespan[1]);
  try {
    await prisma.event.deleteMany({
      where: {
        id: { in: eventIdsInTimespan?.map(el => el.id) }
      }
    });
  } catch (error) {
    console.error('Failed to delete events in timespan:', error);
  }
}

export const deleteFlexEventsInTimespan = async (timespan: [Date, Date]) => {
  const eventIdsInTimespan = await findEventIdsInTimespan(timespan[0], timespan[1]);
  try {
    await prisma.event.deleteMany({
      where: {
        id: { in: eventIdsInTimespan?.map(el => el.id) },
        fixed: false,
      }
    });
  } catch (error) {
    console.error('Failed to delete events in timespan:', error);
  }
}

export const deleteEventsOfTask = async (taskId: string, timespan?: [Date, Date]) => {
  try {
    await prisma.event.deleteMany({
      where: {
        taskId: taskId,
        startTime: timespan && { gte: timespan[0], lt: timespan[1] },
        endTime: timespan && { gte: timespan[0] },
      },
    });
  } catch (error) {
    console.error('Failed to delete events by task id and timespan:', error);
    // throw new Error('Database error: Failed to delete events by task id, from a timespan');
  }
}


// MINDSETS

export const getMindsetProximity = async (mindset1: string, mindset2: string) => {
  try {
    const mindsets = await prisma.mindset.findMany();
    const mindsetMaslowLevels = [mindset1, mindset2].map((mindset) => {
      return mindsets.filter(el => el.name === mindset)[0].maslowLevel;
    });
    return (
      mindsetMaslowLevels.includes(0) ? 0 :
        Math.abs(mindsetMaslowLevels[0] - mindsetMaslowLevels[1])
    );
  } catch (error) {
    console.error('Error getting mindset proximity. Check mindset names');
    return {
      message: 'Error getting mindset proximity. Check mindset names',
    };
  }
}



// TIMESPAN

export const getIntersectingTimespans = async (givenTimespan?: [Date, Date]) => {
  try {
    if(!givenTimespan) givenTimespan = [ new Date(), new Date()];
    const timespans = await prisma.timespan.findMany({
      where: {
        type: 'organised',
        OR: [
          {
            startTime: { gte: givenTimespan[0], lte: givenTimespan[1] },
          },
          {
            endTime: { gte: givenTimespan[0], lte: givenTimespan[1] },
          },
          {
            startTime: { lte: givenTimespan[0] },
            endTime: { gte: givenTimespan[1] },
          }
        ],
      },
      orderBy: {
        endTime: 'desc',
      }
    });
    return timespans;
  } catch (error) {
    console.error('Error fetching intersecting timespans.');
    // throw new Error('Database error: Failed to fetch intersecting timespans.');
  }
}

export const createTimespan = async (timespan: [Date, Date], type: TimespanType) => {
  try {
    await prisma.timespan.create({
      data: {
        startTime: timespan[0],
        endTime: timespan[1],
        type: type,
      }
    })
  } catch (error) {
    console.error('Error creating timespan.');
    // throw new Error('Database error: Failed to create timespans.');
  }
}

export const updateTimespan = async (id: string, timespan: [Date, Date]) => {
  try {
    await prisma.timespan.update({
      where: {
        id: id,
      },
      data: {
        startTime: timespan[0],
        endTime: timespan[1],
      },
    })
  } catch (error) {
    console.error('Error updating organised timespans.');
    // throw new Error('Database error: Failed to update organised timespans.');
  }
}
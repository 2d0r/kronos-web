'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import prisma from './db';
import { Event, RepeatUnit, Task } from '@prisma/client';
import { DEFAULT_MINDSET_LIST, MIN_TASK_DURATION, repeatUnitList } from './definitions';
import { fetchTasksPrisma, updateTaskField } from './data';
import { calculatePriorityScores } from './priorityScore';
import { calculateTimeScore } from './time-score';
import { v4 as uuidv4 } from 'uuid';

const FormSchema = z.object({
  id: z.string(),
  name: z.string(),
  mindset: z.enum(DEFAULT_MINDSET_LIST, { invalid_type_error: 'Please select a valid mindset.' }),
  status: z.enum(['toDo', 'inProgress', 'done'], { invalid_type_error: 'Please select a valid status.' }),
  priority: z.enum(['veryHigh', 'high', 'medium', 'low'], { invalid_type_error: 'Please select a valid priority.' }),
  startTime: z.string().nullable(),
  startDate: z.string().nullable(),
  endTime: z.string().nullable(),
  endDate: z.string().nullable(),
  idealStartTime: z.string().nullable(),
  // duration: z.array(z.number()).nullish(),
  durationHours: z.string().nullable(),
  durationMinutes: z.string().nullable(),
  repeat: z.coerce.boolean(),
  repeatUnit: z.enum(['sessions', 'minutes'], { invalid_type_error: 'Please select a valid Repeat Unit.' }).nullable(),
  repeatFrequency: z.string().nullable(),
  repeatTimespan: z.enum(['day', 'week', 'month', 'year'], { invalid_type_error: 'Please select a valid Repeat Timespan.' }).nullable(),
  repeatTimespanMultiplier: z.string().nullable(),
  repeatDurationHours: z.string().nullable(),
  repeatDurationMinutes: z.string().nullable(),
  preferredTimeOfDay: z.array(z.enum(['morning', 'noon', 'afternoon', 'evening', 'night'], { invalid_type_error: 'Please select a valid time of day.' })).nullish(), // z.array(z.string().refine(value => timeOfDayList.includes(value))), // 
  preferredDayOfWeek: z.array(z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], { invalid_type_error: 'Please select a valid day of the week.' })).nullish(),
  endRepeat: z.string().nullable(),
  totalDuration: z.number().nullable(),
  totalRepetitions: z.number().nullable(),
  endRepeatDate: z.string().nullable()

});

const CreateTask = FormSchema.omit({ id: true, date: true });

export type State = {
  errors?: {
    name?: string[];
    mindset?: string[];
    status?: string[];
    priority?: string[];
    startTime?: string[];
    startDate?: string[];
    endTime?: string[];
    endDate?: string[];
    idealStartTime?: string[];
    durationHours?: number[];
    durationMinutes?: number[];
    repeat?: boolean[];
    repeatUnit?: string[];
    repeatFrequency?: number[];
    repeatDurationHours?: number[];
    repeatDurationMinutes?: number[];
    repeatTimespan?: string[];
    repeatTimespanMultiplier?: number[];
    preferredTimeOfDay?: string[][];
    preferredDayOfWeek?: string[][];
    endRepeat?: string[];
    totalDuration?: number[];
    totalRepetitions?: number[];
    endRepeatDate?: number[];

  };
  message?: string | null;
};

export async function createTaskPrisma(prevState: State, formData: FormData) {

  const validatedFields = CreateTask.safeParse({
    name: formData.get('name'),
    mindset: formData.get('mindset'),
    status: formData.get('status'),
    priority: formData.get('priority'),
    startTime: formData.get('startTime'),
    startDate: formData.get('startDate'),
    endTime: formData.get('endTime'),
    endDate: formData.get('endDate'),
    idealStartTime: formData.get('idealStartTime'),
    durationHours: formData.get('durationHours'),
    durationMinutes: formData.get('durationMinutes'),
    repeat: formData.get('repeat'),
    repeatFrequency: formData.get('repeatFrequency'),
    repeatTimespan: formData.get('repeatTimespan'),
    repeatTimespanMultiplier: formData.get('repeatTimespanMultiplier'),
    repeatDurationHours: formData.get('repeatDurationHours'),
    repeatDurationMinutes: formData.get('repeatDurationMinutes'),
    repeatUnit: formData.get('repeatUnit'),
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
    };
  }

  const { name, mindset, status, priority, startDate, startTime, endDate, endTime,
    durationHours, durationMinutes, idealStartTime,
    repeat, repeatTimespanMultiplier, repeatFrequency, repeatTimespan,
    repeatUnit, repeatDurationHours, repeatDurationMinutes,
    preferredTimeOfDay, preferredDayOfWeek,
    endRepeat, totalDuration, totalRepetitions, endRepeatDate
  } = validatedFields.data;
  // Merge start date and time; Also end date and time
  const startDateTime = (startDate && startTime) ? new Date(`${startDate}T${startTime}:00`) :
    (startTime && !startDate) ? new Date(`00/00/00T${startTime}:00`) : null;
  const endDateTime = (endDate && endTime) ? new Date(`${endDate}T${endTime}:00`) : null;
  const durationInMinutes = (durationHours || durationMinutes) ? (Number(durationMinutes) || 0) + (Number(durationHours) || 0) * 60 :
    (startDateTime && endDateTime) ? endDateTime.getTime() - startDateTime.getTime() : null;
  const repeatDurationInMinutes = (repeatDurationHours || repeatDurationMinutes) ?
    (Number(repeatDurationMinutes) || 0) + (Number(repeatDurationHours) || 0) * 60 : null;

  const matchingMindset = await fetchMindsets().then(mindsets =>
    mindsets.find(el => el.name === mindset)
  );
  if (!matchingMindset) {
    //  Handle error - invalid mindset
    return { message: 'Invalid mindset selected.' };
  }
  // let mindsetId = '';
  // fetchMindsets().then(mindsets => {
  //   mindsetId = mindsets.filter(el => el.name === mindset)[0].id;
  // });

  try {
    await prisma.task.create({
      data: {
        name: name,
        status: status,
        mindsetId: matchingMindset.id,
        priority: priority,
        startTime: startDateTime,
        endTime: endDateTime,
        duration: durationInMinutes || MIN_TASK_DURATION,
        repeat: repeat,
        repeatUnit: repeatUnit || 'sessions',
        repeatTimespanMultiplier: Number(repeatTimespanMultiplier) || 1,
        repeatFrequency: Number(repeatFrequency) || repeatDurationInMinutes,
        repeatTimespan: repeatTimespan,
        preferredTimeOfDay: preferredTimeOfDay || [],
        preferredDayOfWeek: preferredDayOfWeek || [],
        endRepeat: Boolean(endRepeat),
        totalDuration: totalDuration,
        totalRepetitions: totalRepetitions,
        endRepeatDate: endRepeatDate
      },
    });
  } catch (error) {
    console.log('Failed to create task', error);
    return {
      message: 'Database Error: Failed to create task.',
    };
  }

  revalidatePath('/');
  redirect('/');
}

export async function deleteTask(id: string) {
  try {
    await sql`DELETE FROM tasks WHERE id = ${id}`;
  } catch (error) {
    return {
      message: 'Database Error: Failed to delete task.',
    };
  }

  revalidatePath('/');
  redirect('/');
}

export async function deleteTaskPrisma(id: string) {

  // Delete related events first
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
  redirect('/');
}

export async function createEventPrisma(event: Event) {
  try {
    await prisma.event.create({
      data: {
        ...event
      },
    });
  } catch (error) {
    console.log('Failed to create event', error);
    return {
      message: 'Database Error: Failed to create event.',
    };
  }

}

export async function fetchMindsets() {
  try {
    const mindsets = await prisma.mindset.findMany();
    return mindsets;
  } catch (error) {
    console.log('Failed to fetch mindset list', error);
    return [];
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

export async function updatePriorityScores() {
  const tasks = await fetchTasksPrisma();
  const mindsets = await fetchMindsets();
  const updatedTasks = calculatePriorityScores(tasks, mindsets);
  updatedTasks.forEach((task) => {
    updateTaskField(task.id, 'priorityScore', task.priorityScore);
  })

  revalidatePath('/');
}

export async function updateTimeScores() {
  const tasks = await fetchTasksPrisma();
  tasks.forEach((task) => {
    const timeScore = calculateTimeScore(task);
    updateTaskField(task.id, 'timeScore', timeScore);
  })

  revalidatePath('/');
}

export async function getMindsetProximity(mindset1: string, mindset2: string) {
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

export async function scheduleEventForTask(task: Task, startTime: Date, duration?: number) {

  const endTime = new Date(startTime.getTime() + (duration || task.duration) * 60 * 1000);

  const eventToSchedule: Event = {
    id: uuidv4(),
    name: task.name,
    status: task.status,
    fixed: task.fixed,
    taskId: task.id,
    startTime: startTime,
    endTime: endTime,
    userStartTime: null,
    userEndTime: null,
    notes: null,
    createdAt: new Date()
  }

  createEventPrisma(eventToSchedule);

  return eventToSchedule as Event;
}
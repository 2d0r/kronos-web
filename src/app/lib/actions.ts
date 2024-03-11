'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { fromZodError } from 'zod-validation-error';
import prisma from './db';

const FormSchema = z.object({
    id: z.string(),
    name: z.string(),
    mindset: z.enum(['survive', 'maintain', 'socialise', 'play', 'learn', 'create', 'selfCare', 'selfChallenge'], { invalid_type_error: 'Please select a valid mindset.' }),
    status: z.enum(['toDo', 'inProgress', 'done'], { invalid_type_error: 'Please select a valid status.' }),
    priority: z.enum(['veryHigh', 'high', 'medium', 'low'], { invalid_type_error: 'Please select a valid priority.' }),
    startTime: z.string().nullable(),
    startDate: z.string().nullable(),
    endTime: z.string().nullable(),
    endDate: z.string().nullable(),
    duration: z.number().nullable(),
    repeat: z.coerce.boolean(),
    repeatFrequency: z.number().nullable(),
    repeatTimespan: z.enum(['day', 'week', 'month', 'year'], {invalid_type_error: 'Please select a valid Repeat Timespan.'}).nullable(),
    repeatTimespanMultiplier: z.number().nullable(),
    preferredTimeOfDay: z.array(z.enum(['morning', 'noon', 'afternoon', 'evening', 'night'], {invalid_type_error: 'Please select a valid time of day.'})).nullish(),
    preferredDayOfWeek: z.array(z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], {invalid_type_error: 'Please select a valid day of the week.'})).nullish(),
    endRepeat: z.coerce.boolean(),
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
        duration?: number[];
        repeat?: boolean[];
        repeatFrequency?: number[];
        repeatTimespan?: string[];
        repeatTimespanMultiplier?: number[];
        preferredTimeOfDay?: string[];
        preferredDayOfWeek?: string[];
        endRepeat?: string[];
        totalDuration?: number[];
        totalRepetitions?: number[];
        endRepeatDate?: number[];

    };
    message?: string | null;
};

export async function createTask(prevState: State, formData: FormData) {
  const validatedFields = CreateTask.safeParse({
      name: formData.get('name'),
      mindset: formData.get('mindset'),
      status: formData.get('status'),
      priority: formData.get('priority'),
      startTime: formData.get('startTime'),
      startDate: formData.get('startDate'),
      endTime: formData.get('endTime'),
      endDate: formData.get('endDate'),
      duration: formData.get('duration'),
      repeat: formData.get('repeat'),
      repeatFrequency: formData.get('repeatFrequency'),
      repeatTimespan: formData.get('repeatTimespan'),
      repeatTimespanMultiplier: formData.get('repeatTimespanMultiplier'),
      preferredTimeOfDay: formData.get('preferredTimeOfDay'),
      preferredDayOfWeek: formData.get('preferredDayOfWeek'),
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

    const { name, mindset, status, priority, startDate, startTime, endDate, endTime, duration, 
      repeat, repeatTimespanMultiplier, repeatFrequency, repeatTimespan, preferredTimeOfDay, preferredDayOfWeek, 
      endRepeat, totalDuration, totalRepetitions, endRepeatDate
    } = validatedFields.data;
    // Merge start date and time; Also end date and time
    const sqlStartTime = new Date(`${startDate || '2024-01-01'}T${startTime || '00:00'}:00`);
    const sqlEndTime = new Date(`${endDate || '2024-01-01'}T${endTime || '00:00'}:00`);


    try {
      await prisma.task.create({
        data: {
          name: name,
          status: status,
          mindset: mindset,
          priority: priority,
          startTime: sqlStartTime,
          endTime: sqlEndTime,
          duration: duration,
          repeat: repeat,
          repeatTimespanMultiplier: repeatTimespanMultiplier,
          repeatFrequency: repeatFrequency,
          repeatTimespan: repeatTimespan,
          preferredTimeOfDay: preferredTimeOfDay || [],
          preferredDayOfWeek: preferredDayOfWeek || [],
          endRepeat: endRepeat,
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

  try {
      await prisma.task.delete({
          where: {
              id: id,
          },
      });
      await prisma.$disconnect();
  } catch (error) {
      console.error('Database Error:', error);
      // throw new Error('Failed to fetch the latest tasks.');
      await prisma.$disconnect();
      process.exit(1);
  }

  revalidatePath('/');
  redirect('/');
}
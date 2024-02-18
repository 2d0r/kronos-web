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
    mindset: z.enum(['create', 'maintain', 'survive', 'learn', 'play', 'socialise', 'selfCare', 'relaxReward', 'selfChallenge'], { invalid_type_error: 'Please select a mindset.' }),
    status: z.enum(['toDo', 'inProgress', 'done'], { invalid_type_error: 'Please select a task status.' }),
  });

const CreateTask = FormSchema.omit({ id: true, date: true });

export type State = {
    errors?: {
        name?: string[];
        mindset?: string[];
        status?: string[];
    };
    message?: string | null;
};

export async function createTask(prevState: State, formData: FormData) {
  const validatedFields = CreateTask.safeParse({
      name: formData.get('name'),
      mindset: formData.get('mindset'),
      status: formData.get('status'),
    });

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
      console.log('validatedFields', validatedFields);
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Create Task.',
      };
    }

    const { name, mindset, status } = validatedFields.data;
    const mindsetEntry = await prisma.mindset.findUnique({
      where: {
        name: mindset
      },
      select: {
        id: true
      }
    });

    if (mindsetEntry) {
      const mindsetId = mindsetEntry.id;
      await prisma.task.create({
        data: {
          name: name,
          status: status,
          mindsetId: mindsetId,
          priority: 'high'
        },
      });
    } else {
      console.log('Mindset not found.');
    }

    // const validationError = fromZodError(err);
    // // the error is now readable by the user
    // // you may print it to console
    // console.log(validationError.toString());
    // // or return it as an actual error
    // return validationError;

    

    try {
      
      // await sql`
      //   UPDATE tasks
      //   INSERT INTO tasks (name, status, mindset, date)
      //   VALUES (${name}, ${status}, ${mindset}, ${date})
      // `;  
    } catch (error) {
      return {
        message: 'Database Error: Failed to create task.',
      };
    }
      
    revalidatePath('/');
    redirect('/');
}

export async function deleteTask(id: string, formData: FormData) {
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

export async function deleteTaskPrisma(id: string, fromData: FormData) {

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
'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { fromZodError } from 'zod-validation-error';

const FormSchema = z.object({
    id: z.string(),
    name: z.string(),
    mindset: z.enum(['solve', 'create', 'maintain', 'survive', 'learn', 'play', 'socialise', 'self-care', 'relax'], { invalid_type_error: 'Please select a mindset.' }),
    status: z.enum(['to do', 'in progress', 'done'], { invalid_type_error: 'Please select a task status.' }),
    date: z.date(),
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
    try {
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
      const date = new Date().toISOString().split('T')[0];

      await sql`
          INSERT INTO tasks (name, status, mindset, date)
          VALUES (${name}, ${status}, ${mindset}, ${date})
        `;
        
    } catch (err : any) {
      const validationError = fromZodError(err);
      // the error is now readable by the user
      // you may print it to console
      console.log(validationError.toString());
      // or return it as an actual error
      return validationError;
    }

    // try {
        
    //   } catch (error) {
    //     return {
    //       message: 'Database Error: Failed to create invoice.',
    //     };
    //   }
      
    revalidatePath('/');
    redirect('/');
};

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
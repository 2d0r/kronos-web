'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
    id: z.string(),
    taskId: z.string({
        invalid_type_error: 'Please select a task.',
    }),
    taskTitle: z.string(),
    mindset: z.enum(['solve', 'create', 'maintain', 'survive', 'learn', 'play', 'socialise', 'self-care', 'relax'], { invalid_type_error: 'Please select a mindset.' }),
    status: z.enum(['to do', 'in progress', 'done'], { invalid_type_error: 'Please select a task status.' }),
  });

const CreateTask = FormSchema.omit({ id: true });

export type State = {
    errors?: {
        taskId?: string[];
        taskTitle?: string[];
        mindset?: string[];
        status?: string[];
    };
    message?: string | null;
};

export async function createTask(prevState: State, formData: FormData) {
    const validatedFields = CreateTask.safeParse({
        taskId: formData.get('taskId'),
        taskTitle: formData.get('taskTitle'),
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

    const { taskId, taskTitle, mindset, status } = validatedFields.data;

    try {
        await sql`
          INSERT INTO invoices (customer_id, amount, status, date)
          VALUES (${taskId}, ${taskTitle}, ${status}, ${mindset})
        `;
      } catch (error) {
        return {
          message: 'Database Error: Failed to create invoice.',
        };
      }
      
      revalidatePath('/dashboard/invoices');
      redirect('/dashboard/invoices');
};
'use server';

import { z } from 'zod';
import { MINDSETS } from './definitions';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const TaskSchema = z.object({
    id: z.string(),
    taskId: z.string({
        invalid_type_error: 'Please select a task.',
    }),
    taskName: z.string(),
    mindset: z.string(), // z.enum(MINDSETS, { invalid_type_error: 'Please select a mindset.' }),
    status: z.enum(['To do', 'In Progress', 'Done'], { invalid_type_error: 'Please select a task status.' }),
  });

const CreateTask = TaskSchema.omit({ id: true });

export type State = {
    errors?: {
        taskId?: string[];
        taskName?: string[];
        mindset?: string[];
        status?: string[];
    };
    message?: string | null;
};

export async function createTask(prevState: State, formData: FormData) {
    const validatedFields = CreateTask.safeParse({
        taskId: formData.get('taskId'),
        taskName: formData.get('taskName'),
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

    const { taskId, taskName, mindset, status } = validatedFields.data;

    // try {
    //     await sql`
    //       INSERT INTO invoices (customer_id, amount, status, date)
    //       VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    //     `;
    //   } catch (error) {
    //     return {
    //       message: 'Database Error: Failed to create invoice.',
    //     };
    //   }
      
      revalidatePath('/dashboard/invoices');
      redirect('/dashboard/invoices');
};
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useFormState } from 'react-dom';
import { createTask } from '@/app/lib/actions';
import Link from 'next/link';
import { Button } from '@/app/ui/button';

export default function CreateForm() {
    const initialState = { message: null, errors: {} };
    const createTaskHere : any = createTask;
    const [state, dispatch] = useFormState(createTaskHere, initialState);
    const mindsets = ['solve', 'create'];
    const statuses = ['to do', 'in progress', 'done'];

    return (<>
        <form action={dispatch}>
            <div className='rounded-md bg-gray-50 p-4 md:p-6'>
                {/* Task Title */}
                <div className='mb-4'>
                    <label htmlFor='name' className='mb-2 block text-sm font-medium'>
                        Name
                    </label>
                    <div className='relative'>
                    <input
                        id='name'
                        name='name'
                        type='string'
                        className='peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500'
                        placeholder='Enter task name'
                        aria-describedby='task-error'
                    />
                    </div>
                    <div id='task-error' aria-live='polite' aria-atomic='true'>
                    {/* {state.errors?.customerId &&
                        state.errors.customerId.map((error: string) => (
                        <p className='mt-2 text-sm text-red-500' key={error}>
                            {error}
                        </p>
                    ))} */}
                    </div>
                </div>
                
                {/* Mindset */}
                <div className='mb-4'>
                    <label htmlFor='mindset' className='mb-2 block text-sm font-medium'>
                        Mindset
                    </label>
                    <div className='relative'>
                    <select
                        id='mindset'
                        name='mindset'
                        className='peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500'
                        defaultValue=''
                        aria-describedby='task-error'
                    >
                        <option value='' disabled>
                        Select a mindset
                        </option>
                        {mindsets.map((mindset, idx) => (
                            <option key={idx} value={mindset}>
                                {mindset}
                            </option>
                        ))}
                    </select>
                    </div>
                    <div id='task-error' aria-live='polite' aria-atomic='true'>
                    {/* {state.errors?.customerId &&
                        state.errors.customerId.map((error: string) => (
                        <p className='mt-2 text-sm text-red-500' key={error}>
                            {error}
                        </p>
                    ))} */}
                    </div>
                </div>

                {/* Status */}
                <div className='mb-4'>
                    <label htmlFor='status' className='mb-2 block text-sm font-medium'>
                        Status
                    </label>
                    <div className='relative'>
                    <select
                        id='status'
                        name='status'
                        className='peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500'
                        defaultValue=''
                        aria-describedby='task-error'
                    >
                        <option value='' disabled>
                        Select a status
                        </option>
                        {statuses.map((status, idx) => (
                            <option key={idx} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                    </div>
                    <div id='task-error' aria-live='polite' aria-atomic='true'>
                    {/* {state.errors?.customerId &&
                        state.errors.customerId.map((error: string) => (
                        <p className='mt-2 text-sm text-red-500' key={error}>
                            {error}
                        </p>
                    ))} */}
                    </div>
                </div>
            </div>
            <div className='mt-6 flex justify-end gap-4'>
                {/* <Link
                    href='/'
                    className='flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200'
                >
                    Cancel
                </Link> */}
                <Button type='submit'>Create Task</Button>
            </div>
        </form>
    </>);
}
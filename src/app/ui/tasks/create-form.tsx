"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MindsetField } from "@/app/lib/definitions";
import { StatusField } from "@/app/lib/definitions";
import { useFormState } from "react-dom";
import { createTask } from "@/app/lib/actions";
import Link from 'next/link';
import { Button } from '@/app/ui/button';

export default function CreateForm(
    { mindsets } : { mindsets: String[] },
    { statuses } : { statuses: String[] }
) {
    // const initialState = { message: null, errors: {} };
    // const [state, dispatch] = useFormState(createTask, initialState);

    // const router = useRouter();

    // const [title, setTitle] = useState('');
    // const [priority, setPriority] = useState('medium');
    // const [isLoading, setIsLoading] = useState(false);

    return (<>
        {/* <form className='w-1/2'>
            <label>
                <span>Title:</span>
                <input
                    required
                    type='text'
                    onChange={(e) => setTitle(e.target.value)}
                />
            </label>
        </form> */}

        <form>
            <div className="rounded-md bg-gray-50 p-4 md:p-6">
                {/* Task Title */}
                <div className="mb-4">
                    <label htmlFor="customer" className="mb-2 block text-sm font-medium">
                        Title
                    </label>
                    <div className="relative">
                    <input
                        id="title"
                        name="title"
                        type="string"
                        className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                        placeholder="Enter task title"
                        aria-describedby="task-error"
                    >
                        <option value="" disabled>
                        Select a customer
                        </option>
                        {mindsets.map((mindset, idx) => (
                        <option key={idx} value={idx}>
                            {mindset}
                        </option>
                        ))}
                    </input>
                    </div>
                    <div id="task-error" aria-live="polite" aria-atomic="true">
                    {/* {state.errors?.customerId &&
                        state.errors.customerId.map((error: string) => (
                        <p className="mt-2 text-sm text-red-500" key={error}>
                            {error}
                        </p>
                    ))} */}
                    </div>
                </div>
                
                {/* Mindset */}
                <div className="mb-4">
                    <label htmlFor="customer" className="mb-2 block text-sm font-medium">
                        Mindset
                    </label>
                    <div className="relative">
                    <select
                        id="mindset"
                        name="mindset"
                        className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                        defaultValue=""
                        aria-describedby="task-error"
                    >
                        <option value="" disabled>
                        Select a mindset
                        </option>
                        {mindsets.map((mindset, idx) => (
                        <option key={idx} value={idx}>
                            {mindset}
                        </option>
                        ))}
                    </select>
                    </div>
                    <div id="task-error" aria-live="polite" aria-atomic="true">
                    {/* {state.errors?.customerId &&
                        state.errors.customerId.map((error: string) => (
                        <p className="mt-2 text-sm text-red-500" key={error}>
                            {error}
                        </p>
                    ))} */}
                    </div>
                </div>

                {/* Status */}
                <div className="mb-4">
                    <label htmlFor="customer" className="mb-2 block text-sm font-medium">
                        Status
                    </label>
                    <div className="relative">
                    <select
                        id="status"
                        name="status"
                        className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                        defaultValue=""
                        aria-describedby="task-error"
                    >
                        <option value="" disabled>
                        Select a status
                        </option>
                        {statuses.map((status, idx) => (
                        <option key={idx} value={idx}>
                            {status}
                        </option>
                        ))}
                    </select>
                    </div>
                    <div id="task-error" aria-live="polite" aria-atomic="true">
                    {/* {state.errors?.customerId &&
                        state.errors.customerId.map((error: string) => (
                        <p className="mt-2 text-sm text-red-500" key={error}>
                            {error}
                        </p>
                    ))} */}
                    </div>
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-4">
                <Link
                    href="/"
                    className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                >
                    Cancel
                </Link>
                <Button type="submit">Create Task</Button>
            </div>
        </form>
    </>);
}
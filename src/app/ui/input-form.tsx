'use client';

import { useFormState } from 'react-dom';
import { MindsetField } from '@/app/lib/definitions';
import Link from 'next/link';
import { createTask } from '@/app/lib/actions';

export default function InputForm(
    { mindsets }: { mindsets: MindsetField[] }
    ) {
    const initialState = { message: null, errors: {} };
    const [state, dispatch] = useFormState(createTask, initialState);

    return (
        <form action={dispatch}>
            <div className="rounded-md bg-gray-50 p-4 md:p-6">
                {/* Task Name */}
                <div className="mb-4">
                    <label htmlFor="name" className="mb-2 block text-sm font-medium">
                        Task name
                    </label>
                    <div className="relative mt-2 rounded-md">
                        <div className="relative">
                        <input
                            id="name"
                            name="name"
                            type="string"
                            step="0.01"
                            placeholder="Task name"
                            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                            aria-describedby="task-error"
                        />
                        </div>
                    </div>
                    <div id="task-error" aria-live="polite" aria-atomic="true">
                        {state.errors?.name &&
                        state.errors.name.map((error: string) => (
                            <p className="mt-2 text-sm text-red-500" key={error}>
                            {error}
                            </p>
                        ))}
                    </div>
                </div>

                {/* Start Date */}
                <div className="mb-4">
                    <label htmlFor="startDate" className="mb-2 block text-sm font-medium">
                        Start date
                    </label>
                    <div className="relative mt-2 rounded-md">
                        <div className="relative">
                        <input
                            id="startDate"
                            name="startDate"
                            type="date"
                            step="0.01"
                            placeholder="Start date"
                            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                            aria-describedby="task-error"
                        />
                        </div>
                    </div>
                    <div id="task-error" aria-live="polite" aria-atomic="true">
                        {state.errors?.name &&
                        state.errors.name.map((error: string) => (
                            <p className="mt-2 text-sm text-red-500" key={error}>
                            {error}
                            </p>
                        ))}
                    </div>
                </div>

                {/* Start Time */}
                <div className="mb-4">
                    <label htmlFor="startTime" className="mb-2 block text-sm font-medium">
                        Start time
                    </label>
                    <div className="relative mt-2 rounded-md">
                        <div className="relative">
                        <input
                            id="startTime"
                            name="startTime"
                            type="time"
                            step="0.01"
                            placeholder="Start time"
                            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                            aria-describedby="task-error"
                        />
                        </div>
                    </div>
                    <div id="task-error" aria-live="polite" aria-atomic="true">
                        {state.errors?.name &&
                        state.errors.name.map((error: string) => (
                            <p className="mt-2 text-sm text-red-500" key={error}>
                            {error}
                            </p>
                        ))}
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
                        name="mindsetId"
                        className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                        defaultValue=""
                        aria-describedby="task-error"
                        >
                        <option value="" disabled>
                            Mindset
                        </option>
                        {mindsets.map((mindset) => (
                            <option key={mindset.id} value={mindset.id}>
                            {mindset.name}
                            </option>
                        ))}
                        </select>
                    </div>
                    <div id="task-error" aria-live="polite" aria-atomic="true">
                        {state.errors?.mindsetId &&
                        state.errors.mindsetId.map((error: string) => (
                            <p className="mt-2 text-sm text-red-500" key={error}>
                            {error}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        </form>
    )
}
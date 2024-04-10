import Link from 'next/link';
import React from 'react';

export default function AddTaskButton() {
    return (<div className='w-8 h-8 text-white bg-violet-400 rounded-full text-2xl text-center align-middle'>
        <Link
            href='/add-task'
        >
            +
        </Link>
    </div>)
}
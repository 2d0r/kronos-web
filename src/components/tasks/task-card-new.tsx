'use client';

import { useState, useEffect } from 'react';
import { useFormState } from 'react-dom';
import Button from '@/components/button';
import { Dropdown, InputField, MultiSelectionField } from './form-fields';
import { priorityList, dayOfWeekList, timeOfDayList, timeSpanList, NEUTRAL_MINDSET_COLOUR, TaskWithRelations, DEFAULT_MINDSET, URLSearchParamsKronos, MIN_TASK_DURATION } from '@/lib/definitions';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { DayOfWeek, Event, Mindset, TimeOfDay } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { editTaskPrisma, createTaskPrisma } from '@/lib/actions';
import { parseISO } from 'date-fns';
import NotesEditor from '@/components/notes-editor';
import ChecklistEditor from '@/components/checklist-editor';
import {v4 as uuidv4} from 'uuid';
import { organiseTask } from '@/lib/organise-task';
import EventSection from './event-section';
import { addMinutesToDate, minutesBetweenDates } from '@/utils/dateUtils';
import TaskForm from './task-form';


export default function TaskCard({task, mindsets, onTaskUpdate, onTaskCreate, onTaskDelete} : {
    task?: TaskWithRelations, 
    mindsets: Mindset[], 
    onTaskUpdate?: (task: TaskWithRelations) => void, 
    onTaskCreate?: (task: TaskWithRelations) => void,
    onTaskDelete?: (taskId: string) => void,
    // searchParams?: URLSearchParamsKronos,
}) {

    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const taskId = searchParams.get('task');


    // STATES

    // const [ isNewTask, setIsNewTask ] = useState<boolean>(searchParams.get('task') === 'new' ? true : false);
    // const [ isOpen, setIsOpen ] = useState<boolean>(false);
    // const [ taskCache, setTaskCache ] = useState<TaskWithRelations>((!isNewTask && task) ? task : {id: uuidv4()} as TaskWithRelations);
    const [ taskCache, setTaskCache ] = useState<TaskWithRelations>({} as TaskWithRelations);
    const [ isNewTask, setIsNewTask ] = useState<boolean>(false);
    


    // FORM DISPATCH

    const initialState = { message: null, errors: {} };
    // Set up to edit task or to create new task
    const editTaskHere : any = isNewTask ? createTaskPrisma : editTaskPrisma;
    const [state, dispatch] = useFormState(editTaskHere, initialState);


    // API ROUTES

    


    // HANDLERS


    // HOOKS

    useEffect(() => {
        if (taskId && taskId !== 'new') {
            fetch(`/task/${taskId}`)
                .then((response) => response.json())
                .then((data) => setTaskCache(data.task));
            setIsNewTask(false);
        } else if (taskId === 'new') {
            setIsNewTask(true);
        }
    }, [taskId]);
    // Update taskCache when task prop changes
    // useEffect(() => {
    //     if (task) {
    //         setTaskCache(task);
    //         // Load and update mindset colour
    //         setMindsetColour(task.mindset?.colour || NEUTRAL_MINDSET_COLOUR);
    //     }
    // }, [task]);
    
    // Update mindset colour for whole card when mindset is selected
    useEffect(() => {
        setMindsetColour(mindsets.filter(el => el.name === taskCache.mindset?.name)[0]?.colour || NEUTRAL_MINDSET_COLOUR);
    }, [taskCache.mindset]);
    // Signal task as ready to submit once the compulsory fields are filled
    useEffect(() => {
        console.log('taskCache', taskCache);
        // Check if task was edited
        (task && task !== taskCache) ? setTaskIsEdited(true) : setTaskIsEdited(false);
        // Check if new task has enough valid inputs to be added
        (
            taskCache?.name 
            && taskCache?.id
            && taskCache?.mindset
            && taskCache?.priority
            && (taskCache?.duration > 0 || (taskCache?.startTime && taskCache?.endTime))
        ) ? setTaskIsReady(true) : setTaskIsReady(false);
    }, [taskCache]);
    // Toggle between adding and editing a task, based on search parameters
    // useEffect(() => {

    //     const taskId = searchParams.get('task');
    //     if (taskId === 'new') {
    //         setIsNewTask(true);
    //         setTaskCache({} as TaskWithRelations);
    //     } else if (taskId) {
    //         // Fetch task if searchParams change, and task isn't passed as prop
    //         const fetchTaskAndUpdateCache = async (taskId: string) => {
    //             const response = await fetch(`/task/${taskId}`);
    //             const data = await response.json();
    //             setTaskCache(data.task);
    //         }

    //         fetchTaskAndUpdateCache(taskId)
    //             .catch(console.error);
    //     };

    //     console.log('TaskCard: Set taskCache = task if searchParams available');
    // }, [searchParams]);

    
    return (<div className='z-50 absolute w-full h-full left-0 top-0 flex items-center justify-center bg-black/20 backdrop-blur-sm py-4'>
        <div className='m-20 z-50 top-1/3 rounded-2xl bg-white shadow-2xl text-sm text-black overflow-hidden'>
            <TaskForm />
        </div>
    </div>);
}
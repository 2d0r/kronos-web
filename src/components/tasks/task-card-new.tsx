'use client';

import { useState, useEffect } from 'react';
import { useFormState } from 'react-dom';
import Button from '@/components/buttons/button';
import { Dropdown, InputField, MultiSelectionField } from '@/components/form-fields';
import { priorityList, dayOfWeekList, timeOfDayList, timeSpanList, NEUTRAL_MINDSET_COLOUR, TaskWithRelations, DEFAULT_MINDSET, URLSearchParamsKronos, MIN_TASK_DURATION } from '@/lib/definitions';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { DayOfWeek, Event, Mindset, TimeOfDay } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { editTaskPrisma, createTaskPrisma } from '@/lib/actions';
import { parseISO } from 'date-fns';
import NotesEditor from '@/components/notes-editor/notes-editor';
import ChecklistEditor from '@/components/notes-editor/checklist-editor';
import {v4 as uuidv4} from 'uuid';
import { organiseTask } from '@/lib/organise-task';
import EventSection from './event-section';
import { addMinutesToDate, minutesBetweenDates } from '@/utils/dateUtils';
import TaskForm from './task-form-new';


export default function TaskCard({task, mindsets, onTaskUpdate, onTaskCreate, onTaskDelete} : {
    task?: TaskWithRelations, 
    mindsets: Mindset[], 
    onTaskUpdate?: (task: TaskWithRelations) => void, 
    onTaskCreate?: (task: TaskWithRelations) => void,
    onTaskDelete?: (taskId: string) => void,
    // searchParams?: URLSearchParamsKronos,
}) {

    const router = useRouter();
    const searchParams = useSearchParams();
    const event = searchParams.get('event');
    const taskId = searchParams.get('task');



    // STATES

    const [ isNewTask, setIsNewTask ] = useState<boolean>(false);
    const [ taskCache, setTaskCache ] = useState<TaskWithRelations>({} as TaskWithRelations);
    const [ endRepeat, setEndRepeat ] = useState<(string | null)>('No');
    const [ idealStart, setIdealStart ] = useState<boolean>(false);
    const [ repeatUnit, setRepeatUnit ] = useState<string | null>('sessions');
    const [ mindsetColour, setMindsetColour] = useState<string>(taskCache?.mindset?.colour || NEUTRAL_MINDSET_COLOUR);
    const [ deadline, setDeadline ] = useState<boolean>(false);
    const [ taskIsEdited, setTaskIsEdited ] = useState<boolean>(false);
    const [ taskIsReady, setTaskIsReady ] = useState<boolean>(false);
    const [ eventId, setEventId ] = useState<string>(event || '');



    // FORM DISPATCH

    const initialState = { message: null, errors: {} };
    // Set up to edit task or to create new task
    const editTaskHere : any = isNewTask ? createTaskPrisma : editTaskPrisma;
    const [state, dispatch] = useFormState(editTaskHere, initialState);



    // HANDLERS

    const handleTaskCacheUpdate = (field: keyof TaskWithRelations, value: any) => {
        if (field === 'mindset') {
            const mindset = mindsets.filter(el => el.name === value)[0];
            setTaskCache(task => ({...task, mindset: mindset}));
        } else {
            setTaskCache(prevTask => ({ ...prevTask, [field]: value }));
        }
    }
    const handleTimeChanges = (event: React.ChangeEvent<HTMLSelectElement>, 
        type: ('startTime' | 'endTime' | 'startDate' | 'endDate')
    ) => {
        let dateTime = type.includes('start') ? taskCache?.startTime : taskCache?.endTime;
        const inputValue = event.target.value;

        if (dateTime === null) {
            dateTime = new Date();
            if (type.includes('Date')) {
                const [year, month, day] = inputValue.split('-');
                dateTime.setFullYear(Number(year), Number(month) - 1, Number(day));
                dateTime.setHours(0, 0, 0, 0); // Set to the nearest hour (midnight)
            } else {
                const [hours, minutes] = inputValue.split(':');
                dateTime.setHours(Number(hours));
                dateTime.setMinutes(Number(minutes));
                dateTime.setSeconds(0, 0);
            }
        } else {
            if (type.includes('Date')) {
                const [year, month, day] = inputValue.split('-');
                dateTime.setFullYear(Number(year), Number(month) - 1, Number(day));
            } else {
                const [hours, minutes] = inputValue.split(':');
                dateTime.setHours(Number(hours));
                dateTime.setMinutes(Number(minutes));
            }
        }

        if (type.includes('start')) {
            // When user changes start, only change end, don't change duration
            const newDuration = taskCache.duration || 60; // using existing value OR the default 60 minutes
            console.log('new duration', newDuration);
            setTaskCache(task => ({
                ...task, 
                startTime: dateTime, 
                duration: !task.duration && (!task.endTime || (task.startTime && task.endTime < task.startTime)) ? newDuration // automatically fill in endTime
                    : task.duration, 
                endTime: addMinutesToDate(dateTime, newDuration) // change end 
                    // : !task.endTime || (task.startTime && task.endTime < task.startTime) ? addMinutesToDate(dateTime, newDuration) // automatically fill in endTime
                    // : task.endTime,
            }));
        } else {
            // When user changes end, only change duration, don't change start
            setTaskCache(task => ({
                ...task, 
                endTime: dateTime,
                duration: task.startTime && task.fixed && minutesBetweenDates(task.startTime, dateTime) > 0 ? minutesBetweenDates(task.startTime, dateTime) 
                    : task.duration, // automatically fill in endTime
            }));
        }
    }
    const handleDurationChange = (event: React.ChangeEvent<HTMLSelectElement>, unit: 'minutes' | 'hours') => {
        // When user changes duration, only change end, don't change start
        const durationInMinutes = 
            unit === 'hours' ? (taskCache?.duration || 0) % 60 + Number(event.target.value) * 60 :
            (taskCache?.duration || 0) - (taskCache?.duration || 0) % 60 + Number(event.target.value);
        setTaskCache(taskCache => ({...taskCache, 
            duration: durationInMinutes,
            endTime: taskCache.fixed && taskCache.startTime && durationInMinutes > 0 ? addMinutesToDate(taskCache.startTime, durationInMinutes) : taskCache.endTime,
        }));
    }
    const handleTaskSubmit = () => {
        // Callback to parent component, with updated cache
        (isNewTask && onTaskCreate) ? onTaskCreate(taskCache) : 
        onTaskUpdate ? onTaskUpdate(taskCache) : 
        ()=>{};
        // Organise task in 
        // organiseTask(taskCache);
        router.back();
    };
    const handleDeleteTask = (taskId: string) => {
        onTaskDelete && onTaskDelete(taskId);
        router.back();
    }



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

    
    return <TaskForm />;
}
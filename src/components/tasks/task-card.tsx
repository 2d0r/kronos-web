'use client';

import { useState, useEffect } from 'react';
import { useFormState } from 'react-dom';
import Button from '@/components/buttons/button';
import { Dropdown, InputField, MultiSelectionField } from '@/components/form-fields';
import { priorityList, dayOfWeekList, timeOfDayList, timeSpanList, NEUTRAL_MINDSET_COLOUR } from '@/lib/definitions';
import { TaskWithRelations } from '@/lib/types';
import { usePathname, useSearchParams } from 'next/navigation';
import { DayOfWeek, Event, RepeatUnit, TimeOfDay } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { editTaskPrisma, createTaskPrisma } from '@/lib/actions';
import { getDate, parseISO } from 'date-fns';
import NotesEditor from '@/components/notes-editor/notes-editor';
import {v4 as uuidv4} from 'uuid';
import EventSection from './event-section';
import { addMinutesToDate, convertPropsToDate, dateToHtmlInput, minutesBetweenDates } from '@/utils/date-utils';
import '@/app/globals.css';
import { ArrowRight } from 'lucide-react';
import { useTasks, setTasks, setEvents, useEvents, useMindsets } from '@/store/store';
import { useDispatch } from 'react-redux';
import { fetchEventsOfTask, fetchTask } from '@/lib/data';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { useSetSearchParams } from '@/utils/app-utils';
import { XMarkIcon } from '@heroicons/react/24/outline';
import useWindowSize from '@/lib/useWindowSize';


export default function TaskCard() {

    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const eventId = searchParams.get('event'); 
    const taskId = searchParams.get('task');

    const tasks = useTasks();
    const events = useEvents();
    const mindsets = useMindsets();
    const dispatch = useDispatch();

    const { windowWidth } = useWindowSize();
    const { setSearchParams } = useSetSearchParams();


    // STATES

    const [ initialTask, setInitialTask ] = useState<TaskWithRelations>({} as TaskWithRelations);
    const [ taskCache, setTaskCache ] = useState<TaskWithRelations>({} as TaskWithRelations);
    const [ isNewTask, setIsNewTask ] = useState<boolean>(false);
    const [ mindsetColour, setMindsetColour] = useState<string>(taskCache.mindset?.colour || NEUTRAL_MINDSET_COLOUR);

    interface Toggles {
        endRepeat: ('yes' | 'no' | 'duration' | 'date' | 'repetitions'); idealStart: boolean; repeatUnit: RepeatUnit | null; deadline: boolean; taskIsReady: boolean; taskIsEdited: boolean;
    }
    const [ toggles, setToggles ] = useState<Toggles>({
        endRepeat: 'no',
        idealStart: false,
        repeatUnit: 'sessions',
        deadline: false,
        taskIsEdited: false,
        taskIsReady: false,
    });
    


    // FORM DISPATCH

    const initialState = { message: null, errors: {}, success: false, };
    // Set up to edit task or to create new task
    const taskAction : any = isNewTask ? createTaskPrisma : editTaskPrisma;
    const [state, formAction] = useFormState(taskAction, initialState);
    // const { pending } = useFormStatus();


    // HANDLERS

    const handleInputOnChange = (field: keyof TaskWithRelations, value: any) => {
        if (field === 'mindset') {
            const mindset = mindsets.filter(el => el.display === value)[0];
            setTaskCache(task => ({...task, mindset: mindset}));
        } else {
            setTaskCache(prevTask => ({ ...prevTask, [field]: value }));
        }
    }
    const handleTimeChanges = (event: React.ChangeEvent<HTMLSelectElement>, 
        type: ('startTime' | 'endTime' | 'startDate' | 'endDate')
    ) => {
        let dateToEdit = type.includes('start') ? taskCache.startTime : taskCache.endTime;
        dateToEdit = dateToEdit === null ? new Date() : new Date(dateToEdit);
        const inputValue = event.target.value;

        if (type.includes('Date')) {
            const [year, month, day] = inputValue.split('-');
            dateToEdit.setFullYear(Number(year), Number(month) - 1, Number(day));
            dateToEdit.setHours(0, 0, 0, 0); // Set to the nearest hour (midnight)
        } else {
            const [hours, minutes] = inputValue.split(':');
            dateToEdit.setHours(Number(hours));
            dateToEdit.setMinutes(Number(minutes));
            dateToEdit.setSeconds(0, 0);
        }

        if (type.includes('start')) {
            // When user changes start, only change end, don't change duration
            const newDuration = taskCache.duration || 60; // using existing value OR the default 60 minutes
            setTaskCache(task => ({
                ...task, 
                startTime: dateToEdit, 
                duration: !task.duration && (!task.endTime || (task.startTime && task.endTime < task.startTime)) ? newDuration // automatically fill in endTime
                    : task.duration, 
                endTime: addMinutesToDate(dateToEdit, newDuration) // change end 
                    // : !task.endTime || (task.startTime && task.endTime < task.startTime) ? addMinutesToDate(dateTime, newDuration) // automatically fill in endTime
                    // : task.endTime,
            }));
        } else {
            // When user changes end, only change duration, don't change start
            setTaskCache(task => ({
                ...task, 
                endTime: dateToEdit,
                duration: task.startTime && task.fixed && minutesBetweenDates(task.startTime, dateToEdit) > 0 ? minutesBetweenDates(task.startTime, dateToEdit) 
                    : task.duration, // automatically fill in endTime
            }));
        }
    }
    const handleDurationChange = (event: React.ChangeEvent<HTMLSelectElement>, unit: 'minutes' | 'hours') => {
        // When user changes duration, only change end, don't change start
        const durationInMinutes = 
            unit === 'hours' ? (taskCache.duration || 0) % 60 + Number(event.target.value) * 60 :
            (taskCache.duration || 0) - (taskCache.duration || 0) % 60 + Number(event.target.value);
        setTaskCache(taskCache => ({...taskCache, 
            duration: durationInMinutes,
            endTime: taskCache.fixed && taskCache.startTime && durationInMinutes > 0 ? addMinutesToDate(taskCache.startTime, durationInMinutes) : taskCache.endTime,
        }));
    }


    const handleTaskSubmit = () => {
        // Tasks database is being created/edited in parallel, via form action

        const taskId = taskCache.id;

        // We wait 1 sec for formAction and then signal the parent component to update its tasks and events
        setTimeout(async () => {
            const updatedTask = await fetchTask(taskId);
            dispatch(setTasks([...tasks.filter(task => task.id !== taskId), updatedTask]));
            const eventsOfTask = await fetchEventsOfTask(taskId);
            dispatch(setEvents([...events.filter(event => event.taskId !== taskId), ...eventsOfTask]));
        }, 1000);  
        // organiseTask(taskCache);
        router.back();
    };
    const handleDeleteTask = async (taskId: string) => {
        await fetch(`/task/${taskId}`, {
            method: 'DELETE' // Deletes all linked events and then the task
        });
        dispatch(setTasks(tasks.filter(task => task.id !== taskId)));
        dispatch(setEvents(events.filter(event => event.taskId !== taskId)));
        router.back();
    }
    const handleClickClose = () => {
        router.back();
        // const params = new URLSearchParams(searchParams);
        // if (pathname.includes('/task') && searchParams.get('task') && searchParams.get('task') !== 'new') {
        //     // params.set('status', 'doing');
        //     // replace(`${pathname}?${params.toString()}`);
        //     setSearchParams('status', 'doing');
        // } else {
        //     router.back();
        // }
    }


    // HOOKS

    // Fetch task using id from searchParams, initialise taskCache 
    useEffect(() => {
        if (taskId && taskId !== 'new') {
            setIsNewTask(false);
            fetch(`/task/${taskId}`)
                .then((response) => response.json())
                .then((data) => setTaskCache(
                    {
                        ...data.task, 
                        startTime: data.task?.startTime ? new Date(data.task.startTime) : null, 
                        endTime: data.task?.endTime ? new Date(data.task.endTime) : null,
                        // firstSessionStartTime: new Date(data.task.firstSessionStartTime),
                        // latestSessionStartTime: new Date(data.task.latestSessionStartTime),
                    }));
        } else if (taskId === 'new') {
            setIsNewTask(true);
            setTaskCache({ id: uuidv4() } as TaskWithRelations);
        }
    }, [taskId]);
    // Update cache when tasks store udpates
    useEffect(() => {
        const currentTask = tasks.find(task => task.id === taskId);
        if (currentTask) setTaskCache(currentTask);
    }, [tasks, taskId]);
    // Update mindset colour for whole card when mindset is selected
    useEffect(() => {
        setMindsetColour(mindsets.filter(el => el.name === taskCache.mindset?.name)[0]?.colour || NEUTRAL_MINDSET_COLOUR);
    }, [taskCache.mindset, mindsets]);
    // Signal task as ready to submit once the compulsory fields are filled
    useEffect(() => {
        // Check if task was edited
        // Check if new task has enough valid inputs to be added
        setToggles(toggles => ({...toggles, 
            taskIsEdited: initialTask !== taskCache,
            taskIsReady: !!(
                taskCache.name 
                && taskCache.id
                && taskCache.mindset
                && taskCache.priority
                && (taskCache.duration > 0 || (taskCache.startTime && taskCache.endTime))
            ),
        }));
        // console.log('taskCache', taskCache);
    }, [taskCache, initialTask]);
    useEffect(() => {
        setInitialTask(convertPropsToDate(tasks?.find(task => task.id === taskId) || null));
    }, [searchParams]);

    
    return (<AnimatePresence>
        {searchParams.get('task') && searchParams.get('status') === 'edit' && (
        // Overlay
        <motion.div className='z-50 absolute w-full h-full left-0 top-0 flex md:items-center justify-center bg-black/20 backdrop-blur-sm md:py-4 pt-4'
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
        transition={{ duration: 0.1, ease: false }}>
        {/* Card */}
        <motion.div className='w-full md:h-auto h-full md:w-auto md:m-20 z-50 top-1/3 md:rounded-2xl rounded-t-2xl overflow-hidden hide-scrollbar
        bg-white shadow-2xl text-sm text-black'
        initial={windowWidth && windowWidth > 500 ? { scale: 0.8 } : { y: 500 }} 
        animate={windowWidth && windowWidth > 500 ? { scale: 1 } : { y: 0 }} 
        exit={windowWidth && windowWidth > 500 ? { scale: 0.8, opacity: 0 } : { y: 500 }} 
        transition={{ duration: 0.1, ease: false }}>
        <form action={formAction}> 
            {/* Top bar */}
            <div className='w-full h-16 flex justify-between items-center p-4 border-b-[0.5px] sticky top-0 bg-white'>
                <div className='w-8 h-8'></div>
                <InputField 
                    fieldName='name'
                    placeholder='New task'
                    inputType='string'
                    className={`!border-0 !text-xl font-bold placeholder:text-lg pl-0 cursor-text !bg-transparent rounded-none text-center`}
                    colour={mindsetColour}
                    state={state}
                    value={taskCache.name || ''}
                    onChange={(event: any) => handleInputOnChange('name', event.target.value)}
                />
                <div onClick={handleClickClose} className='cursor-pointer' >
                    <XMarkIcon color='black' width={32} />
                </div>
            </div>

            {/* Body */}
            <div className='w-full md:h-auto h-[calc(100vh-8rem)] flex md:flex-row flex-col md:overflow-hidden overflow-y-auto'>

                {/* Settings panel */}
                <motion.div className='md:w-[350px] w-full md:h-[70vh] py-2 border-r-[0.5px] flex flex-col md:overflow-y-scroll task-input-fields' layout layoutScroll>
                    <Dropdown 
                        fieldName='mindset'
                        prompt='Pick a mindset'
                        label='Mindset'
                        list={mindsets.map(el => el.display || el.name)}
                        onChange={(event: any) => {
                            handleInputOnChange('mindset', event.target.value);
                        }}
                        value={taskCache.mindset?.display || ''}
                        bgColour={mindsetColour} colour={mindsetColour}
                        state={state}
                    />
                    <Dropdown 
                        fieldName='priority'
                        prompt='Pick a priority'
                        label='Priority'
                        list={priorityList}
                        onChange={(event: any) => handleInputOnChange('priority', event.target.value)}
                        value={taskCache.priority || ''}
                        bgColour={mindsetColour} colour={mindsetColour}
                        state={state}
                    />

                    {/* Duration */}
                    <div className='flex items-baseline'>
                        <div className='font-medium formKeysColumn'>Duration</div>
                        <InputField 
                            fieldName='durationHours'
                            inputType='number'
                            tail='hrs'
                            colour={mindsetColour}
                            state={state}
                            value={String(Math.floor(taskCache.duration / 60) || 0)}
                            onChange={(event: any) => {handleDurationChange(event, 'hours')}}
                        />
                        <InputField 
                            fieldName='durationMinutes'
                            inputType='number'
                            tail='min'
                            colour={mindsetColour}
                            state={state}
                            value={String(taskCache.duration % 60 || 0)}
                            onChange={(event: any) => {handleDurationChange(event, 'minutes')}}
                        />
                    </div>

                    <LayoutGroup>

                    {/* Scheduled */}
                    <div>
                    <button 
                        type='button'
                        className='w-full flex my-2 font-medium'
                        onClick={() => {
                            setTaskCache(prevTask => ({ ...prevTask, fixed: !taskCache.fixed, 
                                startTime: !taskCache.fixed ? null : taskCache.startTime, 
                                endTime: !taskCache.fixed ? null : taskCache.endTime,
                            }));
                        }}
                        style={{color: taskCache.fixed ? 'black' : 'lightgrey'}}
                        >Scheduled
                    </button>

                    <AnimatePresence>
                    {taskCache.fixed && (<motion.div className='overflow-hidden flex-grow-0 flex-shrink-0' initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} layout layoutScroll>
                        <div className='flex items-start gap-2'>
                        <div className='flex flex-col gap-2'>
                            <InputField 
                                fieldName='startTime'
                                inputType='time'
                                colour={mindsetColour}
                                state={state}
                                value={taskCache.startTime instanceof Date ? 
                                    taskCache.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '00:00'
                                }
                                onChange={(event: any) => handleTimeChanges(event, 'startTime')}
                            />
                            <InputField 
                                fieldName='startDate'
                                inputType='date'
                                colour={mindsetColour}
                                state={state}
                                value={taskCache.startTime instanceof Date ? 
                                    dateToHtmlInput(new Date(taskCache.startTime)) : dateToHtmlInput(new Date())
                                }
                                onChange={(event: any) => handleTimeChanges(event, 'startDate')}
                            />
                        </div>
                        <ArrowRight height={18} className='my-2' />
                        <div className='flex flex-col justify-start gap-2'>
                            <InputField 
                                fieldName='endTime'
                                inputType='time'
                                colour={mindsetColour}
                                state={state}
                                value={taskCache.endTime instanceof Date ? 
                                    taskCache.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '00:00'
                                }
                                onChange={(event: any) => handleTimeChanges(event, 'endTime')}
                            />
                            {/* {taskCache.startTime && taskCache.endTime && getDate(taskCache.startTime) !== getDate(taskCache.endTime) && */}
                                <InputField 
                                    fieldName='endDate'
                                    inputType='date'
                                    colour={mindsetColour}
                                    state={state}
                                    value={taskCache.endTime instanceof Date ? 
                                        dateToHtmlInput(new Date(taskCache.endTime)) : dateToHtmlInput(new Date())
                                    }
                                    onChange={(event: any) => handleTimeChanges(event, 'endDate')}
                                    hidden={!taskCache.startTime || !taskCache.endTime || getDate(taskCache.startTime) === getDate(taskCache.endTime)}
                                />
                            {/* } */}
                        </div>
                        </div>
                    </motion.div>)}
                    </AnimatePresence>

                    </div>

                    <div className='overflow-hidden'>
                    {/* Repeat? */}
                    <button 
                        type='button'
                        className='w-full flex my-2 font-medium'
                        onClick={() => { setTaskCache(taskCache => ({
                            ...taskCache,
                            repeat: !taskCache.repeat
                        }))}}
                        style={{color: taskCache.repeat ? 'black' : 'lightgrey'}}
                    >Repeat</button>

                    {/* For repeating tasks */}
                    <AnimatePresence>
                    {taskCache.repeat && (<motion.div className='flex-grow-0 flex-shrink-0' initial={{ height: 0 }} animate={{ height: '' }} exit={{ height: 0 }} layout layoutScroll>
                        <div className='flex mb-2 items-top *:mb-0 overflow-x-scroll items-center gap-2 h-'>
                            {toggles.repeatUnit === 'sessions' ? (<>
                                <InputField 
                                    fieldName='repeatFrequency'
                                    placeholder=''
                                    inputType='number'
                                    colour={mindsetColour}
                                    state={state}
                                    value={String(taskCache.repeatFrequency || 0)}
                                    onChange={(event: any) => handleInputOnChange('repeatFrequency', Number(event.target.value) || 0)}
                                />
                            </>) : (<>
                                <InputField 
                                    fieldName='repeatDuration'
                                    placeholder=''
                                    inputType='number'
                                    colour={mindsetColour}
                                    state={state}
                                    value={String(taskCache.repeatFrequency || 0)}
                                    onChange={(event: any) => handleInputOnChange('repeatFrequency', Number(event.target.value))}
                                />
                            </>)}
                            time{taskCache.repeatFrequency === 1 ? '' : 's'} every
                            {(taskCache.repeatFrequency === 1) ? 
                                <InputField 
                                    fieldName='repeatTimespanMultiplier'
                                    placeholder=''
                                    inputType='number'
                                    colour={mindsetColour}
                                    state={state}
                                    value={String(taskCache.repeatTimespanMultiplier)}
                                    onChange={(event: any) => handleInputOnChange('repeatTimespanMultiplier', Number(event.target.value))}
                                /> : <></>
                            }
                            <Dropdown 
                                fieldName='repeatTimespan'
                                prompt=''
                                list={timeSpanList.filter(el => el.toLowerCase() !== 'hour')} // Removed hourly repetition
                                value={taskCache.repeatTimespan || 'Day'}
                                onChange={(event: any) => handleInputOnChange('repeatTimespan', event.target.value)}
                                bgColour={mindsetColour} colour={mindsetColour}
                                state={state}
                            />
                        </div>
                    </motion.div>)}
                    </AnimatePresence>
                    </div>

                    {/* Ideal start */}
                    <AnimatePresence>
                    {!taskCache.fixed && (<motion.div className='flex overflow-hidden' initial={{ height: 0 }} animate={{ height: '' }} exit={{ height: 0 }} transition={{ ease: false }} layout layoutScroll>
                        <button 
                            type='button'
                            onClick={() => { 
                                setToggles(toggles => ({ ...toggles, idealStart: !toggles.idealStart }));
                                setTaskCache(prevTask => ({ ...prevTask, startTime: null }));
                            }}
                            style={{color: toggles.idealStart || taskCache.idealStart ? 'black' : 'lightgrey'}}
                            className='text-left cursor-pointer font-medium my-2 formKeysColumn'
                            >Ideal start
                        </button>
                        { (toggles.idealStart || taskCache.idealStart) ? 
                        <InputField 
                            fieldName='idealStart'
                            placeholder='Enter start time'
                            inputType='time'
                            label=''
                            colour={mindsetColour}
                            state={state}
                            value={taskCache.idealStart || ''}
                            onChange={(event: any) => {
                                const timeBits = event.target.value.split(':');
                                handleInputOnChange('idealStart', `${timeBits[0]}:${timeBits[1]}`);
                            }}
                        /> : <></>}
                    </motion.div>)}
                    </AnimatePresence>
                    
                    {/* Preferred times and days */}
                    <AnimatePresence>
                    {!taskCache.fixed && (<motion.div className='flex flex-col gap-2 overflow-hidden flex-grow-0 flex-shrink-0' 
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ ease: false }} layout layoutScroll>
                        {(!taskCache.repeat || taskCache.repeatTimespan !== 'hour') && (<div>
                            <MultiSelectionField
                                fieldName='preferredTimeOfDay'
                                prompt='Preferred daytimes'
                                list={timeOfDayList}
                                type='checkbox'
                                className='w-full-key'
                                colour={mindsetColour}
                                state={state}
                                selected={taskCache.preferredTimeOfDay || []}
                                onChange={(value: string[]) => handleInputOnChange('preferredTimeOfDay', value as TimeOfDay[])}
                            />
                        </div>)}
                        {(!taskCache.repeat || (taskCache.repeatTimespan !== 'hour' && taskCache.repeatTimespan !== 'day')) && (<div>
                            <MultiSelectionField 
                                fieldName='preferredDayOfWeek'
                                prompt='Preferred days'
                                list={dayOfWeekList}
                                type='checkbox'
                                colour={mindsetColour}
                                state={state}
                                className='w-full-key'
                                selected={taskCache.preferredDayOfWeek || []}
                                onChange={(value: string[]) => handleInputOnChange('preferredDayOfWeek', value as DayOfWeek[])}
                            />
                        </div>)}
                    </motion.div>)}
                    </AnimatePresence>

                    {/* End repeat */}
                    {taskCache.repeat && (<motion.div className='overflow-hidden flex-grow-0 flex-shrink-0' initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ ease: false }} layout layoutScroll>
                        {/* <div className={'divider'}></div> */}
                        <div className='flex flex-col gap-2'>
                            <button 
                                type='button'
                                className='w-full flex my-2 font-medium'
                                onClick={() => {
                                    handleInputOnChange('endRepeat', !taskCache.endRepeat);
                                    setTaskCache(prevTask => ({ ...prevTask, totalDuration: null, totalRepetitions: null, deadline: null }));
                                }}
                                style={{color: taskCache.endRepeat ? 'black' : 'lightgrey'}}
                            >End repeat</button>
                            <AnimatePresence>
                            {(taskCache.repeat && taskCache.endRepeat) && (<motion.div className='overflow-hidden' initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} layout layoutScroll>
                                <div className='flex h-8 gap-2 items-center pl-2'>
                                    <button 
                                        type='button'
                                        onClick={() => {
                                            const newEndRepeat = toggles.endRepeat === 'date' ? 'yes' : 'date';
                                            setToggles(toggles => ({...toggles, endRepeat: newEndRepeat}));
                                            setTaskCache(prevTask => ({ ...prevTask, totalDuration: null, totalRepetitions: null,
                                                deadline: newEndRepeat === 'yes' ? null : prevTask.deadline,
                                            }));
                                        }}
                                        style={{color: toggles.endRepeat === 'date' || taskCache.deadline ? 'black' : 'lightgrey'}}
                                        className='text-left'
                                    >On a date</button>
                                    {(toggles.endRepeat === 'date' || taskCache.deadline) ? <InputField 
                                        fieldName='endRepeatDate'
                                        placeholder='End repeat on date'
                                        inputType='date'
                                        colour={mindsetColour}
                                        state={state}
                                        value={taskCache.deadline?.toISOString().slice(0, 10) || ''}
                                        onChange={(event: any) => event.target.value && handleInputOnChange('deadline', parseISO(event.target.value))}
                                    /> : <></>}
                                </div>
                                <div className='flex h-8 gap-2 items-center text-left pl-2'>
                                    <button 
                                        type='button'
                                        onClick={() => {
                                            const newEndRepeat = toggles.endRepeat === 'duration' ? 'yes' : 'duration';
                                            setToggles(toggles => ({...toggles, endRepeat: newEndRepeat}));
                                            setTaskCache(prevTask => ({ ...prevTask, deadline: null, totalRepetitions: null,
                                                totalDuration: newEndRepeat === 'yes' ? null : prevTask.totalDuration,
                                            }));
                                        }}
                                        style={{color: toggles.endRepeat === 'duration' || taskCache.totalDuration ? 'black' : 'lightgrey'}}
                                        className='text-left'
                                    >After a total duration</button>
                                    {(toggles.endRepeat === 'duration' || taskCache.totalDuration) ? <InputField 
                                        fieldName='totalDuration'
                                        placeholder='0'
                                        inputType='number'
                                        colour={mindsetColour}
                                        state={state}
                                        value={String(taskCache.totalDuration) || ''}
                                        onChange={(event: any) => handleInputOnChange('totalDuration', Number(event.target.value))}
                                    /> : <></>}
                                </div>
                                <div className='flex h-8 gap-2 items-center pl-2'>
                                    <button 
                                        type='button'
                                        onClick={() => {
                                            const newEndRepeat = toggles.endRepeat === 'repetitions' ? 'yes' : 'repetitions';
                                            setToggles(toggles => ({...toggles, endRepeat: newEndRepeat}));
                                            setTaskCache(prevTask => ({ ...prevTask, deadline: null, totalDuration: null,
                                                totalRepetitions: newEndRepeat === 'yes' ? null : prevTask.totalRepetitions,
                                            }));
                                        }}
                                        style={{color: toggles.endRepeat === 'repetitions' || taskCache.totalRepetitions ? 'black' : 'lightgrey'}}
                                        className='text-left'
                                    >After a number of repetitions</button>
                                    {(toggles.endRepeat === 'repetitions' || taskCache.totalRepetitions) ? <InputField 
                                        fieldName='totalRepetitions'
                                        placeholder='0'
                                        inputType='number'
                                        colour={mindsetColour}
                                        state={state}
                                        value={String(taskCache.totalRepetitions) || ''}
                                        onChange={(event: any) => handleInputOnChange('totalRepetitions', Number(event.target.value))}
                                    /> : <></>}
                                </div>
                            </motion.div>)}
                            </AnimatePresence>
                        </div>
                    </motion.div>)}
                    
                    {(taskCache.fixed && !taskCache.repeat) && (
                        <div className='flex h-8 gap-2 items-center'>
                            <button
                                type='button' 
                                onClick={() => setToggles(toggles => ({...toggles, deadline: !toggles.deadline}))}
                                style={{color: toggles.deadline ? 'black' : 'lightgrey'}}
                                className='font-medium formKeysColumn'>
                                Deadline
                            </button>
                            {toggles.deadline && <InputField 
                                fieldName='totalDuration'
                                placeholder='Deadline'
                                inputType='date'
                                colour={mindsetColour}
                                state={state}
                                value={String(taskCache.totalDuration) || ''}
                            />}
                        </div>
                    )}

                    </LayoutGroup>
                    
                </motion.div>

                {/* Notes and checklist panel */}
                <div className='md:w-[400px] w-full md:h-[70vh] flex flex-col task-card'>
                    <div className=''>
                        <EventSection event={taskCache.events?.filter(el => el.id === eventId)[0] || {} as Event} mindsetColour={mindsetColour} />
                    </div>
                    <div className='md:h-full min-h-[12rem] border-b-[0.5px] overflow-y-scroll'>
                        <NotesEditor notes={taskCache.notes || ''} taskId={taskCache.id} page={'edit-task'} />
                    </div>
                    <div className='min-h-1/6 flex flex-col gap-1 p-4'>
                        <span className='text-gray-300 text-md font-medium'>Task Relations</span>
                        <span className='text-gray-300 text-xs'>Coming soon</span>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className='flex justify-between items-center gap-4 p-4 h-12 border-t-[0.5px]'>
                <button type='button'
                    className='text-gray-400'
                    onClick={() => {
                        // if(task?.id) deleteTaskPrisma(task.id);
                        // closeModalAndRefetchTasks();
                        !isNewTask && handleDeleteTask(taskCache.id);
                    }}
                    >Delete task
                </button>
                <div className='flex gap-4'>
                    { toggles.taskIsEdited && !isNewTask ?
                        <button 
                            type='reset' 
                            className='text-gray-400'
                            onClick={() => initialTask && setTaskCache(initialTask)}
                            >
                            Cancel changes
                        </button> : <></>
                    }
                    <Button type='submit' 
                        className={`task-card h-8 text-black ${toggles.taskIsReady ? '' : 'bg-gray-300 cursor-not-allowed'}`}
                        disabled={!toggles.taskIsReady}
                        style={{ backgroundColor: toggles.taskIsReady ? mindsetColour : '' }}
                        onClick={handleTaskSubmit}
                        >{isNewTask ? 'Add task' : 'Save'}
                    </Button>
                </div>
            </div>

            {/* Data to be sent to form without direct input */}
            <input type='hidden' name='id' id='id'  value={taskCache.id || ''} />
            <input type='hidden' name='type' id='type'  value={'task'} />
            <input type='hidden' name='repeat' id='repeat' value={String(taskCache.repeat) || 'false'} />
            {/* task.fixed is sent based on startTime and endTime */}
        </form>
        </motion.div>
        </motion.div>)}
    </AnimatePresence>);
}
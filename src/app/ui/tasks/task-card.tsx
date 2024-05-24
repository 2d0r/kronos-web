'use client';

import { useState, useEffect } from 'react';
import { useFormState } from 'react-dom';
import Button from '@/components/button';
import { Dropdown, InputField, MultiSelectionField } from './form-fields';
import { priorityList, dayOfWeekList, timeOfDayList, timeSpanList, NEUTRAL_MINDSET_COLOUR, TaskWithRelations, DEFAULT_MINDSET, URLSearchParamsKronos } from '@/app/lib/definitions';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Mindset } from '@prisma/client';
import { adjustLightness } from '@/app/utils/colourUtils';
import { useRouter } from 'next/navigation';
import { editTaskPrisma } from '@/app/lib/actions';
import { parseISO } from 'date-fns';
import NotesEditor from '@/components/notes-editor';
import ChecklistEditor from '@/components/checklist-editor';


export default function TaskCard({task, mindsets} : {task?: TaskWithRelations, mindsets: Mindset[]}) {
    const initialState = { message: null, errors: {} };
    const editTaskHere : any = editTaskPrisma;
    const [state, dispatch] = useFormState(editTaskHere, initialState);

    const pathname = usePathname();
    const router = useRouter();

    const [ taskCache, setTaskCache ] = useState<TaskWithRelations>(task || {} as TaskWithRelations);
    const [ endRepeat, setEndRepeat ] = useState<(string | null)>('No');
    const [ idealStart, setIdealStart ] = useState<boolean>(false);
    const [repeatUnit, setRepeatUnit] = useState<string | null>('sessions');
    const [ mindsetColour, setMindsetColour] = useState<string>(taskCache.mindset?.colour || 'green');
    const [ deadline, setDeadline ] = useState<boolean>(false);
    const [ taskIsEdited, setTaskIsEdited ] = useState<boolean>(false);
    const [ taskIsReady, setTaskIsReady ] = useState<boolean>(false);

    const handleTaskCacheUpdate = (field: keyof TaskWithRelations, value: any) => {
        setTaskCache(taskCache => ({
            ...taskCache,
            [field]: value,
        }));
    }
    const handleChangeMindset = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const mindset = mindsets.filter(el => el.name === event.target.value)[0];
        setTaskCache(task => ({...task, mindset: mindset}));
    }
    const handleTimeChanges = (event: React.ChangeEvent<HTMLSelectElement>, 
        type: ('startTime' | 'endTime' | 'startDate' | 'endDate')
    ) => {
        let dateTime = type.includes('start') ? taskCache.startTime : taskCache.endTime;
        const value = event.target.value;

        if (dateTime === null) {
            dateTime = new Date();
            if (type.includes('Date')) {
                const [year, month, day] = value.split('-');
                dateTime.setFullYear(Number(year), Number(month) - 1, Number(day));
                dateTime.setHours(0, 0, 0, 0); // Set to the nearest hour (midnight)
            } else {
                const [hours, minutes] = value.split(':');
                dateTime.setHours(Number(hours));
                dateTime.setMinutes(Number(minutes));
                dateTime.setSeconds(0, 0);
            }
        } else {
            if (type.includes('Date')) {
                const [year, month, day] = value.split('-');
                dateTime.setFullYear(Number(year), Number(month) - 1, Number(day));
            } else {
                const [hours, minutes] = value.split(':');
                dateTime.setHours(Number(hours));
                dateTime.setMinutes(Number(minutes));
            }
        }

        if (type.includes('start')) {
            setTaskCache(task => ({...task, startTime: dateTime}));
            console.log('Start DateTime:', taskCache.startTime);
        } else {
            setTaskCache(task => ({...task, endTime: dateTime}));
            console.log('End DateTime:', taskCache.endTime);
        }
    }

    useEffect(() => {
        setMindsetColour(mindsets.filter(el => el.name === taskCache.mindset?.name)[0]?.colour || NEUTRAL_MINDSET_COLOUR);
    }, [taskCache.mindset]);
    useEffect(() => {
        console.log('taskCache', taskCache);
        // Check if task was edited
        (task && task !== taskCache) ? setTaskIsEdited(true) : setTaskIsEdited(false);
        // Check if new task has enough valid inputs to be added
        (
            taskCache.name
            && taskCache.mindset
            && taskCache.priority
            && (taskCache.duration > 0 || (taskCache.startTime && taskCache.endTime))
        ) ? setTaskIsReady(true) : setTaskIsReady(false);
        console.log('taskIsReady', taskIsReady);
    }, [taskCache]);
    useEffect(() => {
        setMindsetColour(task?.mindset?.colour || NEUTRAL_MINDSET_COLOUR);
    }, []);
    

    return (<div className='z-50 absolute w-full h-full left-0 top-0 flex items-center justify-center bg-black/20 backdrop-blur-sm py-4'>
    <div className='m-20 z-50 top-1/3 rounded-2xl bg-white shadow-2xl shadow-slate-500 text-sm text-black overflow-hidden'>
    <form action={dispatch}>
        {/* Top bar */}
        <div className='w-full h-16 flex justify-between items-center p-4 border-b-[0.5px]'>
            <div className='w-8 h-8'></div>
            <InputField 
                fieldName='name'
                placeholder='Enter task name'
                inputType='string'
                className={`!border-0 !text-xl font-bold placeholder:text-lg placeholder:text-gray-300 pl-0 cursor-text !bg-transparent rounded-none text-center`}
                colour={mindsetColour}
                state={state}
                value={taskCache.name}
                onChange={(event: any) => handleTaskCacheUpdate('name', event.target.value)}
            />
            <Link href={pathname} onClick={() => router.back()} >
                <img src='../icons/close-black.svg' className='w-8 h-8'/>
            </Link>
        </div>
        <div className='w-full flex overflow-hidden'>
            {/* Settings panel */}
            <div className='w-[350px] h-[70vh] p-4 border-r-[0.5px] flex flex-col gap-4 overflow-y-scroll'>
                <Dropdown 
                    fieldName='mindset'
                    prompt='Pick a mindset'
                    label='Mindset'
                    list={mindsets.map(el => el.name)}
                    onChange={(event: any) => {
                        handleChangeMindset(event);
                    }}
                    defaultValue={taskCache.mindset?.name || ''}
                    colour={mindsetColour}
                    state={state}
                />
                <Dropdown 
                    fieldName='priority'
                    prompt='Pick a priority'
                    label='Priority'
                    list={priorityList}
                    onChange={(event: any) => handleTaskCacheUpdate('priority', event.target.value)}
                    defaultValue={taskCache.priority || ''}
                    colour={mindsetColour}
                    state={state}
                />

                {!taskCache.fixed && (<div className='flex items-center'>
                    <div className='font-medium block formKeysColumn'>Duration</div>
                    <InputField 
                        fieldName='durationHours'
                        inputType='number'
                        tail='hrs'
                        colour={mindsetColour}
                        state={state}
                        value={String(Math.floor(taskCache.duration / 60))}
                        onChange={(event: any) => {
                            setTaskCache(taskCache => ({...taskCache, 
                                duration: (taskCache.duration || 0) % 60 + Number(event.target.value) * 60
                            }));
                        }}
                    />
                    <InputField 
                        fieldName='durationMinutes'
                        inputType='number'
                        tail='min'
                        colour={mindsetColour}
                        state={state}
                        value={String(taskCache.duration % 60)}
                        onChange={(event: any) => {
                            setTaskCache(taskCache => ({...taskCache, 
                                duration: (taskCache.duration || 0) - (taskCache.duration || 0) % 60 + Number(event.target.value)
                            }));
                        }}
                    />
                </div>)}

                {/* Scheduled */}
                <button 
                    type='button'
                    className='w-full flex my-2 font-medium'
                    onClick={() => {
                        setTaskCache(task => ({ ...task, fixed: !taskCache.fixed, 
                            startTime: !taskCache.fixed ? null : taskCache.startTime, 
                            endTime: !taskCache.fixed ? null : taskCache.endTime,
                        }));
                    }}
                    style={{color: taskCache.fixed ? 'black' : 'lightgrey'}}
                    >Scheduled
                </button>
                {taskCache.fixed && (<>
                    <div className='flex items-center gap-2'>
                    <div className='flex flex-col gap-2'>
                        <InputField 
                            fieldName='startTime'
                            inputType='time'
                            colour={mindsetColour}
                            state={state}
                            value={taskCache.startTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            onChange={(event: any) => handleTimeChanges(event, 'startTime')}
                        />
                        <InputField 
                            fieldName='startDate'
                            inputType='date'
                            colour={mindsetColour}
                            state={state}
                            value={taskCache.startTime?.toISOString().slice(0, 10) || new Date().toISOString().slice(0, 10)}
                            onChange={(event: any) => handleTimeChanges(event, 'startDate')}
                        />
                    </div>
                    {'→'}
                    <div className='flex flex-col justify-start gap-2'>
                    <InputField 
                        fieldName='endTime'
                        inputType='time'
                        colour={mindsetColour}
                        state={state}
                        value={taskCache.endTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        onChange={(event: any) => handleTimeChanges(event, 'endTime')}
                    />
                    <InputField 
                        fieldName='endDate'
                        inputType='date'
                        colour={mindsetColour}
                        state={state}
                        value={taskCache.endTime?.toISOString().slice(0, 10) || new Date().toISOString().slice(0, 10)}
                        onChange={(event: any) => handleTimeChanges(event, 'endDate')}
                    />
                    </div>
                    </div>
                </>)}


                {!taskCache.fixed && (
                <div className='flex gap-4'>
                    <button 
                        type='button'
                        onClick={() => { 
                            setIdealStart(!idealStart);
                            setTaskCache(task => ({ ...task, startTime: null }));
                        }}
                        style={{color: idealStart || taskCache.startTime ? 'black' : 'lightgrey'}}
                        className='text-left cursor-pointer font-medium my-2'
                        >Ideal start
                    </button>
                    { (idealStart || taskCache.startTime) ? 
                    <InputField 
                        fieldName='idealStartTime'
                        placeholder='Enter start time'
                        inputType='time'
                        label=''
                        colour={mindsetColour}
                        state={state}
                        value={taskCache.fixed ? '' : taskCache.startTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    /> : <></>}
                </div>)}
                <div className={'divider'}></div>
                {/* <SelectionField 
                    fieldName='repeat'
                    prompt=''
                    list={['One time', 'Repeat']}
                    type='radio'
                    colour={mindsetColour}
                    collapse={false}
                    state={state}
                    defaultSelected={taskCache.repeat ? ['Repeat'] : ['One time']}
                /> */}
                <button 
                    type='button'
                    className='w-full flex my-2 font-medium'
                    onClick={() => { setTaskCache(taskCache => ({
                        ...taskCache,
                        repeat: !taskCache.repeat
                    }))}}
                    style={{color: taskCache.repeat ? 'black' : 'lightgrey'}}
                >Repeat</button>
                {taskCache.repeat && (<div className=''>
                    <div className='flex mb-2 items-top *:mb-0 overflow-x-scroll items-center gap-2'>
                        {repeatUnit === 'sessions' ? (<>
                            <InputField 
                                fieldName='repeatFrequency'
                                placeholder=''
                                inputType='number'
                                colour={mindsetColour}
                                state={state}
                                value={String(taskCache.repeatFrequency)}
                                onChange={(event: any) => handleTaskCacheUpdate('repeatFrequency', Number(event.target.value))}
                            />
                        </>) : (<>
                            <InputField 
                                fieldName='repeatDuration'
                                placeholder='10'
                                inputType='number'
                                colour={mindsetColour}
                                state={state}
                                value={String(taskCache.repeatFrequency)}
                                onChange={(event: any) => handleTaskCacheUpdate('repeatFrequency', Number(event.target.value))}
                            />
                        </>)}
                        {/* <Dropdown 
                            fieldName='repeatUnit'
                            prompt=''
                            list={(((repeatUnit && repeatUnit.includes('session') && repeatFrequency && repeatFrequency !== 1) || (repeatUnit && repeatUnit.includes('minute'))) ? repeatUnitList : 
                                repeatUnitList.map(item => item.slice(0, item.length - 1))) as [string, ...string[]]}
                            defaultValue='sessions'
                            onChange={handleRepeatUnitSelect}
                            colour={mindsetColour}
                            state={state}
                        /> */}
                        time{taskCache.repeatFrequency === 1 ? '' : 's'} every
                        {(taskCache.repeatFrequency === 1) ? 
                            <InputField 
                                fieldName='repeatTimespanMultiplier'
                                placeholder=''
                                inputType='number'
                                colour={mindsetColour}
                                state={state}
                                value={String(taskCache.repeatTimespanMultiplier)}
                                onChange={(event: any) => handleTaskCacheUpdate('repeatTimespanMultiplier', Number(event.target.value))}
                            /> : <></>
                        }
                        <Dropdown 
                            fieldName='repeatTimespan'
                            prompt=''
                            list={timeSpanList}
                            defaultValue={taskCache.repeatTimespan || 'Day'}
                            onChange={(event: any) => handleTaskCacheUpdate('repeatTimespan', event.target.value)}
                            colour={mindsetColour}
                            state={state}
                        />
                    </div>
                </div>)}
                {!taskCache.fixed && (<>
                    {(!taskCache.repeat || taskCache.repeatTimespan !== 'hour') && (<>
                        <div className='divider'></div>
                        <MultiSelectionField
                            fieldName='preferredTimeOfDay'
                            prompt='Preferred daytimes'
                            list={timeOfDayList}
                            type='checkbox'
                            className='multi-line w-full-key'
                            colour={mindsetColour}
                            state={state}
                            defaultSelected={taskCache.preferredTimeOfDay}
                            onChange={(event: any) => handleTaskCacheUpdate('preferredTimeOfDay', event.target.value)}
                        />
                    </>)}
                    {(!taskCache.repeat || (taskCache.repeatTimespan !== 'hour' && taskCache.repeatTimespan !== 'day')) && (<>
                        <MultiSelectionField 
                            fieldName='preferredDayOfWeek'
                            prompt='Preferred days'
                            list={dayOfWeekList}
                            type='checkbox'
                            colour={mindsetColour}
                            state={state}
                            className='w-full-key'
                            defaultSelected={taskCache.preferredDayOfWeek}
                            onChange={(event: any) => handleTaskCacheUpdate('preferredDayOfWeek', event.target.value)}
                        />
                    </>)}
                </>)}
                {taskCache.repeat && (<>
                    <div className={'divider'}></div>
                    <div className='flex flex-col gap-2'>
                        <button 
                            type='button'
                            className='w-full flex my-2 font-medium'
                            onClick={() => {
                                handleTaskCacheUpdate('endRepeat', !taskCache.endRepeat);
                                setTaskCache(task => ({ ...task, totalDuration: null, totalRepetitions: null, endRepeatDate: null }));
                            }}
                            style={{color: taskCache.endRepeat ? 'black' : 'lightgrey'}}
                        >End repeat</button>
                        {(taskCache.repeat && taskCache.endRepeat) && (<>
                            <div className='flex h-8 gap-2 items-center pl-2'>
                                <button 
                                    type='button'
                                    onClick={() => {
                                        setEndRepeat(endRepeat === 'date' ? 'yes' : 'date');
                                        setTaskCache(task => ({ ...task, totalDuration: null, totalRepetitions: null }));
                                    }}
                                    style={{color: endRepeat === 'date' || taskCache.deadline ? 'black' : 'lightgrey'}}
                                    className='text-left'
                                >On a date</button>
                                {(endRepeat === 'date' || taskCache.deadline) ? <InputField 
                                    fieldName='endRepeatDate'
                                    placeholder='End repeat on date'
                                    inputType='date'
                                    colour={mindsetColour}
                                    state={state}
                                    value={taskCache.deadline?.toISOString().slice(0, 10)}
                                    onChange={(event: any) => event.target.value && handleTaskCacheUpdate('deadline', parseISO(event.target.value))}
                                /> : <></>}
                            </div>
                            <div className='flex h-8 gap-2 items-center text-left pl-2'>
                                <button 
                                    type='button'
                                    onClick={() => {
                                        setEndRepeat(endRepeat === 'duration' ? 'yes' : 'duration');
                                        setTaskCache(task => ({ ...task, deadline: null, totalRepetitions: null }));
                                    }}
                                    style={{color: endRepeat === 'duration' || taskCache.totalDuration ? 'black' : 'lightgrey'}}
                                    className='text-left'
                                >After a total duration</button>
                                {(endRepeat === 'duration' || taskCache.totalDuration) ? <InputField 
                                    fieldName='totalDuration'
                                    placeholder='0'
                                    inputType='number'
                                    colour={mindsetColour}
                                    state={state}
                                    value={String(taskCache.totalDuration)}
                                    onChange={(event: any) => handleTaskCacheUpdate('totalDuration', Number(event.target.value))}
                                /> : <></>}
                            </div>
                            <div className='flex h-8 gap-2 items-center pl-2'>
                                <button 
                                    type='button'
                                    onClick={() => {setEndRepeat(endRepeat === 'repetitions' ? 'yes' : 'repetitions');
                                        setTaskCache(task => ({ ...task, deadline: null, totalDuration: null }));
                                    }}
                                    style={{color: endRepeat === 'repetitions' || taskCache.totalRepetitions ? 'black' : 'lightgrey'}}
                                    className='text-left'
                                >After a number of repetitions</button>
                                {(endRepeat === 'repetitions' || taskCache.totalRepetitions) ? <InputField 
                                    fieldName='totalRepetitions'
                                    placeholder='0'
                                    inputType='number'
                                    colour={mindsetColour}
                                    state={state}
                                    value={String(taskCache.totalRepetitions)}
                                    onChange={(event: any) => handleTaskCacheUpdate('totalRepetitions', Number(event.target.value))}
                                /> : <></>}
                            </div>
                        </>)}
                    </div>
                </>)}
                
                {(taskCache.fixed && !taskCache.repeat) && (<>
                    <div className='divider h-[1px] w-full bg-black/20'></div>
                    <div className='flex h-8 gap-2 items-center'>
                        <button
                            type='button' 
                            onClick={() => {setDeadline(!deadline)}}
                            style={{color: deadline ? 'black' : 'lightgrey'}}
                            className='font-medium formKeysColumn'>
                            Deadline
                        </button>
                        {deadline && <InputField 
                            fieldName='totalDuration'
                            placeholder='Deadline'
                            inputType='date'
                            colour={mindsetColour}
                            state={state}
                            value={String(taskCache.totalDuration)}
                        />}
                    </div>
                </>)}
                
            </div>
            {/* Notes and checklist panel */}
            <div className='w-[350px] flex flex-col task-card'>
                <div className='h-[25vh] border-b-[0.5px]'>
                    <NotesEditor notes={taskCache.notes || ''} taskId={taskCache.id} className={'task-card'} />
                </div>
                <div className='h-[25vh]'>
                    <ChecklistEditor checklist={taskCache.checklist || ''} taskId={taskCache.id} className={'task-card'} />
                </div>
            </div>
            
        </div>
        {/* Bottom bar */}
        <div className='flex justify-end items-center gap-4 p-4 h-12 border-t-[0.5px]'>
            { taskIsEdited ?
                <button 
                    type='reset' 
                    className='text-gray-400'
                    onClick={() => router.back()}>
                    Cancel time settings
                </button> : <></>
            }
            <Button type='submit' 
                className={`task-card h-8 text-black ${taskIsReady ? '' : 'bg-gray-300 cursor-not-allowed'}`}
                disabled={!taskIsReady}
                style={{ backgroundColor: taskIsReady ? mindsetColour : '' }}
                >{!task ? 'Add task' : 'Save'}
            </Button>
        </div>

        {/* Data to be sent to form without direct input */}
            <input type='hidden' name='id' id='id'  value={taskCache.id} />
            <input type='hidden' name='type' id='type'  value={'task'} />
            {/* task.fixed is sent based on startTime and endTime */}
    </form>
    </div>
    </div>);
}
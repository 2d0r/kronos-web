'use-client';

import React, { Dispatch, SetStateAction, useState } from 'react';
import { Dropdown, InputField, MultiSelectionField } from '@/components/form-fields';
import { Link } from 'lucide-react';
import { NEUTRAL_MINDSET_COLOUR, TaskWithRelations } from '@/lib/definitions';
import { addMinutesToDate, minutesBetweenDates } from '@/utils/dateUtils';
import { useRouter } from 'next/navigation';
import { usePathname, useSearchParams } from 'next/navigation';
import { TimeOfDay } from '@prisma/client';

interface TaskFormProps {
    taskCache: TaskWithRelations;
    setTaskCache: Dispatch<SetStateAction<TaskWithRelations>>;
    onTaskUpdate: () => void;
    dispatch: any; state: any;
    mindsetColour: string;
    handleTaskCacheUpdate: (fieldName: string, value: any) => void;
    handleDurationChange: (event: any, type: ('hours' | 'minutes')) => void;
}

export default function TaskForm({
    taskCache, onTaskUpdate, dispatch, state, mindsetColour,
    handleTaskCacheUpdate, handleDurationChange,
    setTaskCache,
} : TaskFormProps) {

    const pathname = usePathname();
    const router = useRouter();

    return (
    <div className='z-50 absolute w-full h-full left-0 top-0 flex items-center justify-center bg-black/20 backdrop-blur-sm py-4'>
        <div className='m-20 z-50 top-1/3 rounded-2xl bg-white shadow-2xl text-sm text-black overflow-hidden'>
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
                        value={taskCache?.name || ''}
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
                                handleTaskCacheUpdate('mindset', event.target.value);
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

                        {/* Duration */}
                        <div className='flex items-baseline'>
                            <div className='font-medium formKeysColumn'>Duration</div>
                            <InputField 
                                fieldName='durationHours'
                                inputType='number'
                                tail='hrs'
                                colour={mindsetColour}
                                state={state}
                                value={String(Math.floor(taskCache?.duration / 60)) || ''}
                                onChange={(event: any) => {handleDurationChange(event, 'hours')}}
                            />
                            <InputField 
                                fieldName='durationMinutes'
                                inputType='number'
                                tail='min'
                                colour={mindsetColour}
                                state={state}
                                value={String(taskCache?.duration % 60) || ''}
                                onChange={(event: any) => {handleDurationChange(event, 'minutes')}}
                            />
                        </div>

                        {/* Scheduled */}
                        <button 
                            type='button'
                            className='w-full flex my-2 font-medium'
                            onClick={() => {
                                setTaskCache(prevTask => ({ ...prevTask, fixed: !taskCache?.fixed, 
                                    startTime: !taskCache?.fixed ? null : taskCache?.startTime, 
                                    endTime: !taskCache?.fixed ? null : taskCache?.endTime,
                                }));
                            }}
                            style={{color: taskCache?.fixed ? 'black' : 'lightgrey'}}
                            >Scheduled
                        </button>
                        {taskCache?.fixed && (<>
                            <div className='flex items-center gap-2'>
                            <div className='flex flex-col gap-2'>
                                <InputField 
                                    fieldName='startTime'
                                    inputType='time'
                                    colour={mindsetColour}
                                    state={state}
                                    value={taskCache?.startTime instanceof Date ? 
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
                                        new Date(taskCache.startTime).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
                                    }
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
                                    value={taskCache?.endTime instanceof Date ? 
                                        taskCache.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '00:00'
                                    }
                                    onChange={(event: any) => handleTimeChanges(event, 'endTime')}
                                />
                                <InputField 
                                    fieldName='endDate'
                                    inputType='date'
                                    colour={mindsetColour}
                                    state={state}
                                    value={taskCache.endTime instanceof Date ? 
                                        new Date(taskCache.endTime).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
                                    }
                                    onChange={(event: any) => handleTimeChanges(event, 'endDate')}
                                />
                            </div>
                            </div>
                        </>)}
                        <div className={'divider'}></div>

                        {/* Repeat? */}
                        <button 
                            type='button'
                            className='w-full flex my-2 font-medium'
                            onClick={() => { setTaskCache(taskCache => ({
                                ...taskCache,
                                repeat: !taskCache?.repeat
                            }))}}
                            style={{color: taskCache?.repeat ? 'black' : 'lightgrey'}}
                        >Repeat</button>

                        {/* For repeating tasks */}
                        {taskCache?.repeat && (<div className=''>
                            <div className='flex mb-2 items-top *:mb-0 overflow-x-scroll items-center gap-2'>
                                {repeatUnit === 'sessions' ? (<>
                                    <InputField 
                                        fieldName='repeatFrequency'
                                        placeholder=''
                                        inputType='number'
                                        colour={mindsetColour}
                                        state={state}
                                        value={String(taskCache?.repeatFrequency || 0)}
                                        onChange={(event: any) => handleTaskCacheUpdate('repeatFrequency', Number(event.target.value) || 0)}
                                    />
                                </>) : (<>
                                    <InputField 
                                        fieldName='repeatDuration'
                                        placeholder=''
                                        inputType='number'
                                        colour={mindsetColour}
                                        state={state}
                                        value={String(taskCache?.repeatFrequency || 0)}
                                        onChange={(event: any) => handleTaskCacheUpdate('repeatFrequency', Number(event.target.value))}
                                    />
                                </>)}
                                time{taskCache?.repeatFrequency === 1 ? '' : 's'} every
                                {(taskCache?.repeatFrequency === 1) ? 
                                    <InputField 
                                        fieldName='repeatTimespanMultiplier'
                                        placeholder=''
                                        inputType='number'
                                        colour={mindsetColour}
                                        state={state}
                                        value={String(taskCache?.repeatTimespanMultiplier)}
                                        onChange={(event: any) => handleTaskCacheUpdate('repeatTimespanMultiplier', Number(event.target.value))}
                                    /> : <></>
                                }
                                <Dropdown 
                                    fieldName='repeatTimespan'
                                    prompt=''
                                    list={timeSpanList.filter(el => el.toLowerCase() !== 'hour')} // Removed hourly repetition
                                    defaultValue={taskCache?.repeatTimespan || 'Day'}
                                    onChange={(event: any) => handleTaskCacheUpdate('repeatTimespan', event.target.value)}
                                    colour={mindsetColour}
                                    state={state}
                                />
                            </div>
                        </div>)}

                        {/* Ideal start */}
                        {!taskCache?.fixed && (<>
                        <div className='divider'></div>
                        <div className='flex'>
                            <button 
                                type='button'
                                onClick={() => { 
                                    setIdealStart(!idealStart);
                                    setTaskCache(prevTask => ({ ...prevTask, startTime: null }));
                                }}
                                style={{color: idealStart || taskCache?.idealStart ? 'black' : 'lightgrey'}}
                                className='text-left cursor-pointer font-medium my-2 formKeysColumn'
                                >Ideal start
                            </button>
                            { (idealStart || taskCache?.idealStart) ? 
                            <InputField 
                                fieldName='idealStart'
                                placeholder='Enter start time'
                                inputType='time'
                                label=''
                                colour={mindsetColour}
                                state={state}
                                value={taskCache?.idealStart || ''}
                                onChange={(event: any) => {
                                    const timeBits = event.target.value.split(':');
                                    handleTaskCacheUpdate('idealStart', `${timeBits[0]}:${timeBits[1]}`);
                                }}
                            /> : <></>}
                        </div></>)}
                        
                        {/* Preferred times and days */}
                        {!taskCache?.fixed && (<>
                            {(!taskCache?.repeat || taskCache?.repeatTimespan !== 'hour') && (<>
                                <MultiSelectionField
                                    fieldName='preferredTimeOfDay'
                                    prompt='Preferred daytimes'
                                    list={timeOfDayList}
                                    type='checkbox'
                                    className='w-full-key'
                                    colour={mindsetColour}
                                    state={state}
                                    selected={taskCache?.preferredTimeOfDay || []}
                                    onChange={(value: string[]) => handleTaskCacheUpdate('preferredTimeOfDay', value as TimeOfDay[])}
                                />
                            </>)}
                            {(!taskCache?.repeat || (taskCache?.repeatTimespan !== 'hour' && taskCache?.repeatTimespan !== 'day')) && (<>
                                <MultiSelectionField 
                                    fieldName='preferredDayOfWeek'
                                    prompt='Preferred days'
                                    list={dayOfWeekList}
                                    type='checkbox'
                                    colour={mindsetColour}
                                    state={state}
                                    className='w-full-key'
                                    selected={taskCache?.preferredDayOfWeek || []}
                                    onChange={(value: string[]) => handleTaskCacheUpdate('preferredDayOfWeek', value as DayOfWeek[])}
                                />
                            </>)}
                        </>)}
                        {taskCache?.repeat && (<>
                            <div className={'divider'}></div>
                            <div className='flex flex-col gap-2'>
                                <button 
                                    type='button'
                                    className='w-full flex my-2 font-medium'
                                    onClick={() => {
                                        handleTaskCacheUpdate('endRepeat', !taskCache?.endRepeat);
                                        setTaskCache(prevTask => ({ ...prevTask, totalDuration: null, totalRepetitions: null, deadline: null }));
                                    }}
                                    style={{color: taskCache?.endRepeat ? 'black' : 'lightgrey'}}
                                >End repeat</button>
                                {(taskCache?.repeat && taskCache?.endRepeat) && (<>
                                    <div className='flex h-8 gap-2 items-center pl-2'>
                                        <button 
                                            type='button'
                                            onClick={() => {
                                                const newEndRepeat = endRepeat === 'date' ? 'yes' : 'date';
                                                setEndRepeat(newEndRepeat);
                                                setTaskCache(prevTask => ({ ...prevTask, totalDuration: null, totalRepetitions: null,
                                                    deadline: newEndRepeat === 'yes' ? null : prevTask.deadline,
                                                }));
                                            }}
                                            style={{color: endRepeat === 'date' || taskCache?.deadline ? 'black' : 'lightgrey'}}
                                            className='text-left'
                                        >On a date</button>
                                        {(endRepeat === 'date' || taskCache?.deadline) ? <InputField 
                                            fieldName='endRepeatDate'
                                            placeholder='End repeat on date'
                                            inputType='date'
                                            colour={mindsetColour}
                                            state={state}
                                            value={taskCache?.deadline?.toISOString().slice(0, 10) || ''}
                                            onChange={(event: any) => event.target.value && handleTaskCacheUpdate('deadline', parseISO(event.target.value))}
                                        /> : <></>}
                                    </div>
                                    <div className='flex h-8 gap-2 items-center text-left pl-2'>
                                        <button 
                                            type='button'
                                            onClick={() => {
                                                const newEndRepeat = endRepeat === 'duration' ? 'yes' : 'duration';
                                                setEndRepeat(newEndRepeat);
                                                setTaskCache(prevTask => ({ ...prevTask, deadline: null, totalRepetitions: null,
                                                    totalDuration: newEndRepeat === 'yes' ? null : prevTask.totalDuration,
                                                }));
                                            }}
                                            style={{color: endRepeat === 'duration' || taskCache?.totalDuration ? 'black' : 'lightgrey'}}
                                            className='text-left'
                                        >After a total duration</button>
                                        {(endRepeat === 'duration' || taskCache?.totalDuration) ? <InputField 
                                            fieldName='totalDuration'
                                            placeholder='0'
                                            inputType='number'
                                            colour={mindsetColour}
                                            state={state}
                                            value={String(taskCache?.totalDuration) || ''}
                                            onChange={(event: any) => handleTaskCacheUpdate('totalDuration', Number(event.target.value))}
                                        /> : <></>}
                                    </div>
                                    <div className='flex h-8 gap-2 items-center pl-2'>
                                        <button 
                                            type='button'
                                            onClick={() => {
                                                const newEndRepeat = endRepeat === 'repetitions' ? 'yes' : 'repetitions';
                                                setEndRepeat(newEndRepeat);
                                                setTaskCache(prevTask => ({ ...prevTask, deadline: null, totalDuration: null,
                                                    totalRepetitions: newEndRepeat === 'yes' ? null : prevTask.totalRepetitions,
                                                }));
                                            }}
                                            style={{color: endRepeat === 'repetitions' || taskCache?.totalRepetitions ? 'black' : 'lightgrey'}}
                                            className='text-left'
                                        >After a number of repetitions</button>
                                        {(endRepeat === 'repetitions' || taskCache?.totalRepetitions) ? <InputField 
                                            fieldName='totalRepetitions'
                                            placeholder='0'
                                            inputType='number'
                                            colour={mindsetColour}
                                            state={state}
                                            value={String(taskCache?.totalRepetitions) || ''}
                                            onChange={(event: any) => handleTaskCacheUpdate('totalRepetitions', Number(event.target.value))}
                                        /> : <></>}
                                    </div>
                                </>)}
                            </div>
                        </>)}
                        
                        {(taskCache?.fixed && !taskCache?.repeat) && (<>
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
                                    value={String(taskCache?.totalDuration) || ''}
                                />}
                            </div>
                        </>)}
                        
                    </div>

                    {/* Notes and checklist panel */}
                    <div className='w-[350px] flex flex-col task-card'>
                        <div className=''>
                            <EventSection event={taskCache?.events?.filter(el => el.id === eventId)[0] || {} as Event} mindsetColour={mindsetColour} />
                        </div>
                        <div className='h-[25vh] border-b-[0.5px] overflow-y-scroll'>
                            <NotesEditor notes={taskCache?.notes || ''} taskId={taskCache?.id} className={'task-card'} />
                        </div>
                        <div className='h-[25vh]'>
                            <ChecklistEditor checklist={taskCache?.checklist || ''} taskId={taskCache?.id} className={'task-card'} />
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
                            task?.id && handleDeleteTask(task.id);
                        }}
                        >Delete task
                    </button>
                    <div className='flex gap-4'>
                        { taskIsEdited && !isNewTask ?
                            <button 
                                type='reset' 
                                className='text-gray-400'
                                onClick={() => task && setTaskCache(task)}
                                >
                                Cancel changes
                            </button> : <></>
                        }
                        <Button type='submit' 
                            className={`task-card h-8 text-black ${taskIsReady ? '' : 'bg-gray-300 cursor-not-allowed'}`}
                            disabled={!taskIsReady}
                            style={{ backgroundColor: taskIsReady ? mindsetColour : '' }}
                            onClick={handleTaskSubmit}
                            >{isNewTask ? 'Add task' : 'Save'}
                        </Button>
                    </div>
                </div>

                {/* Data to be sent to form without direct input */}
                    <input type='hidden' name='id' id='id'  value={taskCache?.id || ''} />
                    <input type='hidden' name='type' id='type'  value={'task'} />
                    <input type='hidden' name='repeat' id='repeat' value={String(taskCache?.repeat) || 'false'} />
                    {/* task.fixed is sent based on startTime and endTime */}
            </form>
        </div>
    </div>
    );
}

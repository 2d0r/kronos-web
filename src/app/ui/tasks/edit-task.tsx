'use client';

import { useState, useEffect } from 'react';
import { useFormState } from 'react-dom';
import Button from '@/components/button';
import { Dropdown, InputField, MultiSelectionField } from './form-fields';
import { priorityList, dayOfWeekList, timeOfDayList, timeSpanList, NEUTRAL_MINDSET_COLOUR, TaskWithRelations, DEFAULT_MINDSET } from '@/app/lib/definitions';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mindset, TimeSpan } from '@prisma/client';
import { adjustLightness } from '@/app/utils/colourUtils';
import { useRouter } from 'next/navigation';
import { editTaskPrisma } from '@/app/lib/actions';
import { parseISO } from 'date-fns';


export default function EditTask({task, mindsets} : {task: TaskWithRelations, mindsets: Mindset[]}) {
    const initialState = { message: null, errors: {} };
    const editTaskHere : any = editTaskPrisma;
    const [state, dispatch] = useFormState(editTaskHere, initialState);

    const pathname = usePathname();
    const router = useRouter();

    const [ taskCache, setTaskCache ] = useState<TaskWithRelations>(task);
    const [endRepeat, setEndRepeat] = useState<(string | null)>('No');
    const [repeatUnit, setRepeatUnit] = useState<string | null>('sessions');
    const [selectedMindset, setSelectedMindset] = useState<string | null>(null);
    // const [ inFocus, setInFocus ] = useState<string>('');
    const [ mindsetColour, setMindsetColour] = useState<string>(taskCache.mindset?.colour || NEUTRAL_MINDSET_COLOUR);
    const [ deadline, setDeadline ] = useState<boolean>(false);


    const handleTaskCacheUpdate = (field: keyof TaskWithRelations, value: any) => {
        setTaskCache(taskCache => ({
            ...taskCache,
            [field]: value,
        }));
    }

    // useEffect(() => {
    //     setMindsetColour(mindsets.filter(el => el.name === selectedMindset)[0]?.colour || NEUTRAL_MINDSET_COLOUR);
    // }, [selectedMindset]);
    

    return (<div className='z-50 absolute w-full h-full left-0 top-0 flex items-start justify-center overflow-y-scroll bg-black/20 backdrop-blur-sm py-4'>
    <div className='z-50 absolute top-1/3 rounded-2xl bg-white p-4 md:p-6 w-[350px] overflow-x-hidden shadow-2xl shadow-slate-500 text-sm text-black'>
        <div className='w-full flex justify-between items-center pb-4'>
            <div className='w-8 h-8'></div>
            <div className='text-sm text-slate-400'>Edit task</div>
            <Link href={pathname} onClick={() => router.back()} >
                <img src='../icons/close-black.svg' className='w-8 h-8'/>
            </Link>
        </div>
        <form action={dispatch}>
            <div className='flex flex-col justify-start gap-6'>
                <input type='hidden' name='id' id='id'  value={taskCache.id} />
                <InputField 
                    fieldName='name'
                    placeholder='Enter task name'
                    inputType='string'
                    className={`!border-0 !text-xl font-bold placeholder:text-lg pl-0 cursor-text !bg-transparent rounded-none`}
                    colour={mindsetColour}
                    state={state}
                    value={taskCache.name}
                    onChange={(event: any) => handleTaskCacheUpdate('name', event.target.value)}
                />
                <Dropdown 
                    fieldName='mindset'
                    prompt='Pick a mindset'
                    label='Mindset'
                    list={mindsets.map(el => el.name)}
                    onChange={(event: any) => handleTaskCacheUpdate('mindset', event.target.value)}
                    defaultValue={taskCache.mindset?.name || DEFAULT_MINDSET}
                    colour={mindsetColour}
                    state={state}
                />
                <Dropdown 
                        fieldName='priority'
                        prompt='Pick a priority'
                        label='Priority'
                        list={priorityList}
                        onChange={(event: any) => handleTaskCacheUpdate('priority', event.target.value)}
                        defaultValue={taskCache.priority}
                        colour={mindsetColour}
                        state={state}
                    />
                {/* <SelectionField 
                    fieldName='isScheduled'
                    prompt=''
                    list={['Scheduled', 'Flexible']}
                    type='radio'
                    colour={mindsetColour}
                    collapse={false}
                    state={state}
                    defaultSelected={taskCache.fixed ? ['Scheduled'] : ['Flexible']}
                /> */}
                <button 
                    type='button'
                    className='w-full flex mb-2 font-medium'
                    onClick={() => {
                        setTaskCache(taskCache => ({
                            ...taskCache,
                            fixed: !taskCache.fixed
                        }))
                    }}
                    style={{color: taskCache.fixed ? 'black' : 'lightgrey'}}
                >Scheduled</button>
                {taskCache.fixed && (<>
                    <div className='flex items-center gap-2'>
                    <div className='flex flex-col gap-2'>
                        <InputField 
                            fieldName='startTime'
                            placeholder='Enter start time'
                            inputType='time'
                            colour={mindsetColour}
                            state={state}
                            value={taskCache.startTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        />
                        <InputField 
                            fieldName='startDate'
                            placeholder='Enter start date'
                            inputType='date'
                            colour={mindsetColour}
                            state={state}
                            value={taskCache.startTime?.toISOString().slice(0, 10)}
                        />
                    </div>
                    {'→'}
                    <div className='flex flex-col justify-start gap-2'>
                    <InputField 
                        fieldName='endTime'
                        placeholder='Enter end time'
                        inputType='time'
                        colour={mindsetColour}
                        state={state}
                        value={taskCache.endTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    />
                    <InputField 
                        fieldName='endDate'
                        placeholder='Enter end date'
                        inputType='date'
                        colour={mindsetColour}
                        state={state}
                        value={taskCache.endTime?.toISOString().slice(0, 10)}
                    />
                    </div>
                    </div>
                </>)}

                {!taskCache.fixed && (<>
                    <InputField 
                        fieldName='durationMinutes'
                        placeholder='30'
                        inputType='number'
                        label='Duration'
                        tail='minutes'
                        colour={mindsetColour}
                        state={state}
                        value={String(taskCache.duration)}
                        onChange={(event: any) => handleTaskCacheUpdate('duration', Number(event.target.value))}
                    />
                    <InputField 
                        fieldName='idealStartTime'
                        placeholder='Enter start time'
                        inputType='time'
                        label='Ideal start'
                        colour={mindsetColour}
                        state={state}
                        value={taskCache.endTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    />
                </>)}
                <div className={'divider h-[1px] w-full bg-black/20'}></div>
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
                    className='w-full flex mb-2 font-medium'
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
                        <div className='divider h-[1px] w-full bg-black/20'></div>
                        <MultiSelectionField
                            fieldName='preferredTimeOfDay'
                            prompt='Preferred hours'
                            list={timeOfDayList}
                            type='checkbox'
                            className='multi-line w-full-key'
                            colour={mindsetColour}
                            state={state}
                            defaultSelected={taskCache.preferredTimeOfDay}
                            onChange={(event: any) => handleTaskCacheUpdate('preferredTimeOfDay', Number(event.target.value))}
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
                        />
                    </>)}
                </>)}
                {taskCache.repeat && (<>
                    <div className={'divider h-[1px] w-full bg-black/20'}></div>
                    <div className='flex flex-col gap-2'>
                        {/* <SelectionField 
                            fieldName='endRepeat'
                            prompt='End Repeat?'
                            list={['No', 'Yes']}
                            type='radio'
                            onChange={handleEndRepeatToggle}
                            defaultSelected={['No']}
                            colour={mindsetColour}
                        /> */}
                        <button className='w-full flex mb-2 font-medium'
                                onClick={() => {handleTaskCacheUpdate('endRepeat', !taskCache.endRepeat)}}
                                style={{color: taskCache.endRepeat ? 'black' : 'lightgrey'}}
                        >End repeat</button>
                        {(taskCache.repeat && taskCache.endRepeat) && (<>
                            <div className='flex h-8 gap-2 items-center pl-2'>
                                <button 
                                    onClick={() => {setEndRepeat(endRepeat === 'Date' ? 'Yes' : 'Date')}}
                                    style={{color: endRepeat === 'Date' ? 'black' : 'lightgrey'}}
                                >On a date</button>
                                {endRepeat === 'Date' && <InputField 
                                    fieldName='endRepeatDate'
                                    placeholder='End repeat on date'
                                    inputType='date'
                                    colour={mindsetColour}
                                    state={state}
                                    value={taskCache.deadline?.toISOString().slice(0, 10)}
                                    onChange={(event: any) => event.target.value && handleTaskCacheUpdate('deadline', parseISO(event.target.value))}
                                />}
                            </div>
                            <div className='flex h-8 gap-2 items-center text-left pl-2'>
                                <button 
                                    onClick={() => {setEndRepeat(endRepeat === 'Duration' ? 'Yes' : 'Duration')}}
                                    style={{color: endRepeat === 'Duration' ? 'black' : 'lightgrey'}}
                                    className='text-left formKeysColumn'
                                >After a total duration</button>
                                {taskCache.totalDuration && <InputField 
                                    fieldName='totalDuration'
                                    placeholder='Deadline'
                                    inputType='number'
                                    colour={mindsetColour}
                                    state={state}
                                    value={String(taskCache.totalDuration)}
                                />}
                            </div>
                            <div className='flex h-8 gap-2 items-center pl-2'>
                                <button 
                                    type='button'
                                    onClick={() => {setEndRepeat(endRepeat === 'Repetitions' ? 'Yes' : 'Repetitions')}}
                                    style={{color: endRepeat === 'Repetitions' ? 'black' : 'lightgrey'}}
                                    className='text-left formKeysColumn'
                                >After a number of repetitions</button>
                                {taskCache.totalRepetitions && <InputField 
                                    fieldName='totalRepetitions'
                                    placeholder=''
                                    inputType='number'
                                    colour={mindsetColour}
                                    state={state}
                                    value={String(taskCache.totalRepetitions)}
                                />}
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
                            className='font-medium formKeysColumn'
                        >Deadline</button>
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
            <div className='flex justify-center gap-4 mt-8'>
                <Button type='submit' 
                    className={`h-10 hover:bg-[${adjustLightness(mindsetColour, -0.2)}]`} 
                    style={{background: mindsetColour}}>Save</Button>
            </div>
        </form>
    </div>
    </div>);
}
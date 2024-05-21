'use client';

import { useState, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { createTaskPrisma} from '@/app/lib/actions';
import Button from '@/components/button';
import { Dropdown, InputField, MultiSelectionField, SelectionField } from './form-fields';
import { priorityList, dayOfWeekList, timeOfDayList, timeSpanList, statusList, repeatUnitList, DEFAULT_MINDSET_LIST, NEUTRAL_MINDSET_COLOUR, DEFAULT_MINDSET } from '@/app/lib/definitions';
import { getMindsetNames } from '@/app/lib/data';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { setPriority } from 'os';
import { Mindset } from '@prisma/client';
import { adjustLightness } from '@/app/utils/colourUtils';
import { useRouter } from 'next/navigation';


export default function CreateTask({mindsets} : {mindsets: Mindset[]}) {
    const initialState = { message: null, errors: {} };
    const createTaskHere : any = createTaskPrisma;
    const [state, dispatch] = useFormState(createTaskHere, initialState);

    const pathname = usePathname();
    const router = useRouter();

    const [taskName, setTaskName] = useState<string | null>(null);
    const [priority, setPriority] = useState<string | null>(null);
    const [isScheduled, setIsScheduled] = useState<'Scheduled' | 'Flexible'>('Flexible');
    const [repeatFrequency, setRepeatFrequency] = useState<number | null>(null);
    const [timespanList, setTimespanList] = useState<string[]>(timeSpanList);
    const [repeatTimespan, setRepeatTimespan] = useState<string>('');
    const [repeatToggle, setrepeatToggle] = useState<'Repeat' | 'One time' | null>(null);
    const [endRepeat, setEndRepeat] = useState<(string | null)>('No');
    const [repeatUnit, setRepeatUnit] = useState<string | null>('sessions');
    const [selectedMindset, setSelectedMindset] = useState<string | null>(null);
    const [ inFocus, setInFocus ] = useState<string>('');
    const [ mindsetColour, setMindsetColour] = useState<string>(NEUTRAL_MINDSET_COLOUR);
    const [ deadline, setDeadline ] = useState<boolean>(false);

    const handleTaskNameInput = (event : React.ChangeEvent<HTMLSelectElement>) => {
        setTaskName(event.target.value ? event.target.value : null);
    }
    const handleMindsetSelect = (event : React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedMindset(event.target.value ? event.target.value : null);
    }
    const handleSetPriority = (event : React.ChangeEvent<HTMLSelectElement>) => {
        setPriority(event.target.value ? event.target.value : null);
    }
    // const handleScheduledToggle = (event : React.ChangeEvent<HTMLInputElement>) => {
    //     setIsScheduled(event.target.value);
    // }
    const handleScheduledToggle = (value : ('Scheduled' | 'Flexible')) => {
        setIsScheduled(value);
    }
    // const handleRepeatToggle = (event : React.ChangeEvent<HTMLInputElement>) => {
    //     setrepeatToggle(event.target.value);
    //     if (repeatToggle !== 'Repeat') {
    //         setRepeatTimespan('');
    //     }
    // }
    const handleRepeatToggle = (value: ('Repeat' | 'One time' | null)) => {
        setrepeatToggle(value);
        if (value !== 'Repeat') {
            setRepeatTimespan('');
        }
    }
    const handleRepeatFrequency = (event : React.ChangeEvent<HTMLInputElement>) => {
        const newRepeatFrequency = Number(event.target.value);
        setRepeatFrequency(newRepeatFrequency);
        setTimespanList(newRepeatFrequency !== 1 ? timeSpanList : timeSpanList.map(item => `${item}s`) )
    }
    const handleEndRepeatToggle = (event : React.ChangeEvent<HTMLInputElement>) => {
        setEndRepeat(event.target.value);
    }
    const handleRepeatTimespanToggle = (event : React.ChangeEvent<HTMLInputElement>) => {
        setRepeatTimespan(event.target.value);
    }
    const handleTimespanMultiplierInput = (event : React.ChangeEvent<HTMLInputElement>) => {
        setTimespanList(event.target.value !== '1' ? timeSpanList.map(item => `${item}s`) : timeSpanList);
    }
    const handleRepeatUnitSelect = (event : React.ChangeEvent<HTMLSelectElement>) => {
        setRepeatUnit(event.target.value ? event.target.value : 'sessions');
    }

    useEffect(() => {
        setMindsetColour(mindsets.filter(el => el.name === selectedMindset)[0]?.colour || NEUTRAL_MINDSET_COLOUR);
    }, [selectedMindset]);
    

    return (<div className='z-50 absolute w-full h-full left-0 top-0 flex items-start justify-center overflow-y-scroll bg-black/20 backdrop-blur-sm py-4'>
    <div className='z-50 absolute top-1/3 rounded-2xl bg-white p-4 md:p-6 w-[350px] overflow-x-hidden shadow-2xl shadow-slate-500 text-sm text-black'>
        <div className='w-full flex justify-between items-center pb-4'>
            <div className='w-8 h-8'></div>
            <div className='text-lg'>Add task</div>
            <Link href={pathname} onClick={() => router.back()} >
                <img src='../icons/close-black.svg' className='w-8 h-8'/>
            </Link>
        </div>
        <form action={dispatch}
            // onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
            //     event.preventDefault(); // Prevent default form submission
            //     const formData = new FormData(event.target as HTMLFormElement); // Access the form element
            //     console.log('Duration:', formData.getAll('duration'));  
            //     // console.log('Preferred Day of Week:', formData.get('startTime')); 
            // }}
        >
            <div className='flex flex-col justify-start gap-6'>
                <InputField 
                    fieldName='name'
                    placeholder='Enter task name'
                    inputType='string'
                    className={`!border-0 !text-lg placeholder:text-lg pl-0 cursor-text !bg-transparent rounded-none`}
                    onChange={handleTaskNameInput}
                    colour={mindsetColour}
                    state={state}
                />
                {taskName && 
                    // <SelectionField 
                    //     fieldName='mindset'
                    //     prompt='Mindset'
                    //     list={mindsets.map(el => el.name)}
                    //     onChange={handleMindsetSelect}
                    //     colour={mindsetColour}
                    //     type='radio'
                    //     state={state}
                    //     className='multi-line'
                    // />
                    <Dropdown 
                        fieldName='mindset'
                        prompt='Pick a mindset'
                        label='Mindset'
                        list={mindsets.map(el => el.name)}
                        onChange={handleMindsetSelect}
                        defaultValue={''}
                        colour={mindsetColour}
                        state={state}
                    />
                }
                { selectedMindset !== null && (<>
                    {/* <SelectionField 
                        fieldName='priority'
                        prompt='Priority'
                        list={priorityList}
                        type='radio'
                        onChange={handleSetPriority}
                        colour={mindsetColour}
                        state={state}
                    /> */}
                    <Dropdown 
                        fieldName='priority'
                        prompt='Pick a priority'
                        label='Priority'
                        list={priorityList}
                        onChange={handleSetPriority}
                        defaultValue={''}
                        colour={mindsetColour}
                        state={state}
                    />
                    {priority && 
                    // <SelectionField 
                    //     fieldName='isScheduled'
                    //     prompt=''
                    //     list={['Scheduled', 'Flexible']}
                    //     type='radio'
                    //     onChange={handleScheduledToggle}
                    //     colour={mindsetColour}
                    //     collapse={false}
                    //     state={state}
                    // />
                    <button 
                        type='button'
                        className='w-full flex mb-2 font-medium'
                        onClick={() => {handleScheduledToggle(isScheduled === 'Scheduled' ? 'Flexible' : 'Scheduled')}}
                        style={{color: ['Flexible', null].includes(isScheduled) ? 'lightgrey' : 'black'}}
                    >Scheduled</button>}
                    {isScheduled === 'Scheduled' && (<>
                        <div className='flex items-center gap-2'>
                        <div className='flex flex-col gap-2'>
                            <InputField 
                                fieldName='startTime'
                                placeholder='Enter start time'
                                inputType='time'
                                colour={mindsetColour}
                                state={state}
                            />
                            <InputField 
                                fieldName='startDate'
                                placeholder='Enter start date'
                                inputType='date'
                                colour={mindsetColour}
                                state={state}
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
                        />
                        <InputField 
                            fieldName='endDate'
                            placeholder='Enter end date'
                            inputType='date'
                            colour={mindsetColour}
                            state={state}
                        />
                        </div>
                        </div>
                    </>)}

                    {(priority && isScheduled === 'Flexible') && (<>
                        <InputField 
                            fieldName='duration'
                            placeholder='30'
                            inputType='number'
                            label='Duration'
                            tail='minutes'
                            colour={mindsetColour}
                            state={state}
                        />
                        <InputField 
                            fieldName='idealStartTime'
                            placeholder='Enter start time'
                            inputType='time'
                            label='Ideal start'
                            colour={mindsetColour}
                            state={state}
                        />
                    </>)}
                    { priority && <>
                        <div className={'divider h-[1px] w-full bg-black/20'}></div>
                        {/* <SelectionField 
                            fieldName='repeat'
                            prompt=''
                            list={['One time', 'Repeat']}
                            type='radio'
                            onChange={handleRepeatToggle}
                            colour={mindsetColour}
                            collapse={false}
                            state={state}
                        /> */}
                        <button 
                            type='button'
                            className='w-full flex mb-2 font-medium'
                            onClick={() => {handleRepeatToggle(repeatToggle === 'Repeat' ? 'One time' : 'Repeat')}}
                            style={{color: ['One time', null].includes(repeatToggle) ? 'lightgrey' : 'black'}}
                        >Repeat</button>
                    </>}
                    
                    {repeatToggle === 'Repeat' && (<div className=''>
                        <div className='flex mb-2 items-top *:mb-0 overflow-x-scroll items-center gap-2'>
                            {repeatUnit === 'sessions' ? (<>
                                <InputField 
                                    fieldName='repeatFrequency'
                                    placeholder=''
                                    inputType='number'
                                    onChange={handleRepeatFrequency}
                                    colour={mindsetColour}
                                    state={state}
                                />
                            </>) : (<>
                                <InputField 
                                    fieldName='repeatDuration'
                                    placeholder='10'
                                    inputType='number'
                                    colour={mindsetColour}
                                    state={state}
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
                            time{repeatFrequency === 1 ? '' : 's'} every
                            {(repeatFrequency && repeatFrequency === 1) ? 
                                <InputField 
                                    fieldName='repeatTimespanMultiplier'
                                    placeholder=''
                                    inputType='number'
                                    onChange={handleTimespanMultiplierInput}
                                    colour={mindsetColour}
                                    state={state}
                                /> : <></>
                            }
                            <Dropdown 
                                fieldName='repeatTimespan'
                                prompt=''
                                list={timespanList}
                                onChange={handleRepeatTimespanToggle}
                                defaultValue='Day'
                                colour={mindsetColour}
                                state={state}
                            />
                        </div>
                    </div>)}
                    {(repeatToggle && isScheduled !== 'Scheduled' && (repeatTimespan !== '' || repeatToggle !== 'Repeat')) && (<>
                        {(repeatToggle !== 'Repeat' || !['hour'].includes(repeatTimespan)) && (<>
                            <div className='divider h-[1px] w-full bg-black/20'></div>
                            <MultiSelectionField
                                fieldName='preferredTimeOfDay'
                                prompt='Preferred time of day'
                                list={timeOfDayList}
                                type='checkbox'
                                className='multi-line w-full-key'
                                colour={mindsetColour}
                                state={state}
                            />
                        </>)}
                        {(repeatToggle !== 'Repeat' || !['hour', 'day'].includes(repeatTimespan)) && (<>
                            <MultiSelectionField 
                                fieldName='preferredDayOfWeek'
                                prompt='Preferred days of the week'
                                list={dayOfWeekList}
                                type='checkbox'
                                colour={mindsetColour}
                                state={state}
                                className='w-full-key'
                            />
                        </>)}
                    </>)}
                    {repeatToggle === 'Repeat' && (<>
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
                            <button type='button'
                                className='w-full flex mb-2 font-medium'
                                onClick={() => {setEndRepeat(endRepeat === 'No' ? 'Yes' : 'No')}}
                                style={{color: ['No', null].includes(endRepeat) ? 'lightgrey' : 'black'}}
                            >End repeat</button>
                            {(repeatToggle === 'Repeat' && endRepeat !== 'No' && endRepeat !== null) && (<>
                                <div className='flex h-8 gap-2 items-center pl-2'>
                                    <button 
                                        type='button'
                                        onClick={() => {setEndRepeat(endRepeat === 'Date' ? 'Yes' : 'Date')}}
                                        style={{color: endRepeat === 'Date' ? 'black' : 'lightgrey'}}
                                    >On a date</button>
                                    {endRepeat === 'Date' && <InputField 
                                        fieldName='endRepeatDate'
                                        placeholder='End repeat on date'
                                        inputType='date'
                                        colour={mindsetColour}
                                        state={state}
                                    />}
                                </div>
                                <div className='flex h-8 gap-2 items-center text-left pl-2'>
                                    <button 
                                        type='button'
                                        onClick={() => {setEndRepeat(endRepeat === 'Duration' ? 'Yes' : 'Duration')}}
                                        style={{color: endRepeat === 'Duration' ? 'black' : 'lightgrey'}}
                                        className='text-left'
                                    >After a total duration</button>
                                    {endRepeat === 'Duration' && <InputField 
                                        fieldName='totalDuration'
                                        placeholder='Total duration'
                                        inputType='number'
                                        colour={mindsetColour}
                                        state={state}
                                        className='w-auto'
                                    />}
                                </div>
                                <div className='flex h-8 gap-2 items-center pl-2'>
                                    <button 
                                        type='button'
                                        onClick={() => {setEndRepeat(endRepeat === 'Repetitions' ? 'Yes' : 'Repetitions')}}
                                        style={{color: endRepeat === 'Repetitions' ? 'black' : 'lightgrey'}}
                                        className='text-left'
                                    >After a number of repetitions</button>
                                    {endRepeat === 'Repetitions' && <InputField 
                                        fieldName='totalRepetitions'
                                        placeholder=''
                                        inputType='number'
                                        colour={mindsetColour}
                                        state={state}
                                    />}
                                </div>
                            </>)}
                        </div>
                    </>)}
                    
                    {(isScheduled && repeatToggle && repeatToggle !== 'Repeat') && (<>
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
                            />}
                        </div>
                    </>)}
                </>)}
            </div>
            { repeatToggle &&
                <div className='flex justify-center gap-4 mt-8'>
                    <Button 
                        type='submit' 
                        className={`h-10 hover:bg-[${adjustLightness(mindsetColour, -0.2)}]`} 
                        style={{background: mindsetColour}}>Add</Button>
                </div>
            }
        </form>
    </div>
    </div>);
}
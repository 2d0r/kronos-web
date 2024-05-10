'use client';

import { useState, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { createTaskPrisma} from '@/app/lib/actions';
import Button from '@/components/button';
import { Dropdown, InputField, MultiSelectionField, SelectionField } from './form-fields';
import { priorityList, dayOfWeekList, timeOfDayList, timeSpanList, statusList, repeatUnitList, DEFAULT_MINDSET_LIST, NEUTRAL_MINDSET_COLOUR } from '@/app/lib/definitions';
import { getMindsetNames } from '@/app/lib/data';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { setPriority } from 'os';
import { Mindset } from '@prisma/client';
import { adjustLightness } from '@/app/utils/colourUtils';


export default function CreateTask({mindsets} : {mindsets: Mindset[]}) {
    const pathname = usePathname();
    const initialState = { message: null, errors: {} };
    const createTaskHere : any = createTaskPrisma;
    const [state, dispatch] = useFormState(createTaskHere, initialState);
    const [taskName, setTaskName] = useState<string | null>(null);
    const [priority, setPriority] = useState<string | null>(null);
    const [isScheduled, setIsScheduled] = useState<string | null>(null);
    const [repeatFrequency, setRepeatFrequency] = useState<number | null>(null);
    const [timespanList, setTimespanList] = useState<string[]>(timeSpanList);
    const [repeatTimespan, setRepeatTimespan] = useState<string>('');
    const [chosenRepeat, setChosenRepeat] = useState<string | null>(null);
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
    const handleScheduledToggle = (event : React.ChangeEvent<HTMLInputElement>) => {
        setIsScheduled(event.target.value);
    }
    const handleRepeatToggle = (event : React.ChangeEvent<HTMLInputElement>) => {
        setChosenRepeat(event.target.value);
        if (chosenRepeat !== 'Repeat') {
            setRepeatTimespan('');
        }
    }
    const handleRepeatFrequency = (event : React.ChangeEvent<HTMLInputElement>) => {
        setRepeatFrequency(Number(event.target.value));
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
    

    return (<div className='z-50 absolute w-full h-full left-0 top-0 flex items-start justify-center overflow-y-scroll backdrop-blur-sm py-4'>
    <div className='z-50 absolute top-1/3 rounded-2xl bg-white p-4 md:p-6 w-1/3 min-w-80 overflow-x-hidden shadow-2xl shadow-slate-500 text-sm text-black'>
        <div className='w-full flex justify-between items-center pb-4'>
            <div className='w-8 h-8'></div>
            <div className='text-lg'>Add task</div>
            <Link href={pathname} >
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
                />
                {taskName && 
                    <SelectionField 
                        fieldName='mindset'
                        prompt='Mindset'
                        list={mindsets.map(el => el.name)}
                        onChange={handleMindsetSelect}
                        colour={mindsetColour}
                        type='radio'
                />}
                { selectedMindset !== null && (<>
                    {/* <SelectionField 
                        fieldName='status'
                        prompt='Status'
                        list={statusList}
                        type='radio'
                        defaultSelected={[statusList[0]]}
                    /> */}
                    <SelectionField 
                        fieldName='priority'
                        prompt='Priority'
                        list={priorityList}
                        type='radio'
                        onChange={handleSetPriority}
                        colour={mindsetColour}
                    />
                    {priority && <SelectionField 
                        fieldName='isScheduled'
                        prompt=''
                        list={['Scheduled', 'Flexible']}
                        type='radio'
                        onChange={handleScheduledToggle}
                        colour={mindsetColour}
                        collapse={false}
                    />}
                    {isScheduled === 'Scheduled' && (<>
                        <div className='flex items-center gap-2'>
                        <div className='flex flex-col'>
                            <InputField 
                                fieldName='startTime'
                                placeholder='Enter start time'
                                inputType='time'
                                colour={mindsetColour}
                            />
                            <InputField 
                                fieldName='startDate'
                                placeholder='Enter start date'
                                inputType='date'
                                colour={mindsetColour}
                            />
                        </div>
                        {'>'}
                        <div className='flex flex-col justify-start'>
                        <InputField 
                            fieldName='endTime'
                            placeholder='Enter end time'
                            inputType='time'
                            colour={mindsetColour}
                        />
                        <InputField 
                            fieldName='endDate'
                            placeholder='Enter end date'
                            inputType='date'
                            colour={mindsetColour}
                        />
                        </div>
                        </div>
                    </>)}

                    {isScheduled === 'Flexible' && (<>
                        <InputField 
                            fieldName='duration'
                            placeholder='30'
                            inputType='number'
                            label='Ideal duration'
                            tail='minutes'
                            colour={mindsetColour}
                        />
                        <InputField 
                            fieldName='idealStartTime'
                            placeholder='Enter start time'
                            inputType='time'
                            label='Ideal start'
                            colour={mindsetColour}
                        />
                    </>)}
                    { isScheduled && <>
                        <div className={`divider h-[1px] w-full`} style={{background: mindsetColour}}></div>
                        <SelectionField 
                            fieldName='repeat'
                            prompt=''
                            list={['One time', 'Repeat']}
                            type='radio'
                            onChange={handleRepeatToggle}
                            colour={mindsetColour}
                            collapse={false}
                        />
                    </>
                    }
                    
                    {chosenRepeat === 'Repeat' && (<div className=''>
                        <div className='flex gap-2 mb-2 items-top *:mb-0 overflow-x-scroll'>
                        {repeatUnit === 'sessions' ? (<>
                            <InputField 
                                fieldName='repeatFrequency'
                                placeholder='1'
                                inputType='number'
                                onChange={handleRepeatFrequency}
                                colour={mindsetColour}
                            />
                        </>) : (<>
                            <InputField 
                                fieldName='repeatDuration'
                                placeholder='10'
                                inputType='number'
                                colour={mindsetColour}
                            />
                        </>)}
                        <Dropdown 
                            fieldName='repeatUnit'
                            prompt=''
                            list={(((repeatUnit && repeatUnit.includes('session') && repeatFrequency && repeatFrequency !== 1) || (repeatUnit && repeatUnit.includes('minute'))) ? repeatUnitList : 
                                repeatUnitList.map(item => item.slice(0, item.length - 1))) as [string, ...string[]]}
                            defaultValue='sessions'
                            onChange={handleRepeatUnitSelect}
                            colour={mindsetColour}
                        />
                        </div>
                        <div className='flex gap-2 mb-4 items-top *:mb-0 overflow-x-scroll'>
                        <InputField 
                            fieldName='repeatTimespanMultiplier'
                            label = 'Every'
                            placeholder='1'
                            inputType='number'
                            onChange={handleTimespanMultiplierInput}
                            colour={mindsetColour}
                        />
                        <Dropdown 
                            fieldName='repeatTimespan'
                            prompt=''
                            list={timespanList}
                            onChange={handleRepeatTimespanToggle}
                            defaultValue='Day'
                            colour={mindsetColour}
                        />
                        </div>
                    </div>)}
                    {(chosenRepeat && isScheduled !== 'Scheduled' && (repeatTimespan !== '' || chosenRepeat !== 'Repeat')) && (<>
                        {(chosenRepeat !== 'Repeat' || !['hour'].includes(repeatTimespan)) && (<>
                            <div className='divider h-[1px] w-full' style={{background: mindsetColour}}></div>
                            <MultiSelectionField
                                fieldName='preferredTimeOfDay'
                                prompt='Preferred time of day'
                                list={timeOfDayList}
                                type='checkbox'
                                className='multi-line'
                                colour={mindsetColour}
                            />
                        </>)}
                        {(chosenRepeat !== 'Repeat' || !['hour', 'day'].includes(repeatTimespan)) && (<>
                            <MultiSelectionField 
                                fieldName='preferredDayOfWeek'
                                prompt='Preferred days of the week'
                                list={dayOfWeekList.map(day => day.slice(0, 2))}
                                type='checkbox'
                                colour={mindsetColour}
                            />
                        </>)}
                    </>)}
                    {chosenRepeat === 'Repeat' && (<>
                        <div className={`divider h-[1px] w-full`} style={{background: 'black'}}></div>
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
                            <button className='w-full flex mb-2'
                                    onClick={() => {setEndRepeat(endRepeat === 'No' ? 'Yes' : 'No')}}
                                    style={{color: ['No', null].includes(endRepeat) ? 'lightgrey' : 'black'}}
                            >End repeat</button>
                            {(chosenRepeat === 'Repeat' && endRepeat !== 'No' && endRepeat !== null) && (<>
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
                                    />}
                                </div>
                                <div className='flex h-8 gap-2 items-center text-left pl-2'>
                                    <button 
                                        onClick={() => {setEndRepeat(endRepeat === 'Duration' ? 'Yes' : 'Duration')}}
                                        style={{color: endRepeat === 'Duration' ? 'black' : 'lightgrey'}}
                                        className='text-left'
                                    >After a total duration</button>
                                    {endRepeat === 'Duration' && <InputField 
                                        fieldName='totalDuration'
                                        placeholder='Deadline'
                                        inputType='number'
                                        colour={mindsetColour}
                                    />}
                                </div>
                                <div className='flex h-8 gap-2 items-center pl-2'>
                                    <button 
                                        onClick={() => {setEndRepeat(endRepeat === 'Repetitions' ? 'Yes' : 'Repetitions')}}
                                        style={{color: endRepeat === 'Repetitions' ? 'black' : 'lightgrey'}}
                                        className='text-left'
                                    >After a number of repetitions</button>
                                    {endRepeat === 'Repetitions' && <InputField 
                                        fieldName='totalRepetitions'
                                        placeholder=''
                                        inputType='number'
                                        colour={mindsetColour}
                                    />}
                                </div>
                            </>)}
                        </div>
                    </>)}
                    
                    {(isScheduled && chosenRepeat && chosenRepeat !== 'Repeat') && (<>
                        <div className={`divider h-[1px] w-full`} style={{background: mindsetColour}}></div>
                        <div className='flex h-8 gap-2 items-center'>
                            <button 
                                onClick={() => {setDeadline(!deadline)}}
                                style={{color: deadline ? 'black' : 'lightgrey'}}
                                className='font-medium'
                            >Deadline</button>
                            {deadline && <InputField 
                                fieldName='totalDuration'
                                placeholder='Deadline'
                                inputType='date'
                                colour={mindsetColour}
                            />}
                        </div>
                    </>)}
                </>)}
            </div>
            { chosenRepeat &&
                <div className='flex justify-center gap-4 mt-8'>
                    <Button type='submit' 
                        className={`h-10 hover:bg-[${adjustLightness(mindsetColour, -0.2)}]`} 
                        style={{background: mindsetColour}}>Add</Button>
                </div>
            }
        </form>
    </div>
    </div>);
}
'use client';

import { useState, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { createTaskPrisma} from '@/app/lib/actions';
import Button from '@/components/button';
import { Dropdown, InputField, MultiField, MultiSelectionField, SelectionField } from './form-fields';
import { priorityList, dayOfWeekList, timeOfDayList, timeSpanList, statusList, repeatUnitList, DEFAULT_MINDSET_LIST } from '@/app/lib/definitions';
import { getMindsetNames } from '@/app/lib/data';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { setPriority } from 'os';


export default function CreateTask() {
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
    const [endRepeat, setEndRepeat] = useState<string | null>(null);
    const [repeatUnit, setRepeatUnit] = useState<string | null>('sessions');
    const [selectedMindset, setSelectedMindset] = useState<string | null>(null);
    const [ inFocus, setInFocus ] = useState<string>('');

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
    

    return (<div className='z-40 absolute w-full h-full flex items-start justify-center overflow-y-scroll backdrop-blur-sm py-4'>
    <div className='z-50 top-1/3 rounded-2xl bg-white p-4 md:p-6 w-1/3 min-w-80 overflow-x-hidden shadow-2xl shadow-slate-500 text-black'>
        <div className='w-full flex justify-between items-center pb-4'>
            <div className='w-8 h-8'></div>
            <div className='text-lg'>Add task</div>
            <Link href={pathname.slice(-1 * '?showAddTask:true'.length)} >
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
            <div className='flex flex-col justify-start gap-8'>
                <InputField 
                    fieldName='name'
                    placeholder='Enter task name'
                    inputType='string'
                    className={`!border-0 !text-lg placeholder:text-lg pl-0`}
                    onChange={handleTaskNameInput}
                />
                {taskName && 
                    <Dropdown 
                        fieldName='mindset'
                        prompt='Select a mindset'
                        list={DEFAULT_MINDSET_LIST}
                        defaultValue=''
                        onChange={handleMindsetSelect}
                        label='Mindset'
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
                    />
                    {priority && <SelectionField 
                        fieldName='isScheduled'
                        prompt=''
                        list={['Scheduled', 'Flexible']}
                        type='radio'
                        onChange={handleScheduledToggle}
                    />}
                    {isScheduled === 'Scheduled' && (<>
                        <div className='flex items-center gap-2'>
                        <div className='flex flex-col'>
                            <InputField 
                                fieldName='startTime'
                                placeholder='Enter start time'
                                inputType='time'
                            />
                            <InputField 
                                fieldName='startDate'
                                placeholder='Enter start date'
                                inputType='date'
                            />
                        </div>
                        {'>'}
                        <div className='flex flex-col justify-start'>
                        <InputField 
                            fieldName='endTime'
                            placeholder='Enter end time'
                            inputType='time'
                        />
                        <InputField 
                            fieldName='endDate'
                            placeholder='Enter end date'
                            inputType='date'
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
                        />
                        <InputField 
                            fieldName='idealStartTime'
                            placeholder='Enter start time'
                            inputType='time'
                            label='Ideal start'
                        />
                    </>)}
                    { isScheduled && <>
                        <div className='divider h-[1px] bg-violet-600 w-full'></div>
                        <SelectionField 
                            fieldName='repeat'
                            prompt=''
                            list={['One time', 'Repeat']}
                            type='radio'
                            onChange={handleRepeatToggle}
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
                            />
                        </>) : (<>
                            <InputField 
                                fieldName='repeatDuration'
                                placeholder='10'
                                inputType='number'
                            />
                        </>)}
                        <Dropdown 
                            fieldName='repeatUnit'
                            prompt=''
                            list={(((repeatUnit && repeatUnit.includes('session') && repeatFrequency && repeatFrequency !== 1) || (repeatUnit && repeatUnit.includes('minute'))) ? repeatUnitList : 
                                repeatUnitList.map(item => item.slice(0, item.length - 1))) as [string, ...string[]]}
                            defaultValue='sessions'
                            onChange={handleRepeatUnitSelect}
                        />
                        </div>
                        <div className='flex gap-2 mb-4 items-top *:mb-0 overflow-x-scroll'>
                        <InputField 
                            fieldName='repeatTimespanMultiplier'
                            label = 'Every'
                            placeholder='1'
                            inputType='number'
                            onChange={handleTimespanMultiplierInput}
                        />
                        <Dropdown 
                            fieldName='repeatTimespan'
                            prompt=''
                            list={timespanList}
                            onChange={handleRepeatTimespanToggle}
                            defaultValue='Day'
                        />
                        </div>
                    </div>)}
                    {(chosenRepeat && isScheduled !== 'Scheduled' && (repeatTimespan !== '' || chosenRepeat !== 'Repeat')) && (<>
                        {(chosenRepeat !== 'Repeat' || !['hour'].includes(repeatTimespan)) && (<>
                            <div className='h-[1px] bg-violet-600 w-full'></div>
                            <MultiSelectionField
                                fieldName='preferredTimeOfDay'
                                prompt='Preferred time of day'
                                list={timeOfDayList}
                                type='checkbox'
                                className='multi-line'
                            />
                        </>)}
                        {(chosenRepeat !== 'Repeat' || !['hour', 'day'].includes(repeatTimespan)) && (<>
                            <MultiSelectionField 
                                fieldName='preferredDayOfWeek'
                                prompt='Preferred days of the week'
                                list={dayOfWeekList.map(day => day.slice(0, 2))}
                                type='checkbox'
                            />
                        </>)}
                    </>)}
                    {chosenRepeat === 'Repeat' && (<>
                        <div className='h-[1px] bg-violet-600 w-full'></div>
                        <SelectionField 
                            fieldName='endRepeat'
                            prompt='End Repeat?'
                            list={['No', 'Yes']}
                            type='radio'
                            onChange={handleEndRepeatToggle}
                            defaultSelected={['No']}
                        />
                    </>)}
                    {(chosenRepeat === 'Repeat' && endRepeat === 'Yes') && (<>
                        <InputField 
                            fieldName='totalDuration'
                            placeholder='Total duration'
                            inputType='number'
                        />
                        <InputField 
                            fieldName='totalRepetitions'
                            placeholder='Number of totalRepetitions'
                            inputType='number'
                        />
                        <InputField 
                            fieldName='endRepeatDate'
                            placeholder='End repeat on date'
                            inputType='date'
                        />
                    </>)}
                    {(isScheduled && chosenRepeat && chosenRepeat !== 'Repeat') && (<>
                        <div className='h-[1px] bg-violet-600 w-full'></div>
                        <InputField 
                            fieldName='deadline'
                            label='Deadline'
                            placeholder='Enter deadline'
                            inputType='date'
                        />
                    </>)}
                </>)}
            </div>
            { chosenRepeat &&
                <div className='flex justify-center gap-4 mt-8'>
                    <Button type='submit' className='h-10 bg-violet-600 hover:bg-violet-500'>Add</Button>
                </div>
            }
        </form>
    </div>
    </div>);
}
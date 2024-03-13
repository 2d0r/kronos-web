'use client';
import { useState, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { createTaskPrisma} from '@/app/lib/actions';
import { Button } from '@/app/ui/button';
import prisma from '@/app/lib/db';
import { Dropdown, InputField, SelectionField } from './form-fields';
import { mindsetList, priorityList, preferredDayOfWeekList, preferredTimeOfDayList, timeSpanList, statusList } from '@/app/lib/definitions';


export default function CreateForm() {
    const initialState = { message: null, errors: {} };
    const createTaskHere : any = createTaskPrisma;
    const [state, dispatch] = useFormState(createTaskHere, initialState);

    const getEnumValues = (enumType: Record<string, string>) => {
        return Object.values(enumType);
    }

    const [isScheduled, setIsScheduled] = useState<string | null>(null);
    const handleScheduledToggle = (event : React.ChangeEvent<HTMLInputElement>) => {
        setIsScheduled(event.target.value);
    }

    const [isRepeating, setIsRepeating] = useState<string | null>(null);
    const handleRepeatToggle = (event : React.ChangeEvent<HTMLInputElement>) => {
        setIsRepeating(event.target.value);
    }

    const [endRepeat, setEndRepeat] = useState<string | null>(null);
    const handleEndRepeatToggle = (event : React.ChangeEvent<HTMLInputElement>) => {
        setEndRepeat(event.target.value);
    }

    return (<>
        <form action={dispatch}>
            <div className='rounded-md bg-gray-50 p-4 md:p-6'>
                <InputField 
                    fieldName='name'
                    placeholder='Enter task name'
                    inputType='string'
                />
                <Dropdown 
                    fieldName='mindset'
                    prompt='Select a mindset'
                    list={mindsetList}
                    defaultValue=''
                />
                <SelectionField 
                    fieldName='status'
                    prompt='Status'
                    list={statusList}
                    type='radio'
                    defaultSelected={[statusList[0]]}
                />
                <SelectionField 
                    fieldName='priority'
                    prompt='Priority'
                    list={priorityList}
                    type='radio'
                />
                <SelectionField 
                    fieldName='isScheduled'
                    prompt=''
                    list={['Scheduled', 'Planned by me']}
                    type='radio'
                    onChange={handleScheduledToggle}
                />
                {isScheduled === 'Scheduled' && (<>
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
                </>)}

                {isScheduled === 'Planned by me' && (<>
                    <InputField 
                        fieldName='deadline'
                        placeholder='Enter deadline'
                        inputType='date'
                    />
                    <InputField 
                        fieldName='duration'
                        placeholder='Enter duration'
                        inputType='number'
                    />
                    <SelectionField 
                        fieldName='preferredTimeOfDay'
                        prompt='Preferred time of day'
                        list={preferredTimeOfDayList}
                        type='checkbox'
                    />
                    <SelectionField 
                        fieldName='preferredDayOfWeek'
                        prompt='Preferred days of the week'
                        list={preferredDayOfWeekList}
                        type='checkbox'
                    />
                </>)}
                
                
                <SelectionField 
                    fieldName='repeat'
                    prompt=''
                    list={['One time', 'Repeat']}
                    type='radio'
                    onChange={handleRepeatToggle}
                    defaultSelected={['One time']}
                />
                {isRepeating === 'Repeat' && (<>
                    <InputField 
                        fieldName='repeatFrequency'
                        placeholder='How often'
                        inputType='number'
                    />
                    <InputField 
                        fieldName='repeatTimespanMultiplier'
                        placeholder='How much'
                        inputType='number'
                    />
                    <SelectionField 
                        fieldName='repeatTimespan'
                        prompt='every'
                        list={timeSpanList}
                        type='radio'
                    />
                    <SelectionField 
                        fieldName='endRepeat'
                        prompt='End Repeat?'
                        list={['No', 'Yes']}
                        type='radio'
                        onChange={handleEndRepeatToggle}
                        defaultSelected={['No']}
                    />
                    {endRepeat === 'Yes' && (<>
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
                </>)}
                
            </div>
            <div className='mt-6 flex justify-end gap-4'>
                {/* <Link
                    href='/'
                    className='flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200'
                >
                    Cancel
                </Link> */}
                <Button type='submit'>Create Task</Button>
            </div>
        </form>
    </>);
}
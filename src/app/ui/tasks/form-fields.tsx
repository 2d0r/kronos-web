import React, { useState } from 'react';

function capitalise(text: string) {
    return text[0].toUpperCase() + text.slice(1);
}

function camelcaseToTitlecase(text: string) {
    const textWithSpaces = text.replace(/([A-Z])/g, " $1");
    const titlecaseText = textWithSpaces.charAt(0).toUpperCase() + textWithSpaces.slice(1);
    return titlecaseText;
}

export function InputField(
    { fieldName, placeholder, inputType, prompt, label } : { 
        fieldName: string, 
        placeholder: string, 
        inputType: string,
        prompt?: string,
        label?: string,
    }
) {

    return (<>
        <div className='mb-4'>
            <label htmlFor={fieldName} className='mb-2 block text-sm font-medium dark:text-neutral-700'>
                {label || camelcaseToTitlecase(fieldName)}
            </label>
            <div className='relative'>
                {inputType === 'duration' ? 
                    <div className='flex gap-3 text-black'>
                        <input
                            id='durationHours'
                            name='durationHours'
                            type='number'
                            className='peer block w-16 cursor-pointer rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 dark:text-neutral-700'
                            placeholder=''
                            aria-describedby='task-error'
                        /> <label htmlFor='durationHours' className='flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600'>
                        Hours</label>
                        <input
                            id='durationMinutes'
                            name='durationMinutes'
                            type='number'
                            className='peer block w-16 cursor-pointer rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 dark:text-neutral-700'
                            placeholder=''
                            aria-describedby='task-error'
                        /> <label htmlFor='durationMinutes' className='flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600'>
                        Minutes</label>
                    </div> :
                    <input
                        id={fieldName}
                        name={fieldName}
                        type={inputType}
                        className='peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 dark:text-neutral-700'
                        placeholder={placeholder}
                        aria-describedby='task-error'
                    />
                }
            </div>
            <div id='task-error' aria-live='polite' aria-atomic='true'>
            {/* {state.errors?.customerId &&
                state.errors.customerId.map((error: string) => (
                <p className='mt-2 text-sm text-red-500' key={error}>
                    {error}
                </p>
            ))} */}
            </div>
        </div>
    </>);
}

export function Dropdown ( 
    { fieldName, list, defaultValue, prompt } : {
        fieldName: string,
        list: string[],
        defaultValue: string,
        prompt: string,
    }
) {

    return (
        <div className='mb-4'>
            <label htmlFor={fieldName} className='mb-2 block text-sm font-medium dark:text-neutral-700'>
                {camelcaseToTitlecase(fieldName)}
            </label>
            <div className='relative'>
            <select
                id={fieldName}
                name={fieldName}
                className='peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 dark:text-neutral-700'
                defaultValue={defaultValue}
                aria-describedby='task-error'
            >
                <option value='' disabled>{prompt}</option>
                {list.map((item, idx) => (
                    <option key={idx} value={item}>
                        {item}
                    </option>
                ))}
            </select>
            </div>
            <div id='task-error' aria-live='polite' aria-atomic='true'>
            {/* {state.errors?.customerId &&
                state.errors.customerId.map((error: string) => (
                <p className='mt-2 text-sm text-red-500' key={error}>
                    {error}
                </p>
            ))} */}
            </div>
        </div>
    )
}

export function SelectionField( 
    { fieldName, list, prompt, type, onChange = () => {}, defaultSelected = [] } : {
        fieldName: string,
        list: string[],
        prompt: string,
        type: string,
        onChange?: any,
        defaultSelected?: string[]
    }
) {
    const [ selectedOptions, setSelectedOptions ] = useState<string[]>(defaultSelected);
    const handleSelect = (event : React.ChangeEvent<HTMLInputElement>) => {
        setSelectedOptions((selectedOptions) => [...selectedOptions, event.target.value]);
        onChange(event);
    }
    const selectionList = list.map((item, idx) => {
        return (<div className='flex items-center' key={idx}>
            <input
                id={item}
                name={fieldName}
                type={type}
                value={item}
                className='h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2'
                aria-describedby='task-error'
                onChange={handleSelect}
                checked={
                    (type === 'radio' && selectedOptions[selectedOptions.length - 1] === item) ||
                    (type === 'checkbox' && selectedOptions.includes(item))
                }
            />
            <label
                htmlFor={item}
                className='ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600'
            >
            {capitalise(item)}
            </label>
      </div>)
    })

    return (<fieldset className='mb-4'>
        <legend className='mb-2 block text-sm font-medium dark:text-neutral-700'>
          {prompt}
        </legend>
        <div className='rounded-md border border-gray-200 bg-white px-[14px] py-3'>
          <div className='flex gap-4 flex-wrap'>
            {selectionList}
          </div>
        </div>
        <div id='customer-error' aria-live='polite' aria-atomic='true'>
          {/* {state.errors?.status &&
            state.errors.status.map((error: string) => (
              <p className='mt-2 text-sm text-red-500' key={error}>
                {error}
              </p>
            ))} */}
        </div>
    </fieldset>);
}

export function MultiSelectionField( 
    { fieldName, list, prompt, type, onChange = () => {}, defaultSelected = [] } : {
        fieldName: string,
        list: string[],
        prompt: string,
        type: string,
        onChange?: any,
        defaultSelected?: string[]
    }
) {
    const [ selectedOptions, setSelectedOptions ] = useState<string[]>(defaultSelected);
    const handleSelect = (event : React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked; // If checkbox was toggled
        setSelectedOptions(prevOptions => {
            if (isChecked) {
                return [...prevOptions, event.target.value]; // Add if checked
            } else {
                return prevOptions.filter(option => option !== event.target.value); // Remove if unchecked
            }
        });
        onChange(event);
    }
    const selectionList = list.map((item, idx) => {
        return (<div className='flex items-center' key={idx}>
            <input
                id={item}
                name={fieldName}
                type={type}
                value={item}
                className='h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2'
                aria-describedby='task-error'
                onChange={handleSelect}
                // checked={
                //     (type === 'radio' && selectedOptions[selectedOptions.length - 1] === item) ||
                //     (type === 'checkbox' && selectedOptions.includes(item))
                // }
            />
            <label
                htmlFor={item}
                className='ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600'
            >
            {capitalise(item)}
            </label>
      </div>)
    })

    return (<fieldset className='mb-4'>
        <legend className='mb-2 block text-sm font-medium dark:text-neutral-700'>
          {prompt}
        </legend>
        <div className='rounded-md border border-gray-200 bg-white px-[14px] py-3'>
          <div className='flex gap-4 flex-wrap'>
            {selectionList}
          </div>
        </div>
        <div id='customer-error' aria-live='polite' aria-atomic='true'>
          {/* {state.errors?.status &&
            state.errors.status.map((error: string) => (
              <p className='mt-2 text-sm text-red-500' key={error}>
                {error}
              </p>
            ))} */}
        </div>
    </fieldset>);
}

export function MultiField( 
    { fieldName, list, prompt, typeList, onChange = () => {}, defaultSelected = [] } : {
        fieldName: string,
        list: string[],
        prompt: string,
        typeList: string[],
        onChange?: any,
        defaultSelected?: string[]
    }
) {
    const [ selectedOptions, setSelectedOptions ] = useState<string[]>(defaultSelected);
    const handleSelect = (event : React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked; // If checkbox was toggled
        setSelectedOptions(prevOptions => {
            if (isChecked) {
                return [...prevOptions, event.target.value]; // Add if checked
            } else {
                return prevOptions.filter(option => option !== event.target.value); // Remove if unchecked
            }
        });
        onChange(event);
    }

    return (<fieldset className='mb-4'>
        <legend className='mb-2 block text-sm font-medium dark:text-neutral-700'>
          {prompt}
        </legend>
        <div className='rounded-md border border-gray-200 bg-white px-[14px] py-3'>
            <div className='flex gap-4 flex-wrap'>
                {list.map((item, idx) => {
                    return (<div className='flex items-center' key={idx}>
                        <input
                            id={item}
                            name={fieldName}
                            type={typeList[idx]}
                            value={item}
                            className='h-4 w-24 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2'
                            aria-describedby='task-error'
                            onChange={handleSelect}
                            // checked={
                            //     (type === 'radio' && selectedOptions[selectedOptions.length - 1] === item) ||
                            //     (type === 'checkbox' && selectedOptions.includes(item))
                            // }
                        />
                        <label
                            htmlFor={item}
                            className='ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600'
                        >{capitalise(item)}</label>
                    </div>)
                })}
            </div>
        </div>
        {/* <div id='customer-error' aria-live='polite' aria-atomic='true'>
          {state.errors?.status &&
            state.errors.status.map((error: string) => (
              <p className='mt-2 text-sm text-red-500' key={error}>
                {error}
              </p>
            ))}
        </div> */}
    </fieldset>);
}
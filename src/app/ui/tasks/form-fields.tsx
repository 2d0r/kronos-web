'use client';

import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';
import './form-fields.css';

function capitalise(text: string) {
    return text[0].toUpperCase() + text.slice(1);
}

function camelcaseToTitlecase(text: string) {
    const textWithSpaces = text.replace(/([A-Z])/g, ' $1');
    const titlecaseText = textWithSpaces.charAt(0).toUpperCase() + textWithSpaces.slice(1);
    return titlecaseText;
}

export function InputField(
    { fieldName, placeholder, inputType, label, onChange = () => {}, className } : { 
        fieldName: string, 
        placeholder: string, 
        inputType: string,
        label?: string,
        onChange?: any,
        className?: string,
    }
) {

    const [ input, setInput ] = useState<string>(placeholder);
    const handleInput = (event : React.ChangeEvent<HTMLInputElement>) => {
        setInput(event.target.value);
        onChange(event);
    }

    return (<>
        <div className={clsx('mb-8 flex items-baseline', label && 'gap-2')}>
            <label htmlFor={fieldName} className='mb-2 block text-sm font-medium'>
                {label}
            </label>
            <div className='relative'>
                <input
                    id={fieldName}
                    name={fieldName}
                    type={inputType}
                    className={clsx(
                        className,
                        inputType === 'number' && 'w-[60px]',
                        'w-fit p-2 cursor-pointer items-baseline rounded-lg border-[1px] border-violet-600 text-sm outline-2 placeholder:text-gray-400',
                        
                    )}
                    placeholder={placeholder}
                    onChange={handleInput}
                    aria-describedby='task-error'
                    min='0'
                    step={['repeatTimespanMultiplier', 'repeatFrequency'].includes(fieldName) ? '1' : '5'}
                />
            </div>
            {/* <div id='task-error' aria-live='polite' aria-atomic='true'>
            {state.errors?.customerId &&
                state.errors.customerId.map((error: string) => (
                <p className='mt-2 text-sm text-red-500' key={error}>
                    {error}
                </p>
            ))}
            </div> */}
        </div>
    </>);
}

export function Dropdown ( 
    { fieldName, list, defaultValue, prompt, onChange = () => {}, label } : {
        fieldName: string,
        list: string[],
        defaultValue: string,
        prompt: string,
        onChange?: any,
        label?: string,
    }
) {
    const [ selection, setSelection ] = useState<string>(defaultValue);
    const handleSelect = (event : React.ChangeEvent<HTMLSelectElement>) => {
        setSelection(event.target.value !== undefined ? event.target.value : defaultValue);
        onChange(event);
    }

    return (
        <div className={clsx('mb-8 flex items-baseline', label && 'gap-2')}>
            <label htmlFor={fieldName} className='mb-2 block text-sm font-medium'>
                {label}
            </label>
            <div className='relative'>
            <select
                id={fieldName}
                name={fieldName}
                className='peer block cursor-pointer rounded-lg border border-violet-600 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500'
                defaultValue={defaultValue}
                onChange={handleSelect}
                aria-describedby='task-error'
            >
                <option value='' disabled>{prompt}</option>
                {list.map((item, idx) => (
                    <option key={idx} value={item}>
                        {camelcaseToTitlecase(item)}
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
    };

    const [ isFocused, setIsFocused ] = useState<boolean>(false);
    const handleFocus = (event : React.MouseEvent<HTMLInputElement>) => {
        setIsFocused(true);
    }
    const handleBlur = (event : React.MouseEvent<HTMLInputElement>) => {
        setIsFocused(false);
    }

    const selectionList = list.map((item, idx) => {
        const checked = (type === 'radio' && selectedOptions[selectedOptions.length - 1] === item) ||
            (type === 'checkbox' && selectedOptions.includes(item));
        const hidden = !checked && !isFocused && selectedOptions.length > 0;

        return (<div 
                className={clsx('flex items-center border-y-none border-l-none border-r-[1px] border-r-violet-600 last:border-r-0',
                    hidden && 'hidden'
                )} 
                key={idx}>
                <input
                    id={item}
                    name={fieldName}
                    type={type}
                    value={item}
                    className='opacity-0 absolute' 
                    aria-describedby='task-error'
                    onChange={handleSelect}
                    checked={checked}
                />
                <label
                    htmlFor={item}
                    className={clsx(
                        checked && 'bg-violet-600 text-white',
                        'customButton flex cursor-pointer items-center gap-1.5 p-2 text-sm font-medium text-violet-600',
                        
                    )}
                >
                {capitalise(item)}
                </label>
      </div>)
    })

    return (<div className={clsx(
        'mb-8 flex flex-row items-baseline', 
        isFocused ? '' : '', 
        prompt && 'gap-2'
    )}>
        <legend className='mb-2 text-sm font-medium'>
            {prompt}
        </legend>
        <div className='relative flex w-fit rounded-lg overflow-hidden border-[1px] border-violet-600' onMouseOver={handleFocus} onMouseOut={handleBlur}>
            {selectionList}
        </div>
        
        {/* <div id='customer-error' aria-live='polite' aria-atomic='true'>
          {state.errors?.status &&
            state.errors.status.map((error: string) => (
              <p className='mt-2 text-sm text-red-500' key={error}>
                {error}
              </p>
            ))}
        </div> */}
    </div>);
}

export function MultiSelectionField( 
    { fieldName, list, prompt, type, onChange = () => {}, defaultSelected = [], className } : {
        fieldName: string,
        list: string[],
        prompt: string,
        type: string,
        onChange?: any,
        defaultSelected?: string[],
        className?: string
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
        const checked = (type === 'radio' && selectedOptions[selectedOptions.length - 1] === item) ||
            (type === 'checkbox' && selectedOptions.includes(item));
        const hidden = false;// if not selected and field is not in focus

        return (hidden ? <></> :
            <div className={clsx(
                className?.includes('multi-line') ? 'border-violet-600 border-[1px] rounded-lg' 
                : 'border-r-violet-600 border-l-none border-y-none last:border-r-0',
                'flex items-center border-r-[1px], overflow-hidden'
                )} 
                key={idx}>
                <input
                    id={item}
                    name={fieldName}
                    type={type}
                    value={item}
                    className='hidden h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2'
                    aria-describedby='task-error'
                    onChange={handleSelect}
                />
                <label
                    htmlFor={item}
                    className={clsx('flex cursor-pointer items-center gap-1.5 p-2 text-sm font-medium text-violet-600',
                        checked && 'bg-violet-600 text-white'
                    )}
                >
                    {capitalise(item)}
                </label>
      </div>);
    })

    return (<fieldset className='mb-8'>
        <legend className='mb-2 block text-sm font-medium'>
          {prompt}
        </legend>
        <div className={clsx(
            className?.includes('multi-line') && 'border-0',
            'w-fit rounded-lg border border-violet-600 bg-white overflow-hidden'
        )}>
          <div className={clsx('flex',
            className?.includes('multi-line') && 'flex-wrap gap-2'
          )}>
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

    return (<fieldset className='mb-8'>
        <legend className='mb-2 block text-sm font-medium'>
          {prompt}
        </legend>
        <div className='rounded-lg border border-gray-200 bg-white px-[14px] py-3'>
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
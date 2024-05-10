'use client';

import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';
import { camelcaseToTitlecase } from '@/app/utils/textUtils';
import '@/app/globals.css';
import { NEUTRAL_MINDSET_COLOUR } from '@/app/lib/definitions';

function capitalise(text: string) {
    return text[0].toUpperCase() + text.slice(1);
}

export function InputField(
    { fieldName, placeholder, inputType, label, onChange = () => {}, className, tail, colour = NEUTRAL_MINDSET_COLOUR } : { 
        fieldName: string, 
        placeholder: string, 
        inputType: string,
        label?: string,
        onChange?: any,
        className?: string,
        tail?: string,
        colour?: string,
    }
) {

    const [ input, setInput ] = useState<string>(placeholder);
    const handleInput = (event : React.ChangeEvent<HTMLInputElement>) => {
        setInput(event.target.value);
        onChange(event);
    }

    return (<>
        <div className={clsx('flex items-baseline', label && 'gap-2')}>
            <label htmlFor={fieldName} className='mb-2 block text-sm font-medium'>
                {label}
            </label>
            <div className='relative'>
                <input
                    id={fieldName}
                    name={fieldName}
                    type={inputType}
                    className={clsx(
                        inputType === 'number' ? 'w-[60px]' : 'w-fit',
                        'p-2 cursor-pointer items-baseline rounded-lg border-[1px] text-sm outline-2 placeholder:text-gray-400 focus:!border-0',
                        className,
                        `focus:!border-[${colour}]`
                    )}
                    style={{borderColor: colour}}
                    placeholder={placeholder}
                    onChange={handleInput}
                    aria-describedby='task-error'
                    min='0'
                    step={['repeatTimespanMultiplier', 'repeatFrequency'].includes(fieldName) ? '1' : '5'}
                />
            </div>
            <div>{tail}</div>
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
    { fieldName, list, defaultValue, prompt, onChange = () => {}, label, colour = NEUTRAL_MINDSET_COLOUR, className = '' } : {
        fieldName: string,
        list: string[],
        defaultValue: string,
        prompt: string,
        onChange?: any,
        label?: string,
        colour?: string,
        className?: string,
    }
) {
    const [ selection, setSelection ] = useState<string>(defaultValue);
    const handleSelect = (event : React.ChangeEvent<HTMLSelectElement>) => {
        setSelection(event.target.value !== undefined ? event.target.value : defaultValue);
        onChange(event);
    }

    return (
        <div className={clsx(' flex items-baseline', label && 'gap-2')}>
            <label htmlFor={fieldName} className='mb-2 block text-sm font-medium'>
                {label}
            </label>
            <div className='relative'>
            <select
                id={fieldName}
                name={fieldName}
                className={`${className} peer block cursor-pointer rounded-lg border py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 focus:![${colour}]`}
                style={{borderColor: colour}}
                defaultValue={defaultValue}
                onChange={handleSelect}
                aria-describedby='task-error'
            >
                {prompt && <option value='' disabled>{prompt}</option>}
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
    { fieldName, list, prompt, type, onChange = () => {}, defaultSelected = [], colour = NEUTRAL_MINDSET_COLOUR } : {
        fieldName: string,
        list: string[],
        prompt: string,
        type: string,
        onChange?: any,
        defaultSelected?: string[],
        colour?: string
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
                className={clsx('flex items-center border-y-none border-l-none border-r-[1px] last:border-r-0',
                    hidden && 'hidden'
                )} 
                style={{ borderColor: colour }}
                key={idx}>
                <input
                    id={item}
                    name={fieldName}
                    type={type}
                    value={item}
                    className={`opacity-0 absolute focus:!border-[${colour}]`}
                    aria-describedby='task-error'
                    onChange={handleSelect}
                    checked={checked}
                />
                <label
                    htmlFor={item}
                    className={clsx(
                        'customButton flex cursor-pointer items-center gap-1.5 p-2 text-sm font-medium',
                    )}
                    style={{ 
                        background: checked ? colour : 'transparent',
                        color: checked ? 'white' : colour,
                    }}
                >
                {capitalise(item)}
                </label>
      </div>)
    })

    return (<div className={clsx(
        ' flex flex-row items-baseline', 
        isFocused ? '' : '', 
        prompt && 'gap-2'
    )}>
        <legend className='mb-2 text-sm font-medium'>
            {prompt}
        </legend>
        <div className={`relative flex w-fit rounded-lg overflow-hidden border-[1px]`} 
            onMouseOver={handleFocus} onMouseOut={handleBlur}
            style={{ borderColor: colour }}>
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
    { fieldName, list, prompt, type, onChange = () => {}, defaultSelected = [], className, colour = NEUTRAL_MINDSET_COLOUR } : {
        fieldName: string,
        list: string[],
        prompt: string,
        type: string,
        onChange?: any,
        defaultSelected?: string[],
        className?: string,
        colour?: string,
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
                className?.includes('multi-line') ? `border-[1px] rounded-lg` : `border-l-none border-y-none last:border-r-0`,
                'flex items-center border-r-[1px], overflow-hidden'
                )} 
                style={className?.includes('multi-line') ? { borderColor: colour } : { borderRightColor: colour }}
                key={idx}
            >
                <input
                    id={item}
                    name={fieldName}
                    type={type}
                    value={item}
                    className={`hidden h-4 w-4 cursor-pointer bg-gray-100 text-gray-600 focus:ring-none focus:!border-[${colour}]`}
                    style={{ borderColor: colour }}
                    aria-describedby='task-error'
                    onChange={handleSelect}
                />
                <label
                    htmlFor={item}
                    className={clsx(`flex cursor-pointer items-center gap-1.5 p-2 text-sm font-medium`,
                        checked && `bg-[${colour}] text-white`
                    )}
                    style={checked ? {color: 'white', backgroundColor: colour} : {color: colour}}
                >
                    {capitalise(item)}
                </label>
      </div>);
    })

    return (<fieldset className=''>
        <legend className='mb-2 block text-sm font-medium'>
          {prompt}
        </legend>
        <div className={clsx(
            className?.includes('multi-line') && 'border-0',
            `w-fit rounded-lg border bg-white overflow-hidden`
        )} style={{ borderColor: colour }}
        >
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
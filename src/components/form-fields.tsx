'use client';

import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';
import { camelcaseToTitlecase } from '@/utils/text-utils';
import '@/app/globals.css';
import { NEUTRAL_MINDSET_COLOUR } from '@/lib/definitions';
import { adjustLightness } from '@/utils/colour-utils';

function capitalise(text: string) {
    return text[0].toUpperCase() + text.slice(1);
}

export function InputField({ 
    fieldName, placeholder, inputType, label, onChange = () => {}, className, tail, colour = NEUTRAL_MINDSET_COLOUR, state, value, hidden = false 
} : { 
    fieldName: string, label?: string,
    placeholder?: string, value?: string, tail?: string, 
    inputType: string,
    onChange?: any,
    className?: string, colour?: string,
    state: any,  
    hidden?: boolean,
}) {

    const [ input, setInput ] = useState<string>(placeholder || '');
    const handleInput = (event : React.ChangeEvent<HTMLInputElement>) => {
        setInput(event.target.value);
        onChange(event);
    }

    return (<>
        <div className={clsx('flex items-baseline',  label && 'gap-2')}>
            <label htmlFor={fieldName} className={clsx('my-2 block text-sm font-medium', label && 'formKeysColumn')}>
                {label}
            </label>
            <div className={clsx('flex items-center', 
                label && 'formValuesColumn', 
                tail && 'gap-2',
            )}>
                <div className={'relative'} suppressHydrationWarning>
                    <input
                        id={fieldName} name={fieldName}
                        value={value} placeholder={placeholder}
                        type={inputType} 
                        min='0'
                        className={clsx(
                            inputType === 'number' ? 'no-arrows w-[46px]' : 'w-fit',
                            'pr-4 cursor-text items-baseline text-sm rounded-lg border-0 outline-0 placeholder:text-gray-400 focus:!border-0',
                            className, 
                            `placeholder:${adjustLightness(colour, 0.95) || 'grey'}`
                        )}
                        style={{ backgroundColor: adjustLightness(colour, 0.95), color: colour }}
                        onChange={handleInput}
                        step={inputType === 'time' ? '60' : ['duration', 'totalDuration'].includes(fieldName) ? '5' : '1'}
                        hidden={hidden} 
                        suppressHydrationWarning aria-describedby='task-error'
                    />
                </div>
                <div className={tail ? 'mr-2' : ''}>{tail}</div>
            </div>
            <div id='task-error' aria-live='polite' aria-atomic='true'>
            {state?.errors?.customerId &&
                state.errors.customerId.map((error: string) => (
                <p className='mt-2 text-sm text-red-500' key={error}>
                    {error}
                </p>
            ))}
            </div>
        </div>
    </>);
}

export function Dropdown ({ 
    fieldName, prompt, label,  
    value, defaultValue, list, 
    colour = NEUTRAL_MINDSET_COLOUR, bgColour = NEUTRAL_MINDSET_COLOUR, className = '',
    onChange = () => {}, state, 
} : {
    fieldName: string,
    list: string[],
    value?: string,
    defaultValue?: string,
    prompt: string,
    onChange?: any,
    label?: string,
    colour?: string, bgColour?: string,
    className?: string,
    state?: any,
}) {
    const [ selection, setSelection ] = useState<string>(value || defaultValue || '');
    const handleSelect = (event : React.ChangeEvent<HTMLSelectElement>) => {
        setSelection(event.target.value !== undefined ? event.target.value : value || '');
        onChange(event);
    }

    return (
        <div className='flex items-baseline'>
            <label htmlFor={fieldName} className={clsx(
                'block text-sm font-medium', label ? 'my-2' : '', !className.includes('no-form') && 'formKeysColumn'
            )}>
                {label}
            </label>
            <div className={label && 'relative formValuesColumn'}>
            <select
                id={fieldName}
                name={fieldName}
                className={`${className} peer block cursor-pointer rounded-lg border-none py-2 pl-4 text-sm outline-0 placeholder:text-gray-500 focus:![${colour}]`}
                style={{ backgroundColor: adjustLightness(bgColour, 0.95), color: colour }}
                value={value} defaultValue={defaultValue}
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
            {state?.errors?.customerId &&
                state.errors.customerId.map((error: string) => (
                <p className='mt-2 text-sm text-red-500' key={error}>
                    {error}
                </p>
            ))}
            </div>
        </div>
    );
}

export function SelectionField({ 
    fieldName, list, prompt, type, onChange = () => {}, defaultSelected = [], colour = NEUTRAL_MINDSET_COLOUR, collapse = false, state, className 
} : {
    fieldName: string,
    list: string[],
    prompt: string,
    type: string,
    onChange?: any,
    defaultSelected?: string[],
    colour?: string,
    collapse?: boolean,
    state: any,
    className?: string,
}) {
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
        const hidden = !checked && !isFocused && selectedOptions.length > 0 && collapse;

        return (<div 
            className={clsx('flex items-center',
                hidden && 'hidden'
            )}
            key={idx}>
            <input
                id={item}
                name={fieldName}
                type={type}
                value={item}
                className={`opacity-0 absolute focus:!border-none`}
                aria-describedby='task-error'
                onChange={handleSelect}
                checked={checked}
            />
            <label
                htmlFor={item}
                className={'flex cursor-pointer items-center gap-1.5 pr-4 text-sm font-regular'}
                style={{ color: checked ? colour : adjustLightness(colour, 0.6) }}
            >
            {capitalise(item)}
            </label>
        </div>)
    })

    return (<div className={clsx(
        ' flex flex-row items-baseline gap-2', 
        isFocused ? '' : '', 
        prompt && 'gap-2'
    )}>
        <legend className='mb-2 text-sm font-medium formKeysColumn'>
            {prompt}
        </legend>
        <div className={clsx(`relative flex w-fit flex-wrap gap-2 formValuesColumn`)} 
            onMouseOver={handleFocus} onMouseOut={handleBlur}
        >
            {selectionList}
        </div>
        
        <div id='task-error' aria-live='polite' aria-atomic='true'>
          {state?.errors?.status &&
            state.errors.status.map((error: string) => (
              <p className='mt-2 text-sm text-red-500' key={error}>
                {error}
              </p>
            ))}
        </div>
    </div>);
}

export function MultiSelectionField({ 
    fieldName, list, prompt, type, onChange = () => {}, selected = [], className, colour = NEUTRAL_MINDSET_COLOUR, state 
} : {
    fieldName: string,
    list: string[],
    prompt: string,
    type: string,
    onChange?: any,
    selected?: string[],
    className?: string,
    colour?: string,
    state?: any,
}) {
    const [ selectedOptions, setSelectedOptions ] = useState<string[]>(selected);

    useEffect(() => {
        setSelectedOptions(selected);
    }, [selected]);

    const handleSelect = (event : React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked; // If checkbox was toggled
        const value = event.target.value;

        const newOptions = isChecked ? 
            [...selectedOptions, value] // Add if checked
            : selectedOptions.filter(option => option !== value) // Remove if unchecked
        setSelectedOptions(newOptions);
        onChange(newOptions);
    }
    const selectionList = list.map((item, idx) => {
        const checked = (type === 'radio' && selectedOptions[selectedOptions.length - 1] === item) ||
            (type === 'checkbox' && selectedOptions.includes(item));
        const hidden = false; // if not selected and field is not in focus
        return (hidden ? <></> :
            <div className={'flex items-center overflow-hidden'} style={{ color: colour }} key={idx}>
                <input
                    id={item}
                    name={fieldName}
                    type={type}
                    value={item}
                    className='hidden'
                    aria-describedby='task-error'
                    onChange={handleSelect}
                    checked={checked}
                />
                <label
                    htmlFor={item}
                    className='flex cursor-pointer items-center gap-2 mr-2 px-2 py-1 rounded-lg text-sm font-regular'
                    style={{ 
                        color: checked ? 'white' : adjustLightness(colour, 0.6),
                        backgroundColor: checked ? adjustLightness(colour, 0.2) : adjustLightness(colour, 0.95),
                    }}
                >
                    {fieldName === 'preferredDayOfWeek' ? capitalise(item.slice(0, 2)) : capitalise(item)}
                </label>
            </div>
        );
    })

    return (<fieldset>
        <legend className={clsx('my-2 block text-sm font-medium formKeysColumn', 
            className?.includes('w-full-key') && '!w-full !max-w-none'
        )}>
          {prompt}
        </legend>
        <div className='w-fit rounded-lg bg-white overflow-hidden'>
          <div className={clsx('flex',
            className?.includes('multi-line') && 'flex-wrap gap-2'
          )}>
            {selectionList}
          </div>
        </div>
        <div id='task-error' aria-live='polite' aria-atomic='true'>
          {state?.errors?.status &&
            state.errors.status.map((error: string) => (
              <p className='mt-2 text-sm text-red-500' key={error}>
                {error}
              </p>
            ))}
        </div>
    </fieldset>);
}
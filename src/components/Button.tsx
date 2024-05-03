'use client';

import React, { ComponentPropsWithoutRef } from 'react';
import clsx from 'clsx';
import { NEUTRAL_MINDSET_COLOUR } from '@/app/lib/definitions';

type Props = ComponentPropsWithoutRef<'button'> & {
    onClick?: () => Promise<void> | void;
}

const Button: React.FC<Props> = ({onClick, className, ...props}) => {
    return (
        <button 
            {...props} 
            onClick={async () => {
                if (onClick) await onClick();
            }} 
            className={clsx(
                className,
                ' hover:cursor-pointer items-center rounded-lg px-4 text-sm font-medium text-white transition-colors hover:bg-violet-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 active:bg-violet-600 aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
            )}
            style={{background: NEUTRAL_MINDSET_COLOUR}} />
    );
}

export default Button;
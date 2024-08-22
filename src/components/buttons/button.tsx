'use client';

import { ComponentPropsWithoutRef } from 'react';
import clsx from 'clsx';

type Props = ComponentPropsWithoutRef<'button'> & {
    onClick?: () => Promise<void> | void;
}

export default function Button ({onClick, className, style, ...props} : Props) {
    return (
        <button 
            {...props} 
            onClick={async () => {
                if (onClick) await onClick();
            }} 
            className={clsx('items-center rounded-lg px-4 text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
                className,
            )} 
            style={style}
        />
    );
};
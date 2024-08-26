'use client';

import clsx from 'clsx';
import { useSearchParams } from 'next/navigation';

interface ToolbarButtonProps {
  children: any, pressed: boolean, onPress: any, className?: string,
}

export default function ToolbarButton ({ children, pressed, onPress, className } : ToolbarButtonProps) {

  const searchParams = useSearchParams();
  const taskStatus = searchParams.get('status');

  return (
    <button
        type='button'
        onClick={onPress}
        className={clsx('p-2 rounded-md',
          pressed ?
            taskStatus === 'doing' ? 'is-active bg-white/20' :
            taskStatus === 'edit' ? 'is-active bg-black/5' :
            '' :
            'bg-transparent',
        )}
    >{children}</button>
  )
}
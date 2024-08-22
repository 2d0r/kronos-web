import clsx from 'clsx';

interface ToolbarButtonProps {
  children: any, pressed: boolean, onPress: any, className?: string,
}

export default function ToolbarButton ({ children, pressed, onPress, className } : ToolbarButtonProps) {

  return (
    <button
        type='button'
        onClick={onPress}
        className={clsx('p-2 rounded-md',
          pressed ?
            className?.includes('doing-task') ? 'is-active bg-white/20' :
            className?.includes('task-card') ? 'is-active bg-black/5' :
            '' :
            'bg-transparent',
        )}
    >{children}</button>
  )
}
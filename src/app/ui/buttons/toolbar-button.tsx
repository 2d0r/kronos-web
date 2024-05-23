import clsx from 'clsx';
import { FC } from 'react';

const ToolbarButton: FC<{
    children: any, pressed: boolean, onPress: any, className?: string,
}> = ({children, pressed, onPress, className}) => {

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

export default ToolbarButton;
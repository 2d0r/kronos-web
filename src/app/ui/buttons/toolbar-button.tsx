import clsx from 'clsx';
import { FC } from 'react';

const ToolbarButton: FC<{
    children: any, pressed: boolean, onPress: any
}> = ({children, pressed, onPress}) => {

    return (
      <button
          onClick={onPress}
          className={`p-2 rounded-md ${pressed ? 'is-active bg-white/20' : 'bg-transparent'}`}
       >{children}</button>
    )
    
  }

export default ToolbarButton;
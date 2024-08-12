import { Editor } from '@tiptap/react';
import { FC } from 'react';
import ToolbarButton from '@/components/buttons/toolbar-button';
import { Bold, CircleCheck, HeadingIcon, Italic, List } from 'lucide-react';
import clsx from 'clsx';

const Toolbar:FC<{ editor: Editor | null, hidden?: boolean, className?: string }> = ({editor, hidden, className}) => {
    if (!editor) {
      return null
    }
  
    return (
      <div className={clsx('w-full px-3 py-2 border-b-[0.5px] border-white flex gap-2 items-center justify-center',
        hidden ? 'hidden' : '',
        className?.includes('task-card') ? 'sticky top-0 backdrop-blur-md z-50 bg-white/80 border-b-[0.5px] border-gray-300' : ''
      )}>
        <ToolbarButton
          pressed={editor.isActive('heading', {level: 3})}
          onPress={() => editor.chain().focus().toggleHeading({level: 3}).run()}
          className={className}
        ><HeadingIcon size='16' /></ToolbarButton>
        <ToolbarButton
          pressed={editor.isActive('bold')}
          onPress={() => editor.chain().focus().toggleBold().run()}
          className={className}
        ><Bold size='16' /></ToolbarButton>
        <ToolbarButton
          pressed={editor.isActive('italic')}
          onPress={() => editor.chain().focus().toggleItalic().run()}
          className={className}
        ><Italic size='16' /></ToolbarButton>
        <ToolbarButton
          pressed={editor.isActive('bulletList')}
          onPress={() => editor.chain().focus().toggleBulletList().run()}
          className={className}
        ><List size='16' /></ToolbarButton>
        <ToolbarButton
          pressed={editor.isActive('taskList')}
          onPress={() => editor.chain().focus().toggleTaskList().run()}
          className={clsx(className, editor.isActive('taskList') ? 'is-active' : '')}
        ><CircleCheck size='16' /></ToolbarButton>
    </div>);
  }

export default Toolbar;
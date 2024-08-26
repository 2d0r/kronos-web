import { Editor } from '@tiptap/react';
import ToolbarButton from '@/components/buttons/toolbar-button';
import { Bold, CircleCheck, HeadingIcon, Italic, List } from 'lucide-react';
import clsx from 'clsx';
import { useSearchParams } from 'next/navigation';

export default function Toolbar ({editor, hidden, page, className} : { 
  editor: Editor | null, 
  hidden?: boolean, 
  page?: 'edit-task' | 'doing-task', 
  className: string
}) {

    const searchParams = useSearchParams();
    const taskStatus = searchParams.get('status');

    if (!editor) {
      return null
    }
  
    return (
      <div className={clsx('w-full px-3 py-2 border-white flex gap-2 items-center justify-center rounded-3xl',
        hidden ? 'hidden' : '',
        taskStatus === 'edit' && 'sticky top-0 backdrop-blur-md z-50 bg-white/80 border-b-[0.5px] border-gray-300',
        taskStatus === 'doing' && 'border border-white/20'
      )}>
        <ToolbarButton
          pressed={editor.isActive('heading', {level: 3})}
          onPress={() => editor.chain().focus().toggleHeading({level: 3}).run()}
        ><HeadingIcon size='16' /></ToolbarButton>
        <ToolbarButton
          pressed={editor.isActive('bold')}
          onPress={() => editor.chain().focus().toggleBold().run()}
        ><Bold size='16' /></ToolbarButton>
        <ToolbarButton
          pressed={editor.isActive('italic')}
          onPress={() => editor.chain().focus().toggleItalic().run()}
        ><Italic size='16' /></ToolbarButton>
        <ToolbarButton
          pressed={editor.isActive('bulletList')}
          onPress={() => editor.chain().focus().toggleBulletList().run()}
        ><List size='16' /></ToolbarButton>
        <ToolbarButton
          pressed={editor.isActive('taskList')}
          onPress={() => editor.chain().focus().toggleTaskList().run()}
          className={clsx(className, editor.isActive('taskList') ? 'is-active' : '')}
        ><CircleCheck size='16' /></ToolbarButton>
    </div>);
};
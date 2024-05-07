import { Editor } from '@tiptap/react';
import { FC } from 'react';
import ToolbarButton from '../app/ui/buttons/toolbar-button';
import { Bold, HeadingIcon, Italic, List } from 'lucide-react';
import BulletListSVG from '@/app/ui/svg/bullet-list-svg';
import clsx from 'clsx';

const Toolbar:FC<{ editor: Editor | null, hidden?: boolean }> = ({editor, hidden}) => {
    if (!editor) {
      return null
    }
  
    return (
      <div className={clsx('w-full px-3 py-2 border-b-[0.5px] border-white flex gap-2 items-center justify-center',
        hidden ? 'hidden' : ''
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
          pressed={editor.isActive('bulletlist')}
          onPress={() => editor.chain().focus().toggleBulletList().run()}
        ><List size='16' /></ToolbarButton>
    </div>);
  }

export default Toolbar;
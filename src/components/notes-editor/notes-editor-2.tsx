'use client';

import { EditorProvider, useCurrentEditor } from '@tiptap/react'
import ToolbarButton from '../buttons/toolbar-button';
import { Bold as BoldIcon, CircleCheck, HeadingIcon, Italic as ItalicIcon, List } from 'lucide-react';
import Strike from '@tiptap/extension-strike';
import Heading from '@tiptap/extension-heading';
import { Color } from '@tiptap/extension-color';
import Bold from '@tiptap/extension-bold';
import BulletList from '@tiptap/extension-bullet-list';
import Document from '@tiptap/extension-document';
import Italic from '@tiptap/extension-italic';
import ListItem from '@tiptap/extension-list-item';
import OrderedList from '@tiptap/extension-ordered-list';
import Paragraph from '@tiptap/extension-paragraph';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import Text from '@tiptap/extension-text';
import TextStyle from '@tiptap/extension-text-style';
import Toolbar from '@/components/notes-editor/notes-toolbar';
import Placeholder from '@tiptap/extension-placeholder';
import clsx from 'clsx';
import { updateTaskNotes } from '@/lib/actions';

const MenuBar = ({ className, hidden = false }: { className: string, hidden?: boolean }) => {
    const { editor } = useCurrentEditor();
  
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
          ><BoldIcon size='16' /></ToolbarButton>
          <ToolbarButton
            pressed={editor.isActive('italic')}
            onPress={() => editor.chain().focus().toggleItalic().run()}
            className={className}
          ><ItalicIcon size='16' /></ToolbarButton>
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

const extensions = [
    Bold,
    Document, 
    Paragraph,
    Color.configure({ types: [TextStyle.name, ListItem.name] }),
    TextStyle.configure({ }),
    Text,
    BulletList.configure({
      keepAttributes: false
    }),
    Italic,
    ListItem,
    OrderedList.configure({
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
    }),
    Strike,
    TaskList.configure({
      itemTypeName: 'taskItem',
    }),
    TaskItem.configure({
      // nested: true,
    }),
    Heading.configure({
      HTMLAttributes: {
        class: 'text-lg font-semibold',
        levels: [3]
      }
    }),
    Placeholder.configure({
      // Use a placeholder:
      placeholder: 'Add notes...',
    }),
];

const editorProps = {
    attributes: {
        class: '',
        spellcheck: 'false',
    }
};
  
export default function NotesEditor2({className, taskId, notes} : {
    className: string, taskId: string, notes: string,
}) {
    return (
      <EditorProvider 
        // slotBefore={<MenuBar className={className}/>} 
        extensions={extensions} 
        content={notes || ''}
        onUpdate={(event) => updateTaskNotes(event.editor.getHTML(), taskId)}
        immediatelyRender={false}
        editorProps={editorProps}
    ></EditorProvider>
    )
}

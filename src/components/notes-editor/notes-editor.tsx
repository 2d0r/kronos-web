'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { updateTaskNotes } from '@/lib/actions';
import '@/app/globals.css';
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

export default function NotesEditor ({ notes, onChange, taskId, page } : { 
  notes: string, 
  onChange?: (richText: string) => void,
  taskId: string,
  page?: ('doing-task' | 'edit-task'),
}) {

  // const CustomTaskItem = TaskItem.extend({
  //   content: 'inline*',
  // })

  const editor = useEditor({
    extensions: [
      Bold,
      Document, 
      Paragraph,
      Color.configure({ types: [TextStyle.name, ListItem.name] }),
      // TextStyle.configure({ types: [ListItem.name] }),
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
    ],
    content: notes || '',
    editorProps: {
      attributes: {
        class: 'placeholder:white/20',
        spellcheck: 'false',
      }
    },
    onUpdate({ editor }) {
      // onChange(editor.getHTML())
      updateTaskNotes(editor.getHTML(), taskId);
    },
    immediatelyRender: false,
  });

  return (<div>
    <Toolbar editor={editor} className={clsx(
        page === 'doing-task' && 'wire-card',
      )
    } />
    <EditorContent editor={editor} 
      className={clsx('remove-default-focus text-left',
        page === 'edit-task' && 'rounded-lg px-4 pb-4 overflow-y-scroll',
        page === 'doing-task' && 'overflow-auto pt-4',
      )}
    />
  </div>);
};
'use client';

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import { FC, ReactElement, useState } from 'react';
import { updateTaskNotes } from '@/app/lib/actions';
import '@/app/globals.css';
import StarterKit from '@tiptap/starter-kit';
import Strike from '@tiptap/extension-strike';
import Heading from '@tiptap/extension-heading';
import { Color } from '@tiptap/extension-color';
import BulletList from '@tiptap/extension-bullet-list';
import Document from '@tiptap/extension-document';
import ListItem from '@tiptap/extension-list-item';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import TextStyle from '@tiptap/extension-text-style';
import Toolbar from '@/components/toolbar';
import Placeholder from '@tiptap/extension-placeholder';
import clsx from 'clsx';
import { adjustLightness } from '@/app/utils/colourUtils';
import { NEUTRAL_MINDSET_COLOUR } from '@/app/lib/definitions';

const NotesEditor: FC<{ 
  notes: string, 
  onChange?: (richText: string) => void,
  taskId: string,
  className?: string,
}> = ({ notes, onChange, taskId, className }) => {

  const editor = useEditor({
    extensions: [
      Document, Paragraph,
      Color.configure({ types: [TextStyle.name, ListItem.name] }),
      // TextStyle.configure({ types: [ListItem.name] }),
      Text,
      StarterKit.configure({
        // bulletList: {
        //   itemTypeName: 'listItem',
        //   keepMarks: false,
        //   keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
        // },
        orderedList: {
          keepMarks: true,
          keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
        },
      }),
      BulletList.configure({
        keepAttributes: false
      }),
      ListItem,
      Strike,
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
        class: '',
        spellcheck: 'false',
      }
    },
    onUpdate({ editor }) {
      // onChange(editor.getHTML())
      updateTaskNotes(editor.getHTML(), taskId);
    }
  });

  // Show notes toolbar only when focusing on textarea
  // const [ showToolbar, setShowToolbar ] = useState<boolean>(false);
  // const handleNotesBlur = (event: React.ChangeEvent<HTMLDivElement>) => {
  //   setShowToolbar(false);
  // }
  // const handleNotesSelect = (event: React.ChangeEvent<HTMLDivElement>) => {
  //   setShowToolbar(true);
  // }

  return (<div>
    <Toolbar editor={editor} className={className} />
    <EditorContent editor={editor} 
      className={clsx('h-1/4 remove-default-focus text-left overflow-auto',
        className?.includes('task-card') && 'rounded-lg px-4 pb-4',
        className?.includes('doing-task') && 'max-h-[50vh] overflow-auto p-4',
      )}
      // style={{ backgroundColor: className === 'task-card' ? adjustLightness(NEUTRAL_MINDSET_COLOUR, 0.95) : ''}}
    />
  </div>);
}

export default NotesEditor;
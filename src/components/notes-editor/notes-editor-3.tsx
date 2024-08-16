'use client';

import { updateTaskField } from '@/lib/actions';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import Text from '@tiptap/extension-text';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import React, { FC } from 'react';
import clsx from 'clsx';

const CustomDocument = Document.extend({
  content: 'taskList',
})

const CustomTaskItem = TaskItem.extend({
  content: 'inline*',
})

const NotesEditor3: FC<{ 
    notes: string, 
    onChange?: (richText: string) => void,
    taskId: string,
    className?: string,
}> = ({ notes, onChange, taskId, className }) => {

    const placeholder = `
        <ul data-type="taskList">
            <li data-checked="false" data-type="taskItem">
                <label><input type="checkbox"><span></span></label><div>Add checklist</div>
            </li>
        </ul>
    `;

    const editor = useEditor({
        extensions: [
            Document,
            Paragraph,
            Text,
            TaskList,
            CustomTaskItem,
            Placeholder.configure({
                // Use a placeholder:
                placeholder: placeholder,
            }),
        ],
        content: notes,
        onUpdate({ editor }) {
            updateTaskField(taskId, 'notes', editor.getHTML());
        },
        immediatelyRender: false,
    });

    return (<>
        <EditorContent editor={editor} 
            className={clsx('text-left remove-default-focus',
                className?.includes('task-card') && 'h-full p-4 border-b-[0.5px]',
                className?.includes('doing-task') && 'py-2 max-h-[50vh] overflow-auto rounded-lg',
                className,
            )}
            // style={{ backgroundColor: className.includes('task-card') ? adjustLightness(NEUTRAL_MINDSET_COLOUR, 0.95) : ''}}
        />
        {/* <style>{css}</style> */}
    </>)
}

export default NotesEditor3;
'use client';

import { updateTaskField } from '@/app/lib/actions';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import Text from '@tiptap/extension-text';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import React, { FC } from 'react';
import { adjustLightness } from '@/app/utils/colourUtils';
import { NEUTRAL_MINDSET_COLOUR } from '@/app/lib/definitions';
import clsx from 'clsx';

const CustomDocument = Document.extend({
  content: 'taskList',
})

const CustomTaskItem = TaskItem.extend({
  content: 'inline*',
})

const ChecklistEditor: FC<{ 
    checklist: string, 
    onChange?: (richText: string) => void,
    taskId: string,
    className?: string,
}> = ({ checklist, onChange, taskId, className }) => {

    const placeholder = `
        <ul data-type="taskList">
            <li data-checked="false" data-type="taskItem">
                <label><input type="checkbox"><span></span></label><div>Add checklist</div>
            </li>
        </ul>
    `;

    const editor = useEditor({
        extensions: [
        CustomDocument,
        Paragraph,
        Text,
        TaskList,
        CustomTaskItem,
        Placeholder.configure({
            // Use a placeholder:
            placeholder: placeholder,
        }),
        ],
        content: checklist,
        onUpdate({ editor }) {
            updateTaskField(taskId, 'checklist', editor.getHTML());
        }
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

export default ChecklistEditor;
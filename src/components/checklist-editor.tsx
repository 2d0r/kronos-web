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
import StarterKit from '@tiptap/starter-kit';

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
}> = ({ checklist, onChange, taskId }) => {

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
        StarterKit,
        Placeholder.configure({
            // Use a placeholder:
            placeholder: 'Add items',
        }),
        ],
        content: checklist,
        onUpdate({ editor }) {
            updateTaskField(taskId, 'checklist', editor.getHTML());
        }
    });

    return (<>
        <EditorContent editor={editor} 
            className='focus-visible:!border-none focus-visible:!outline-none focus:!ring-transparent text-left'
        />
        {/* <style>{css}</style> */}
    </>)
}

export default ChecklistEditor;
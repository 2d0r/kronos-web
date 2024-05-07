'use client';

import { type Editor } from '@tiptap/react';
import {
    Bold, Strikethrough, Italic, List, ListOrdered, Heading2,
} from 'lucide-react';
// import { Toggle } from  './ui/toggle';

type Props = {
    editor: Editor | null
}
export function Toolbar({editor}: Props) {
    if(!editor) {
        return null;
    }
    
    return (
        <div className=''>
            {/* <Toggle 
                size='sm'
                pressed={editor.isActive('heading')}
                onPressedChange={() =>
                    editor.chain().focus().toggleHeading({level: 2}).run()
                }
            >H</Toggle> */}
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={
                !editor.can()
                    .chain()
                    .focus()
                    .toggleBold()
                    .run()
                }
                className={editor.isActive('bold') ? 'is-active' : ''}
            >
                bold
            </button>
        </div>
    )
}
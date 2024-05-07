'use client';

import { updateTaskNotes } from '@/app/lib/actions';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw'; // We'll use this for hyperlink support

export default function MarkdownEditor({taskNotes, taskId, className} : {taskNotes: string, taskId: string, className: string}) {
    const [markdownText, setMarkdownText] = useState<string>(taskNotes);
    // const [text, setText] = useState<string>('')

    function transformHeadingShortcuts(text: string) {
        return text.replace(/^# (.*)$/gim, (match, content) => {
            if (content.trim() === '') return match;
            return `<h3>${content.trim()}</h3>`; // Use appropriate heading level and trim content
        });
    }

    const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        // setText(event.target.value);
        const newText = transformHeadingShortcuts(event.target.value);
        setMarkdownText(newText); 
        updateTaskNotes(newText, taskId);
    };

    // useEffect(() => {
    //     setMarkdownText(
    //         transformHeadingShortcuts(text)
    //     ); 
    // }, []);

    return (
        <div>
            <textarea value={markdownText} onChange={handleTextChange} placeholder='Add notes' className={className} />
            <ReactMarkdown 
                children={markdownText} 
                rehypePlugins={[rehypeRaw]} // Enable hyperlink support
            />
        </div>
    );
}
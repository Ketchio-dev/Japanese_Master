"use client";
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Quote, Heading1, Heading2, Code } from 'lucide-react';

import { SlashCommand, suggestion } from './extensions';

import { forwardRef, useImperativeHandle } from 'react';

export interface EditorHandle {
    insertContent: (content: string) => void;
    getHTML: () => string;
}

const Editor = forwardRef<EditorHandle, { content: string, onChange?: (html: string) => void }>(({ content, onChange }, ref) => {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Underline,
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            Placeholder.configure({
                placeholder: 'Type something... or "/" for commands',
            }),
            SlashCommand.configure({
                suggestion,
            }),
        ],
        content: content,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-0 focus:outline-none min-h-[50vh] dark:prose-invert max-w-none',
            },
        },
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML());
        },
    });

    useImperativeHandle(ref, () => ({
        insertContent: (text: string) => {
            if (editor) {
                editor.chain().focus().insertContent(text).run();
            }
        },
        getHTML: () => editor?.getHTML() || ""
    }));

    if (!editor) {
        return null;
    }

    const ToolbarButton = ({ onClick, isActive, icon: Icon }: any) => (
        <button
            onClick={onClick}
            className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition ${isActive ? 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
        >
            <Icon size={18} />
        </button>
    );

    return (
        <div className="w-full mt-4 pb-24 relative" >
            {/* Toolbar - Sticky if needed, or simple */}
            < div className="flex items-center gap-1 py-2 mb-2 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#191919] sticky top-0 z-10 flex-wrap transition-colors" >
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    icon={Bold}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    icon={Italic}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    isActive={editor.isActive('underline')}
                    icon={UnderlineIcon}
                />
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive('heading', { level: 1 })}
                    icon={Heading1}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive('heading', { level: 2 })}
                    icon={Heading2}
                />
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    icon={List}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    icon={ListOrdered}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive('blockquote')}
                    icon={Quote}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    isActive={editor.isActive('codeBlock')}
                    icon={Code}
                />
            </div >

            {/* Editor Area */}
            < div className="min-h-[500px] cursor-text" onClick={() => editor.chain().focus().run()}>
                <EditorContent editor={editor} />
            </div >
        </div >
    );
});

Editor.displayName = "Editor";

export default Editor;

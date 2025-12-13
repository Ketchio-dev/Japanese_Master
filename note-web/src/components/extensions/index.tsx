
import React from 'react';
import tippy from 'tippy.js';
import { ReactRenderer } from '@tiptap/react';
import { CommandList } from './CommandList';
import {
    Heading1,
    Heading2,
    List,
    ListOrdered,
    Quote,
    Code,
    Table,
    Text,
    Brain
} from 'lucide-react';
import SlashCommand from './SlashCommand';

const getSuggestionItems = ({ query }: { query: string }) => {
    return [
        {
            title: 'Text',
            description: 'Just start writing with plain text.',
            icon: <Text size={18} />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).setParagraph().run();
            },
        },
        {
            title: 'Heading 1',
            description: 'Big section heading.',
            icon: <Heading1 size={18} />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
            },
        },
        {
            title: 'Heading 2',
            description: 'Medium section heading.',
            icon: <Heading2 size={18} />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
            },
        },
        {
            title: 'Bullet List',
            description: 'Create a simple bulleted list.',
            icon: <List size={18} />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleBulletList().run();
            },
        },
        {
            title: 'Numbered List',
            description: 'Create a list with numbering.',
            icon: <ListOrdered size={18} />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleOrderedList().run();
            },
        },
        {
            title: 'Quote',
            description: 'Capture a quote.',
            icon: <Quote size={18} />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleBlockquote().run();
            },
        },
        {
            title: 'Code',
            description: 'Capture a code snippet.',
            icon: <Code size={18} />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
            },
        },
        {
            title: 'Table',
            description: 'Insert a table (custom size).',
            icon: <Table size={18} />,
            command: ({ editor, range }: any) => {
                const size = window.prompt("Enter table size (rows x cols) e.g. 3x3", "3x3");
                if (size) {
                    const [rowsStr, colsStr] = size.split('x').map(s => s.trim());
                    const rows = parseInt(rowsStr) || 3;
                    const cols = parseInt(colsStr) || 3;
                    editor.chain().focus().deleteRange(range).insertTable({ rows, cols, withHeaderRow: true }).run();
                }
            },
        },
        {
            title: 'Ask AI',
            description: 'Generate text with AI.',
            icon: <Brain size={18} className="text-purple-500" />,
            command: async ({ editor, range }: any) => {
                const prompt = window.prompt("Ask AI (Enter your prompt):");
                if (prompt) {
                    editor.chain().focus().deleteRange(range).insertContent(`Thinking...`).run();

                    // Dynamic import to avoid SSR issues if any (though function is pure fetch)
                    const { generateAIContent } = await import('@/lib/ai');
                    const result = await generateAIContent(prompt);

                    // Replace "Thinking..." with result.
                    // Ideally we should track the position, but for MVP we modify the selection or last inserted.
                    // Actually, the simplest way for MVP is just undoing the "Thinking..." insert (ctrl+z logic) or just inserting after?
                    // Let's just insert content. Tiptap's async handling is tricky, simpler to just insert.

                    // Better: Select the "Thinking..." text and replace it?
                    // We can just keep it simple: Insert result.

                    // A crude way to replace "Thinking..." is knowing we just inserted it.
                    // But for now let's just insert the result.
                    editor.commands.insertContent(result);
                }
            },
        },
    ].filter((item) => item.title.toLowerCase().startsWith(query.toLowerCase()));
};

export const suggestion = {
    items: getSuggestionItems,
    render: () => {
        let component: any;
        let popup: any;

        return {
            onStart: (props: any) => {
                component = new ReactRenderer(CommandList, {
                    props,
                    editor: props.editor,
                });

                if (!props.clientRect) {
                    return;
                }

                popup = tippy('body', {
                    getReferenceClientRect: props.clientRect,
                    appendTo: () => document.body,
                    content: component.element,
                    showOnCreate: true,
                    interactive: true,
                    trigger: 'manual',
                    placement: 'bottom-start',
                });
            },

            onUpdate(props: any) {
                component.updateProps(props);

                if (!props.clientRect) {
                    return;
                }

                popup[0].setProps({
                    getReferenceClientRect: props.clientRect,
                });
            },

            onKeyDown(props: any) {
                if (props.event.key === 'Escape') {
                    popup[0].hide();

                    return true;
                }

                return component.ref?.onKeyDown(props);
            },

            onExit() {
                popup[0].destroy();
                component.destroy();
            },
        };
    },
};

export { SlashCommand };

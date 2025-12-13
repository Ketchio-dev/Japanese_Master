"use client";

import { useState } from 'react';
import { Sparkles, FileText, Search, Database, Loader2, X } from 'lucide-react';
import { generateAIContent } from '@/lib/ai';

interface AIAssistantProps {
    onInsertContent: (content: string) => void;
    editorContent: string;
}

export default function AIAssistant({ onInsertContent, editorContent }: AIAssistantProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // AI Actions
    const handleAction = async (action: 'ORGANIZE_DOC' | 'RESEARCH' | 'ORGANIZE_DB') => {
        setIsOpen(false);
        setLoading(true);

        try {
            let prompt = "";
            let systemPrompt = "";

            if (action === 'ORGANIZE_DOC') {
                systemPrompt = "You are an expert editor. Organize, summarize, and format the following text to be more readable and structured using Markdown. Keep the original meaning but improve clarity.";
                prompt = `Please organize this content:\n\n${editorContent}`;
            } else if (action === 'RESEARCH') {
                const topic = window.prompt("What topic specifically?");
                if (!topic) {
                    setLoading(false);
                    return;
                }
                systemPrompt = "You are a research assistant. Provide a comprehensive summary and key points about the requested topic. Use Markdown.";
                prompt = `Research topic: ${topic}`;
            } else if (action === 'ORGANIZE_DB') {
                systemPrompt = "You are a database administrator. Analyze the text and suggest how to structure it into a database or table format. Provide a JSON-like or Table markdown representation.";
                prompt = `Please suggest a database structure for:\n\n${editorContent}`;
            }

            const result = await generateAIContent(prompt, systemPrompt);

            // Append result for now
            onInsertContent(`\n\n--- AI Result (${action}) ---\n${result}\n----------------------\n`);
        } catch (e) {
            console.error(e);
            alert("AI task failed. Check console.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-2">
            {/* Menu */}
            {isOpen && (
                <div className="bg-white rounded-lg shadow-xl border border-gray-100 p-2 mb-2 w-64 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center px-2 py-1 mb-2 border-b border-gray-50">
                        <span className="text-xs font-bold text-gray-400 uppercase">AI Assistant</span>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-black">
                            <X size={14} />
                        </button>
                    </div>

                    <button
                        onClick={() => handleAction('ORGANIZE_DB')}
                        className="w-full text-left px-3 py-2 rounded hover:bg-purple-50 text-sm text-gray-700 flex items-center gap-2 transition"
                    >
                        <Database size={16} className="text-purple-500" />
                        <span>Organize Database</span>
                    </button>

                    <button
                        onClick={() => handleAction('RESEARCH')}
                        className="w-full text-left px-3 py-2 rounded hover:bg-blue-50 text-sm text-gray-700 flex items-center gap-2 transition"
                    >
                        <Search size={16} className="text-blue-500" />
                        <span>Research Topic</span>
                    </button>

                    <button
                        onClick={() => handleAction('ORGANIZE_DOC')}
                        className="w-full text-left px-3 py-2 rounded hover:bg-green-50 text-sm text-gray-700 flex items-center gap-2 transition"
                    >
                        <FileText size={16} className="text-green-500" />
                        <span>Organize Document</span>
                    </button>
                </div>
            )}

            {/* Fab */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={loading}
                className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all ${loading ? "bg-gray-100 cursor-wait" : "bg-black hover:bg-gray-800 text-white hover:scale-105"
                    }`}
            >
                {loading ? <Loader2 size={20} className="animate-spin text-black" /> : <Sparkles size={20} />}
            </button>
        </div>
    );
}

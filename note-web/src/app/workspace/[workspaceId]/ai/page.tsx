"use client";

import { useState, useRef } from "react";
import {
    Sparkles,
    Paperclip,
    Globe,
    Search,
    Mic,
    ArrowUp,
    Bot,
    FileText,
    Zap,
    CheckCircle2,
    LayoutTemplate
} from "lucide-react";
import { generateAIContent } from "@/lib/ai";
import { useAuth } from "@/context/AuthContext";

export default function AIDashboard() {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);

    // For the UI state when chat hasn't started
    const [hasStarted, setHasStarted] = useState(false);

    const handleSend = async (text: string = input) => {
        if (!text.trim()) return;

        setHasStarted(true);
        const userMsg = { role: 'user' as const, content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const sysPrompt = "You are a helpful AI assistant in a workspace dashboard. Answer questions, write drafts, or help with tasks.";
            const response = await generateAIContent(text, sysPrompt);
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I ran into an error." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-white dark:bg-[#191919] text-gray-900 dark:text-gray-100 transition-colors overflow-hidden">
            {/* Header (Optional, maybe specific to dashboard) */}

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center relative p-4 max-w-3xl mx-auto w-full">

                {!hasStarted ? (
                    <div className="flex flex-col items-center w-full gap-8 animate-in fade-in zoom-in-95 duration-500">
                        {/* Logo / Mascot */}
                        <div className="w-20 h-20 bg-white dark:bg-[#191919] rounded-full shadow-xl flex items-center justify-center border border-gray-100 dark:border-gray-800 mb-4">
                            <Bot size={40} className="text-gray-800 dark:text-gray-200" />
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-2 border-[#191919]" />
                        </div>

                        <h1 className="text-3xl font-bold mb-4">How can I help you today?</h1>

                        {/* Search Box */}
                        <div className="w-full bg-white dark:bg-[#191919] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg transition-all focus-within:ring-2 focus-within:ring-blue-500/50 p-4">
                            <div className="flex flex-col gap-4">
                                {/* Top Controls */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            setInput(prev => prev + "@");
                                            // Ideally focus input here too
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-[#2C2C2C] text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333] transition"
                                    >
                                        <span className="font-bold text-gray-400">@</span> Add context
                                    </button>
                                </div>

                                {/* Input */}
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder="Ask, search, or make anything..."
                                    className="w-full bg-transparent text-lg placeholder:text-gray-400 focus:outline-none"
                                    autoFocus
                                />

                                {/* Bottom Controls */}
                                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800/50">
                                    <div className="flex items-center gap-1">
                                        <button className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#2C2C2C] text-gray-500 dark:text-gray-400 text-xs transition">
                                            <Paperclip size={14} /> <span className="hidden sm:inline">Auto</span>
                                        </button>
                                        <button className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#2C2C2C] text-gray-500 dark:text-gray-400 text-xs transition">
                                            <Globe size={14} /> <span className="hidden sm:inline">Research</span>
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none">
                                            <input type="checkbox" className="rounded border-gray-600 bg-transparent" />
                                            Allow edits
                                        </label>
                                        <button
                                            onClick={() => handleSend()}
                                            disabled={!input.trim()}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${input.trim() ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "bg-gray-200 dark:bg-[#333] text-gray-400"}`}
                                        >
                                            <ArrowUp size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* App Integrations */}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Get better answers from your apps</span>
                            <div className="flex items-center gap-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition cursor-pointer">
                                {/* Mock icons using plain divs or generic icons */}
                                <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center text-[10px] text-white font-bold">T</div>
                                <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center text-[10px] text-white font-bold">S</div>
                                <div className="w-5 h-5 bg-yellow-500 rounded flex items-center justify-center text-[10px] text-white font-bold">G</div>
                                <div className="w-5 h-5 bg-purple-500 rounded flex items-center justify-center text-[10px] text-white font-bold">D</div>
                            </div>
                        </div>

                        {/* Suggestion Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full mt-8">
                            {[
                                { icon: Sparkles, color: "text-purple-500", label: "New in AI", sub: "Check updates", prompt: "What's new in AI?" },
                                { icon: FileText, color: "text-blue-500", label: "Write agenda", sub: "For meetings", prompt: "Draft a meeting agenda for..." },
                                { icon: Search, color: "text-orange-500", label: "Analyze doc", sub: "Summarize PDF", prompt: "Summarize this document: " },
                                { icon: CheckCircle2, color: "text-green-500", label: "Task tracker", sub: "Create list", prompt: "Create a task list for project: " },
                            ].map((item, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setInput(item.prompt);
                                        // Optional: Auto focus or auto send? Let's just populate for now so user can edit.
                                    }}
                                    className="flex flex-col gap-2 p-3 rounded-xl bg-gray-50 dark:bg-[#191919] hover:bg-gray-100 dark:hover:bg-[#2A2A2A] border border-transparent dark:border-gray-800 transition text-left group"
                                >
                                    <item.icon size={20} className={item.color} />
                                    <div>
                                        <div className="font-medium text-sm text-gray-900 dark:text-gray-200">{item.label}</div>
                                        <div className="text-xs text-gray-500 group-hover:text-gray-400">{item.sub}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Chat Interface (Simple view for now) */
                    <div className="w-full h-full flex flex-col">
                        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
                                    {m.role === 'assistant' && <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">AI</div>}
                                    <div className={`p-3 rounded-lg max-w-[80%] ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-[#252525]'}`}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {loading && <div className="text-gray-400 text-sm">Thinking...</div>}
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                // onKeyDown...
                                placeholder="Reply..."
                                className="w-full bg-gray-50 dark:bg-[#191919] border border-gray-200 dark:border-gray-700 rounded-xl p-3 focus:outline-none"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

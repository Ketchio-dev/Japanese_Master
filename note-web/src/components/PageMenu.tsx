"use client";

import { useState, useRef } from 'react';
import {
    MoreHorizontal,
    Type,
    Trash,
    Copy,
    ArrowUpRight,
    Download,
    Upload,
    Lock,
    Unlock,
    LayoutTemplate,
    Search,
    Undo,
    History,
    FileText,
    Check
} from 'lucide-react';
import { Page } from '@/lib/workspace';

interface PageMenuProps {
    page: Page;
    onUpdate: (data: Partial<Page>) => void;
    onDelete: () => void;
    onDuplicate: () => void;
}

export default function PageMenu({ page, onUpdate, onDelete, onDuplicate }: PageMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Close menu when clicking outside (simple implementation using backdrop)
    const toggleMenu = () => setIsOpen(!isOpen);

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            if (text) {
                // Confirm before overwriting if there is content? 
                // For now, simpler is better for "Import". Just append or replace?
                // The user usually expects Import to LOAD the file. Replacing is the standard "Open" behavior.
                // But typically safer to confirm. Since I cannot easily confirm here without more UI, I'll just append?
                // No, "Import" in this context usually means "Replace". But let's check if the page is empty?
                // If I overwrite, I might lose data.
                // Let's standardly PREPEND or APPEND to be safe, or just REPLACE if user wants 'Import'.
                // Given "Export/Import" symmetry, user might expect to be able to "Restore" from an export.
                // I will REPLACE the content with the imported text. This is consistent with "Opening" a file.
                onUpdate({ content: text });
                setIsOpen(false);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="relative z-50">
            <button
                onClick={toggleMenu}
                className="text-gray-400 hover:text-black transition p-1 rounded hover:bg-gray-100"
            >
                <MoreHorizontal size={20} />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

                    {/* Menu Content */}
                    <div className="absolute right-0 top-8 w-[280px] bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-2 animate-in fade-in zoom-in-95 duration-100 dark:bg-[#1C1C1C] dark:border-gray-700">

                        {/* Style Section */}
                        <div className="px-4 py-2">
                            <div className="text-xs text-gray-500 font-medium mb-2 pl-1">Style</div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onUpdate({ font: 'default' })}
                                    className={`flex-1 h-20 rounded border flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition relative ${page.font === 'default' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200'}`}
                                >
                                    <span className="text-2xl font-sans">Ag</span>
                                    <span className="text-xs text-gray-500">Default</span>
                                    {page.font === 'default' && <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />}
                                </button>
                                <button
                                    onClick={() => onUpdate({ font: 'serif' })}
                                    className={`flex-1 h-20 rounded border flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition relative ${page.font === 'serif' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200'}`}
                                >
                                    <span className="text-2xl font-serif">Ag</span>
                                    <span className="text-xs text-gray-500">Serif</span>
                                    {page.font === 'serif' && <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />}
                                </button>
                                <button
                                    onClick={() => onUpdate({ font: 'mono' })}
                                    className={`flex-1 h-20 rounded border flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition relative ${page.font === 'mono' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200'}`}
                                >
                                    <span className="text-2xl font-mono">Ag</span>
                                    <span className="text-xs text-gray-500">Mono</span>
                                    {page.font === 'mono' && <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />}
                                </button>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100 my-1 dark:bg-gray-800" />

                        {/* Toggles */}
                        <div className="py-1">
                            <button
                                onClick={() => onUpdate({ smallText: !page.smallText })}
                                className="w-full flex items-center justify-between px-4 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm text-gray-700 dark:text-gray-300"
                            >
                                <div className="flex items-center gap-2">
                                    <Type size={16} className="text-gray-400" />
                                    <span>Small text</span>
                                </div>
                                <div className={`w-9 h-5 rounded-full relative transition-colors ${page.smallText ? 'bg-blue-500' : 'bg-gray-300'}`}>
                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${page.smallText ? 'left-4.5 translate-x-3.5' : 'left-0.5'}`} />
                                </div>
                            </button>

                            <button
                                onClick={() => onUpdate({ fullWidth: !page.fullWidth })}
                                className="w-full flex items-center justify-between px-4 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm text-gray-700 dark:text-gray-300"
                            >
                                <div className="flex items-center gap-2">
                                    <LayoutTemplate size={16} className="text-gray-400" />
                                    <span>Full width</span>
                                </div>
                                <div className={`w-9 h-5 rounded-full relative transition-colors ${page.fullWidth ? 'bg-blue-500' : 'bg-gray-300'}`}>
                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${page.fullWidth ? 'left-4.5 translate-x-3.5' : 'left-0.5'}`} />
                                </div>
                            </button>
                        </div>

                        <div className="h-px bg-gray-100 my-1 dark:bg-gray-800" />

                        {/* Actions Group 1 */}
                        <div className="py-1">
                            <button className="w-full flex items-center px-4 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm text-gray-700 dark:text-gray-300 gap-2">
                                <ArrowUpRight size={16} className="text-gray-400" />
                                <span>Copy link</span>
                                <span className="ml-auto text-xs text-gray-400">⌘L</span>
                            </button>
                            <button
                                onClick={onDuplicate}
                                className="w-full flex items-center px-4 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm text-gray-700 dark:text-gray-300 gap-2"
                            >
                                <Copy size={16} className="text-gray-400" />
                                <span>Duplicate</span>
                                <span className="ml-auto text-xs text-gray-400">⌘D</span>
                            </button>
                        </div>

                        <div className="h-px bg-gray-100 my-1 dark:bg-gray-800" />

                        {/* Lock */}
                        <div className="py-1">
                            <button
                                onClick={() => onUpdate({ locked: !page.locked })}
                                className="w-full flex items-center justify-between px-4 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm text-gray-700 dark:text-gray-300"
                            >
                                <div className="flex items-center gap-2">
                                    {page.locked ? <Lock size={16} className="text-blue-500" /> : <Unlock size={16} className="text-gray-400" />}
                                    <span>Lock page</span>
                                </div>
                                <div className={`w-9 h-5 rounded-full relative transition-colors ${page.locked ? 'bg-blue-500' : 'bg-gray-300'}`}>
                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${page.locked ? 'left-4.5 translate-x-3.5' : 'left-0.5'}`} />
                                </div>
                            </button>
                        </div>

                        <div className="h-px bg-gray-100 my-1 dark:bg-gray-800" />

                        {/* Export / Delete */}
                        <div className="py-1">
                            <button onClick={onDelete} className="w-full flex items-center px-4 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition text-sm text-red-600 gap-2">
                                <Trash size={16} />
                                <span>Delete Page</span>
                            </button>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full flex items-center px-4 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm text-gray-700 dark:text-gray-300 gap-2"
                            >
                                <Upload size={16} className="text-gray-400" />
                                <span>Import</span>
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImport}
                                className="hidden"
                                accept=".md,.txt,.json,.html"
                            />
                            <button className="w-full flex items-center px-4 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm text-gray-700 dark:text-gray-300 gap-2">
                                <Download size={16} className="text-gray-400" />
                                <span>Export</span>
                            </button>
                        </div>

                        {/* Footer Info */}
                        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800">
                            <div className="text-xs text-gray-400">
                                Last edited today at 3:45 PM
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

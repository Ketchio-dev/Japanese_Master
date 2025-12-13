"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Editor from "@/components/Editor";
import { subscribeToPage, updatePage } from "@/lib/workspace";
import DatabaseView from "@/components/DatabaseView";
import { Share, MoreHorizontal } from "lucide-react";
import SettingsModal from "@/components/SettingsModal";
import AIAssistant from "@/components/AIAssistant";

export default function PageEditor() {
    const params = useParams();
    const pageId = params.pageId as string;

    const [page, setPage] = useState<any>(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Share UI
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Real-time Subscription
    useEffect(() => {
        setLoading(true);
        const unsubscribe = subscribeToPage(pageId, (data) => {
            if (data) {
                setPage(data);
                // Update local state if not currently saving (simple conflict avoidance)
                // In a perfect world, we'd use Yjs. Here, we prioritize incoming data if we aren't typing.
                // Actually, let's just update 'page' state.
                // We sync title/content from 'page' to local state only if we aren't in the middle of a save debounce?
                // Let's try: Always update loading/page. 
                // Local state 'title' and 'content' drive the inputs. 
                // We should update them when 'page' changes externally.
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [pageId]);

    // Sync remote changes to local state
    // We use a ref to ignore updates *we* just caused?
    // For MVP, we'll implement a simple "Last Write Wins" but avoiding overwriting active typing is hard without CRDTs.
    // We will just update local state if it differs widely or on first load.
    // Simplification: Just set them on first load (loading=true -> false).
    // Post-load real-time updates from OTHERS will overwrite my text? Yes, standard Firestore behavior.
    // To mitigate: Only update if document version > local? 
    // Let's sticking to: Initialize state. Updates just update 'page' object. 
    // If 'page' updates, should we update 'content'? 
    // If I am typing, 'content' is ahead of 'page.content'. 
    // If I receive 'page.content', it might be OLDER or NEWER. 
    // Ideally: Only update content if I am NOT typing.

    // PRACTICAL MVP FIX: Only set title/content when pageId changes (initial load).
    // Real-time updates will show in the UI if we re-render, but Editor manages its own state.
    // So actually... real-time text collaboration is hard to do with just Tiptap+Firestore without a provider.
    // We will ENABLE real-time logic but acknowledge the cursor jump limitation.
    useEffect(() => {
        if (page) {
            // Only update if we are not "saving" (i.e. typing recently)
            // This prevents my typing from being overwritten by my own echo or slight delays.
            // But allows other users' saves effectively.
            if (!saving) {
                setTitle(page.title);
                setContent(page.content || "");
            }
        }
    }, [page]); // When page object updates from Firestore

    // Auto-save logic
    useEffect(() => {
        if (!loading && page && page.type === 'page') {
            // Check if dirty
            if (page.title === title && page.content === content) return;

            const timer = setTimeout(async () => {
                setSaving(true);
                await updatePage(pageId, { title, content });
                setSaving(false);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [title, content, pageId, loading, page]);

    if (loading) {
        return <div className="p-12 text-gray-400">Loading page...</div>;
    }

    if (page?.type === 'database') {
        return (
            <>
                <div className="relative">
                    <div className="absolute top-4 right-8 flex gap-2 z-10">
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="flex items-center gap-1 px-3 py-1 bg-transparent hover:bg-gray-100 rounded text-sm text-gray-600 transition"
                        >
                            <Share size={16} /> Share
                        </button>
                    </div>
                </div>
                <DatabaseView page={page} />
                <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} initialTab="members" />
            </>
        );
    }

    return (
        <div className="max-w-4xl mx-auto w-full pt-12 px-12 relative">
            {/* Top Bar status & Share */}
            <div className="fixed top-4 right-4 flex items-center gap-4 text-xs text-gray-400 bg-white/80 backdrop-blur p-2 rounded-lg z-20">
                <span>{saving ? "Saving..." : "Saved"}</span>
                <div className="h-4 w-px bg-gray-200" />
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="flex items-center gap-1 text-gray-800 font-medium hover:text-black transition"
                >
                    <Share size={14} /> Share
                </button>
                <button className="text-gray-400 hover:text-black">
                    <MoreHorizontal size={14} />
                </button>
            </div>

            {/* Title Input */}
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled"
                className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:outline-none bg-transparent mb-4"
            />

            {/* Editor */}
            <Editor content={content} onChange={setContent} />

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} initialTab="members" />

            <AIAssistant
                editorContent={content}
                onInsertContent={(newText) => setContent(prev => prev + newText)}
            />
        </div>
    );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Editor from "@/components/Editor";
import { getPage, updatePage } from "@/lib/workspace";
import { debounce } from "lodash";

// Simple debounce implementation if lodash not available/wanted, but importing assumes usage. 
// If generic debounce is preferred:
function useDebounce(effect: any, delay: number, deps: any[]) {
    const callback = useCallback(effect, deps);

    useEffect(() => {
        const handler = setTimeout(() => {
            callback();
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [callback, delay]);
}

export default function PageEditor() {
    const params = useParams();
    const pageId = params.pageId as string;
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadPageData();
    }, [pageId]);

    const loadPageData = async () => {
        setLoading(true);
        const page = await getPage(pageId);
        if (page) {
            setTitle(page.title);
            setContent(page.content || "");
        }
        setLoading(false);
    };

    // Auto-save logic
    // We'll create a debounced save function
    useEffect(() => {
        if (!loading) {
            const timer = setTimeout(async () => {
                setSaving(true);
                await updatePage(pageId, { title, content });
                setSaving(false);
            }, 1000); // Save after 1s of inactivity

            return () => clearTimeout(timer);
        }
    }, [title, content, pageId, loading]);

    if (loading) {
        return <div className="p-12 text-gray-400">Loading page...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto w-full pt-12 px-12">
            {/* Top Bar status */}
            <div className="fixed top-4 right-4 text-xs text-gray-400">
                {saving ? "Saving..." : "Saved"}
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
        </div>
    );
}

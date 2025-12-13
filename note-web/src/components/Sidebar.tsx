"use client";

import { useState, useEffect } from "react";
import { Page, createPage, subscribeToWorkspacePages, updatePage } from "@/lib/workspace";
import { ChevronRight, ChevronDown, FileText, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import SettingsModal from "./SettingsModal";

// Recursive Page Info Component
const PageItem = ({
    page,
    level,
    allPages,
    onAddPage,
    activeId
}: {
    page: Page,
    level: number,
    allPages: Page[],
    onAddPage: (parentId: string) => void,
    activeId: string | null
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const children = allPages.filter(p => p.parentId === page.id);
    const hasChildren = children.length > 0;
    const isActive = activeId === page.id;

    return (
        <div className="select-none">
            <div
                className={`group flex items-center gap-1 px-2 py-1 rounded-sm hover:bg-gray-200 cursor-pointer ${isActive ? "bg-gray-200 font-medium" : "text-gray-600"}`}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
            >
                <button
                    onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                    className={`p-0.5 rounded hover:bg-gray-300 ${!hasChildren ? "opacity-0 group-hover:opacity-100" : ""}`}
                >
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>

                <Link href={`/workspace/${page.workspaceId}/${page.id}`} className="flex-1 flex items-center gap-2 overflow-hidden truncate">
                    <span className="flex-shrink-0">{page.icon || <FileText size={16} />}</span>
                    <span className="truncate">{page.title || "Untitled"}</span>
                </Link>

                <button
                    onClick={(e) => { e.stopPropagation(); onAddPage(page.id); }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-gray-300"
                >
                    <Plus size={14} />
                </button>
            </div>

            {isOpen && children.length > 0 && (
                <div>
                    {children.map(child => (
                        <PageItem
                            key={child.id}
                            page={child}
                            level={level + 1}
                            allPages={allPages}
                            onAddPage={onAddPage}
                            activeId={activeId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

import { useAuth } from "@/context/AuthContext";

// ... PageItem ...

export default function Sidebar({ workspaceId }: { workspaceId: string }) {
    const [pages, setPages] = useState<Page[]>([]);
    const params = useParams();
    const router = useRouter();
    const activePageId = params.pageId as string | null;
    const { user } = useAuth();

    useEffect(() => {
        if (workspaceId) {
            const unsubscribe = subscribeToWorkspacePages(workspaceId, (data) => {
                setPages(data);
            });
            return () => unsubscribe();
        }
    }, [workspaceId]);

    const handleCreatePage = async (parentId: string | null = null, section: 'private' | 'workspace' = 'workspace') => {
        if (!user) return;
        const newPage = await createPage(workspaceId, parentId, "Untitled", "page", section, user.uid);
        router.push(`/workspace/${workspaceId}/${newPage.id}`);
    };

    // Root pages (no parent)
    const rootPages = pages.filter(p => !p.parentId);

    // Private: section is 'private' AND createdBy is me
    const privateRootPages = rootPages.filter(p => p.section === 'private' && p.createdBy === user?.uid);

    // Workspace: section is 'workspace' OR undefined (legacy)
    const workspaceRootPages = rootPages.filter(p => p.section !== 'private');

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const handleDragStart = (e: React.DragEvent, pageId: string) => {
        e.dataTransfer.setData("pageId", pageId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (e: React.DragEvent, targetSection: 'workspace' | 'private') => {
        e.preventDefault();
        const pageId = e.dataTransfer.getData("pageId");
        if (!pageId) return;
        await updatePage(pageId, { section: targetSection });
    };

    return (
        <>
            <aside className="w-60 bg-gray-50 border-r border-gray-200 h-screen flex flex-col flex-shrink-0">
                {/* Workspace Switcher / Name */}
                <div className="p-3 hover:bg-gray-200 cursor-pointer transition flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-orange-400 rounded flex items-center justify-center text-xs text-white font-bold">W</div>
                    <span className="font-bold text-sm truncate">My Workspace</span>
                    <ChevronDown size={12} className="ml-auto opacity-50" />
                </div>

                {/* Scrollable Page List */}
                <div className="flex-1 overflow-y-auto px-2 pb-4">
                    {/* Favorites or Quick Links could go here */}

                    {/* WORKSPACE SECTION */}
                    <div
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'workspace')}
                        className="transition-colors rounded hover:bg-gray-100/50 pb-4"
                    >
                        <div className="text-xs font-bold text-gray-400 px-2 py-1 mb-1 mt-2 flex items-center gap-2">
                            WORKSPACE
                        </div>
                        {workspaceRootPages.map(page => (
                            <div key={page.id} draggable onDragStart={(e) => handleDragStart(e, page.id)}>
                                <PageItem
                                    page={page}
                                    level={0}
                                    allPages={pages}
                                    onAddPage={(parentId) => handleCreatePage(parentId, page.section || 'workspace')}
                                    activeId={activePageId}
                                />
                            </div>
                        ))}
                        <button
                            onClick={() => handleCreatePage(null, 'workspace')}
                            className="text-gray-500 hover:text-black hover:bg-gray-200 w-full text-left px-2 py-1 rounded text-sm flex items-center gap-2"
                        >
                            <Plus size={16} /> Add a page
                        </button>
                    </div>

                    {/* PRIVATE SECTION */}
                    <div
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'private')}
                        className="transition-colors rounded hover:bg-gray-100/50 pb-4"
                    >
                        <div className="text-xs font-bold text-gray-400 px-2 py-1 mb-1 mt-6">PRIVATE</div>
                        {privateRootPages.map(page => (
                            <div key={page.id} draggable onDragStart={(e) => handleDragStart(e, page.id)}>
                                <PageItem
                                    page={page}
                                    level={0}
                                    allPages={pages}
                                    onAddPage={(parentId) => handleCreatePage(parentId, 'private')}
                                    activeId={activePageId}
                                />
                            </div>
                        ))}
                        <button
                            onClick={() => handleCreatePage(null, 'private')}
                            className="text-gray-500 hover:text-black hover:bg-gray-200 w-full text-left px-2 py-1 rounded text-sm flex items-center gap-2"
                        >
                            <Plus size={16} /> Add a page
                        </button>
                    </div>

                </div>
                {/* Bottom Menu */}
                <div className="p-2 border-t border-gray-200">
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="flex items-center gap-2 p-2 hover:bg-gray-200 rounded cursor-pointer text-sm text-gray-600 w-full text-left"
                    >
                        <Settings size={16} />
                        <span>Settings & members</span>
                    </button>
                </div>
            </aside>
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </>
    );
}

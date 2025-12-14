"use client";

import { useState, useEffect } from "react";
import { Page, createPage, updatePage } from "@/lib/workspace";
import { Plus, Hash, Type, Calendar, ChevronDown, FileText, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DatabaseViewProps {
    workspaceId: string;
    parentPage: Page;
    childPages: Page[];
    onUpdateParent: (data: Partial<Page>) => void;
}

export default function DatabaseView({ workspaceId, parentPage, childPages, onUpdateParent }: DatabaseViewProps) {
    const router = useRouter();

    // Ensure properties is defined
    const columns = parentPage.properties || [];

    const addColumn = async () => {
        const name = prompt("Column name?");
        if (!name) return;

        // Simple default for MVP: text type
        const newCol = { id: crypto.randomUUID(), name, type: 'text' as const };

        onUpdateParent({
            properties: [...columns, newCol]
        });
    };

    const updateCellValue = async (pageId: string, propertyId: string, value: any) => {
        const page = childPages.find(p => p.id === pageId);
        if (!page) return;

        const newValues = { ...(page.propertyValues || {}), [propertyId]: value };
        await updatePage(pageId, { propertyValues: newValues });
    };

    const handleNewRow = async () => {
        await createPage(workspaceId, parentPage.id, "Untitled", 'page', parentPage.section, parentPage.createdBy);
    };

    return (
        <div className="w-full overflow-x-auto pb-20 pl-4 md:pl-0">
            {/* Header / Controls */}
            <div className="flex items-center gap-2 mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">
                <div className="flex items-center gap-1 font-semibold text-sm px-2 py-1 bg-gray-100 dark:bg-[#2C2C2C] rounded text-gray-700 dark:text-gray-300">
                    <Hash size={14} /> Table
                </div>
                <div className="text-gray-400 text-xs px-2">
                    {childPages.length} items
                </div>
                <div className="flex-1" />
                <button onClick={handleNewRow} className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded text-sm hover:bg-blue-700 transition">
                    New <ChevronDown size={12} />
                </button>
            </div>

            <table className="w-full border-collapse min-w-[600px] text-sm">
                <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                        {/* Name Column (Fixed) */}
                        <th className="w-[300px] min-w-[200px] text-left py-2 px-3 font-normal text-xs text-gray-500 border-r border-gray-200 dark:border-gray-800/50">
                            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2C2C2C] p-1 rounded -ml-1">
                                <FileText size={14} /> Name
                            </div>
                        </th>

                        {/* Dynamic Columns */}
                        {columns.map(col => (
                            <th key={col.id} className="w-[180px] min-w-[100px] text-left py-2 px-3 font-normal text-xs text-gray-500 border-r border-gray-200 dark:border-gray-800/50 group">
                                <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2C2C2C] p-1 rounded -ml-1">
                                    {col.type === 'number' ? <Hash size={14} /> : <Type size={14} />}
                                    {col.name}
                                </div>
                            </th>
                        ))}

                        {/* Add Column Button */}
                        <th className="w-[50px] text-left py-2 px-1 border-r border-transparent">
                            <button onClick={addColumn} className="p-1 hover:bg-gray-100 dark:hover:bg-[#2C2C2C] rounded transition">
                                <Plus size={16} className="text-gray-400" />
                            </button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {childPages.map(page => (
                        <tr key={page.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#202020] group h-[34px]">
                            {/* Name Cell */}
                            <td className="p-0 border-r border-gray-100 dark:border-gray-800/50 relative">
                                <div className="flex items-center gap-2 px-3 h-full">
                                    <button
                                        className="p-1 hover:bg-gray-200 dark:hover:bg-[#333] rounded text-gray-400 transition"
                                        onClick={() => router.push(`/workspace/${workspaceId}/${page.id}`)}
                                        title="Open Page"
                                    >
                                        <FileText size={14} />
                                    </button>
                                    <input
                                        className="flex-1 bg-transparent outline-none font-medium text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                        value={page.title}
                                        onChange={(e) => updatePage(page.id, { title: e.target.value })}
                                        placeholder="Untitled"
                                    />
                                    <span
                                        className="text-[10px] text-gray-400 uppercase font-bold opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-[#333] px-1 rounded cursor-pointer transition"
                                        onClick={() => router.push(`/workspace/${workspaceId}/${page.id}`)}
                                    >
                                        Open
                                    </span>
                                </div>
                            </td>

                            {/* Property Cells */}
                            {columns.map(col => (
                                <td key={col.id} className="p-0 border-r border-gray-100 dark:border-gray-800/50">
                                    <input
                                        className="w-full h-full px-3 bg-transparent outline-none text-gray-700 dark:text-gray-300 placeholder:text-gray-300 dark:placeholder:text-gray-700"
                                        value={page.propertyValues?.[col.id] || ""}
                                        onChange={(e) => updateCellValue(page.id, col.id, e.target.value)}
                                        placeholder=""
                                    />
                                </td>
                            ))}

                            <td className="p-0 border-gray-100 dark:border-gray-800/50" />
                        </tr>
                    ))}

                    {/* Make New Row */}
                    <tr className="border-b border-transparent">
                        <td className="py-2 px-3 border-r border-gray-100 dark:border-gray-800/50 cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm flex items-center gap-2 select-none" onClick={handleNewRow}>
                            <Plus size={14} /> New
                        </td>
                        <td colSpan={columns.length + 1} />
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

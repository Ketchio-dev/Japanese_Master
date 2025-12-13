"use client";

import { useState, useEffect } from "react";
import { Page, updatePage, createPage, getChildPages } from "@/lib/workspace";
import { Plus, Type, Hash, Calendar, Settings, FileText } from "lucide-react";
import Link from "next/link";

export default function DatabaseView({ page }: { page: Page }) {
    const [properties, setProperties] = useState(page.properties || []);
    const [rows, setRows] = useState<Page[]>([]);

    useEffect(() => {
        loadRows();
    }, [page.id]);

    const loadRows = async () => {
        const children = await getChildPages(page.id);
        setRows(children);
    };

    const addProperty = async () => {
        const typeInput = window.prompt("Property Type? (text, number, date, select)", "text");
        if (!typeInput) return;

        const type = (['text', 'number', 'date', 'select'].includes(typeInput) ? typeInput : 'text') as any;
        let options: string[] = [];

        if (type === 'select') {
            const opts = window.prompt("Options? (comma separated)", "To Do,In Progress,Done");
            if (opts) options = opts.split(',').map(s => s.trim());
        }

        const newProp = {
            id: crypto.randomUUID(),
            name: "New " + type,
            type,
            options
        };
        const updatedProps = [...properties, newProp];
        setProperties(updatedProps);
        await updatePage(page.id, { properties: updatedProps });
    };

    const addRow = async () => {
        await createPage(page.workspaceId, page.id, "New Item", "page");
        loadRows();
    };

    const updateCellValue = async (rowId: string, propId: string, value: any) => {
        // Optimistic update
        setRows(prev => prev.map(r => {
            if (r.id === rowId) {
                return {
                    ...r,
                    propertyValues: {
                        ...r.propertyValues,
                        [propId]: value
                    }
                };
            }
            return r;
        }));

        // Persist
        const row = rows.find(r => r.id === rowId);
        if (row) {
            await updatePage(rowId, {
                propertyValues: {
                    ...row.propertyValues,
                    [propId]: value
                }
            });
        }
    };

    // ... inside component
    const [viewMode, setViewMode] = useState<'table' | 'board'>('table');

    // Find first select property for Board grouping
    const groupProperty = properties.find(p => p.type === 'select');

    const handleDragStart = (e: React.DragEvent, rowId: string) => {
        e.dataTransfer.setData("rowId", rowId);
    };

    const handleDrop = (e: React.DragEvent, optionValue: string) => {
        e.preventDefault();
        const rowId = e.dataTransfer.getData("rowId");
        if (rowId && groupProperty) {
            updateCellValue(rowId, groupProperty.id, optionValue);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    return (
        <div className="w-full overflow-x-auto pb-48 px-8 mt-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-bold">{page.title}</h1>
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('table')}
                        className={`px-3 py-1 rounded text-sm font-medium transition ${viewMode === 'table' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-black'}`}
                    >
                        Table
                    </button>
                    <button
                        onClick={() => setViewMode('board')}
                        className={`px-3 py-1 rounded text-sm font-medium transition ${viewMode === 'board' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-black'}`}
                    >
                        Board
                    </button>
                </div>
            </div>

            {viewMode === 'table' ? (
                /* Table Implementation */
                <div className="border border-gray-200 rounded-lg overflow-hidden min-w-[800px] bg-white text-sm">
                    {/* ... Header ... */}
                    <div className="flex bg-gray-50 border-b border-gray-200">
                        <div className="w-10 flex-shrink-0 border-r border-gray-200 p-2"></div>
                        <div className="w-64 flex-shrink-0 border-r border-gray-200 p-2 font-medium text-gray-600 flex items-center gap-2">
                            <Type size={14} /> Name
                        </div>
                        {properties.map(prop => (
                            <div key={prop.id} className="w-48 flex-shrink-0 border-r border-gray-200 p-2 text-gray-600 flex items-center gap-2 group relative">
                                {prop.type === 'text' && <Type size={14} />}
                                {prop.type === 'number' && <Hash size={14} />}
                                {prop.type === 'select' && <Settings size={14} />}
                                {prop.type === 'date' && <Calendar size={14} />}
                                <span className="flex-1 truncate">{prop.name}</span>
                            </div>
                        ))}
                        <button
                            onClick={addProperty}
                            className="w-10 flex-shrink-0 flex items-center justify-center hover:bg-gray-100 text-gray-400"
                        >
                            <Plus size={16} />
                        </button>
                    </div>

                    {/* Rows */}
                    {rows.length === 0 && (
                        <div className="p-4 text-center text-gray-400">
                            No items yet. Click "New" to add a row.
                        </div>
                    )}

                    {rows.map((row, i) => (
                        <div key={row.id} className="flex border-b border-gray-200 hover:bg-gray-50 group">
                            <div className="w-10 flex-shrink-0 border-r border-gray-200 p-2 text-center text-xs text-gray-400 flex items-center justify-center">
                                {i + 1}
                            </div>
                            <div className="w-64 flex-shrink-0 border-r border-gray-200 p-2 font-medium flex items-center gap-2">
                                <FileText size={14} className="text-gray-400" />
                                <Link href={`/workspace/${row.workspaceId}/${row.id}`} className="hover:underline truncate w-full text-gray-800">
                                    {row.title || "Untitled"}
                                </Link>
                            </div>
                            {properties.map(prop => (
                                <div key={prop.id} className="w-48 flex-shrink-0 border-r border-gray-200 p-0 text-gray-900 overflow-hidden relative">
                                    {prop.type === 'select' ? (
                                        <select
                                            className="w-full h-full p-2 bg-transparent border-none focus:ring-0 focus:bg-white appearance-none"
                                            value={row.propertyValues?.[prop.id] || ""}
                                            onChange={(e) => updateCellValue(row.id, prop.id, e.target.value)}
                                        >
                                            <option value="">Select...</option>
                                            {prop.options?.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    ) : prop.type === 'date' ? (
                                        <input
                                            type="date"
                                            className="w-full h-full p-2 bg-transparent border-none focus:ring-0 focus:bg-white"
                                            value={row.propertyValues?.[prop.id] || ""}
                                            onChange={(e) => updateCellValue(row.id, prop.id, e.target.value)}
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            className="w-full h-full p-2 bg-transparent border-none focus:ring-0 focus:bg-white"
                                            value={row.propertyValues?.[prop.id] || ""}
                                            onChange={(e) => updateCellValue(row.id, prop.id, e.target.value)}
                                            placeholder="Empty"
                                        />
                                    )}
                                </div>
                            ))}
                            <div className="w-10 flex-shrink-0 bg-gray-50"></div>
                        </div>
                    ))}

                    <div
                        onClick={addRow}
                        className="border-t border-gray-100 p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2 text-gray-500"
                    >
                        <Plus size={16} /> New
                    </div>
                </div>
            ) : (
                /* Board Implementation */
                <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[500px]">
                    {!groupProperty && <div className="text-gray-400">Add a 'Select' property to use Board view.</div>}

                    {groupProperty?.options?.map(opt => (
                        <div
                            key={opt}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, opt)}
                            className="w-64 flex-shrink-0 bg-gray-50 rounded-lg p-3 min-h-[200px]"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-2 py-0.5 bg-gray-200 rounded text-xs font-bold text-gray-600">{opt}</span>
                                <span className="text-xs text-gray-400">{rows.filter(r => r.propertyValues?.[groupProperty.id] === opt).length}</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                {rows.filter(r => r.propertyValues?.[groupProperty.id] === opt).map(row => (
                                    <div
                                        key={row.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, row.id)}
                                        className="bg-white p-3 rounded shadow-sm hover:shadow cursor-grab border border-gray-200 active:cursor-grabbing"
                                    >
                                        <Link href={`/workspace/${row.workspaceId}/${row.id}`} className="font-medium text-sm block mb-2 hover:underline">
                                            {row.title || "Untitled"}
                                        </Link>
                                        <div className="text-xs text-gray-400">
                                            {/* Show other properties casually */}
                                            {properties.filter(p => p.id !== groupProperty.id).map(p => {
                                                const val = row.propertyValues?.[p.id];
                                                if (!val) return null;
                                                return <div key={p.id} className="truncate">{p.name}: {val}</div>
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {/* No Status Column */}
                    <div
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, "")}
                        className="w-64 flex-shrink-0 bg-gray-50/50 rounded-lg p-3 min-h-[200px] border-dashed border-2 border-gray-200"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-bold text-gray-400">No Status</span>
                            <span className="text-xs text-gray-400">{rows.filter(r => !r.propertyValues?.[groupProperty!.id]).length}</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            {rows.filter(r => !r.propertyValues?.[groupProperty!.id]).map(row => (
                                <div
                                    key={row.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, row.id)}
                                    className="bg-white p-3 rounded shadow-sm hover:shadow cursor-grab border border-gray-200"
                                >
                                    <Link href={`/workspace/${row.workspaceId}/${row.id}`} className="font-medium text-sm block mb-2 hover:underline">
                                        {row.title || "Untitled"}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

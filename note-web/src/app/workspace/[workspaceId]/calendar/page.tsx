"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, Trash2, X } from "lucide-react";

interface CalendarEvent {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
}

export default function CalendarPage() {
    const params = useParams();
    const workspaceId = params.workspaceId as string;
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<number | null>(null);
    const [eventTitleInput, setEventTitleInput] = useState(""); // Shared input for create/edit
    const [editingEventId, setEditingEventId] = useState<string | null>(null); // Track if editing

    const inputRef = useRef<HTMLInputElement>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Load events from LocalStorage on mount
    useEffect(() => {
        if (!workspaceId) return;
        const savedEvents = localStorage.getItem(`calendar_events_${workspaceId}`);
        if (savedEvents) {
            setEvents(JSON.parse(savedEvents));
        }
    }, [workspaceId]);

    // Focus input when modal opens
    useEffect(() => {
        if (isModalOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isModalOpen]);

    const saveEvents = (newEvents: CalendarEvent[]) => {
        setEvents(newEvents);
        localStorage.setItem(`calendar_events_${workspaceId}`, JSON.stringify(newEvents));
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    };
    
    const getEventsForDay = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return events.filter(e => e.date === dateStr);
    };

    // OPEN MODAL: Create New
    const openAddModal = (day: number) => {
        setSelectedDate(day);
        setEditingEventId(null);
        setEventTitleInput("");
        setIsModalOpen(true);
    };

    // OPEN MODAL: Edit Existing
    const openEditModal = (e: React.MouseEvent, event: CalendarEvent) => {
        e.stopPropagation(); // Prevent triggering day click if we had one (though buttons are separate)
        const day = parseInt(event.date.split('-')[2], 10);
        setSelectedDate(day);
        setEditingEventId(event.id);
        setEventTitleInput(event.title);
        setIsModalOpen(true);
    };

    const closeAddModal = () => {
        setIsModalOpen(false);
        setSelectedDate(null);
        setEditingEventId(null);
        setEventTitleInput("");
    };

    const confirmEvent = () => {
        if (selectedDate && eventTitleInput.trim()) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
            
            let newEvents = [...events];

            if (editingEventId) {
                // UPDATE existing
                newEvents = newEvents.map(ev => 
                    ev.id === editingEventId 
                        ? { ...ev, title: eventTitleInput.trim() }
                        : ev
                );
            } else {
                // CREATE new
                const newEvent: CalendarEvent = {
                    id: Date.now().toString(),
                    title: eventTitleInput.trim(),
                    date: dateStr
                };
                newEvents.push(newEvent);
            }

            saveEvents(newEvents);
            closeAddModal();
        }
    };

    const handleDeleteEvent = (e: React.MouseEvent, eventId: string) => {
        e.stopPropagation();
        if (confirm("Delete this event?")) {
            const newEvents = events.filter(ev => ev.id !== eventId);
            saveEvents(newEvents);
            // If we were editing this event, close the modal
            if (editingEventId === eventId) closeAddModal(); 
        }
    };

    return (
        <div className="flex-1 h-screen overflow-y-auto bg-white dark:bg-[#191919] text-gray-900 dark:text-gray-100 transition-colors p-8 relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold">{monthNames[month]} {year}</h1>
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#2C2C2C] rounded-lg p-1">
                        <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-200 dark:hover:bg-[#3C3C3C] rounded transition">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={handleToday} className="px-3 py-1 text-sm font-medium hover:bg-gray-200 dark:hover:bg-[#3C3C3C] rounded transition">
                            Today
                        </button>
                        <button onClick={handleNextMonth} className="p-1 hover:bg-gray-200 dark:hover:bg-[#3C3C3C] rounded transition">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                {/* Day Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-gray-50 dark:bg-[#202020] p-4 text-center font-medium text-gray-500 dark:text-gray-400 text-sm">
                        {day}
                    </div>
                ))}

                {/* Empty Cells */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-white dark:bg-[#191919] min-h-[120px]" />
                ))}

                {/* Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dayEvents = getEventsForDay(day);
                    
                    return (
                        <div key={day} className="bg-white dark:bg-[#191919] min-h-[120px] p-2 hover:bg-gray-50 dark:hover:bg-[#202020] transition group relative border-t border-gray-100 dark:border-gray-800/50 flex flex-col gap-1">
                            <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium ${isToday(day) ? 'bg-red-500 text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                {day}
                            </div>
                            
                            {/* Events */}
                            {dayEvents.map(event => (
                                <div 
                                    key={event.id} 
                                    onClick={(e) => openEditModal(e, event)}
                                    className="group/event flex items-center justify-between text-xs p-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
                                >
                                    <span className="truncate">{event.title}</span>
                                    <button 
                                        onClick={(e) => handleDeleteEvent(e, event.id)} 
                                        className="opacity-0 group-hover/event:opacity-100 hover:text-red-500 transition-opacity p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                                    >
                                        <Trash2 size={10} />
                                    </button>
                                </div>
                            ))}

                            {/* Add Item Button */}
                            <button 
                                onClick={() => openAddModal(day)}
                                className="mt-auto flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pt-2"
                            >
                                <Plus size={12} /> Add item
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Custom Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div 
                        className="bg-white dark:bg-[#252525] w-full max-w-sm rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transform transition-all scale-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                {editingEventId ? "Edit Event" : "Add Event"}
                            </h3>
                            <button onClick={closeAddModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-4">
                            <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Event Title</div>
                            <input
                                ref={inputRef}
                                type="text"
                                value={eventTitleInput}
                                onChange={(e) => setEventTitleInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") confirmEvent();
                                    if (e.key === "Escape") closeAddModal();
                                }}
                                placeholder="Meeting with team..."
                                className="w-full text-lg bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-gray-300 dark:placeholder:text-gray-600 text-gray-900 dark:text-white p-0"
                            />
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-[#1E1E1E] flex justify-end gap-2 border-t border-gray-100 dark:border-gray-700">
                            {editingEventId && (
                                <button 
                                    onClick={(e) => editingEventId && handleDeleteEvent(e, editingEventId)}
                                    className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition mr-auto"
                                >
                                    Delete
                                </button>
                            )}
                            <button 
                                onClick={closeAddModal}
                                className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333] rounded transition"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmEvent}
                                disabled={!eventTitleInput.trim()}
                                className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                            >
                                {editingEventId ? "Save Changes" : "Add Event"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CalendarPage() {
    const params = useParams();
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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

    return (
        <div className="flex-1 h-screen overflow-y-auto bg-white dark:bg-[#191919] text-gray-900 dark:text-gray-100 transition-colors p-8">
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
                    return (
                        <div key={day} className="bg-white dark:bg-[#191919] min-h-[120px] p-2 hover:bg-gray-50 dark:hover:bg-[#202020] transition group relative border-t border-gray-100 dark:border-gray-800/50">
                            <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium ${isToday(day) ? 'bg-red-500 text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                {day}
                            </div>
                            {/* Placeholder for events */}
                            <div className="mt-2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                + Add item
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

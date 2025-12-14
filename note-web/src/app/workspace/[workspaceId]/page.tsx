"use client";

import { useAuth } from "@/context/AuthContext";

export default function WorkspacePage() {
    const { user } = useAuth();
    
    return (
        <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 bg-white dark:bg-[#191919] transition-colors">
            <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
                <div className="text-4xl">👋</div>
                <div className="text-center space-y-2">
                    <h2 className="text-xl font-medium text-black dark:text-white">
                        Welcome back, {user?.displayName || "Guest"}
                    </h2>
                    <p>Select a page from the sidebar to get started.</p>
                </div>
            </div>
        </div>
    );
}

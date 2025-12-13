"use client";

import { useAuth } from "@/context/AuthContext";

export default function WorkspacePage() {
    const { user } = useAuth();
    return (
        <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <div className="text-6xl mb-4">👋</div>
            <h2 className="text-xl font-medium text-gray-600">Welcome back, {user?.displayName}</h2>
            <p>Select a page from the sidebar to get started.</p>
        </div>
    );
}

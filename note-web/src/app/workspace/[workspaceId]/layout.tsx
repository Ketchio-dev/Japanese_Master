"use client";

import Sidebar from "@/components/Sidebar";
import { useParams } from "next/navigation";

export default function WorkspaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    const workspaceId = params.workspaceId as string;

    return (
        <div className="flex h-screen w-full bg-white text-gray-900 font-sans">
            <Sidebar workspaceId={workspaceId} />
            <main className="flex-1 overflow-y-auto h-full relative">
                {children}
            </main>
        </div>
    );
}

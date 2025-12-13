"use client";

import Sidebar from "@/components/Sidebar";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { getWorkspace } from "@/lib/workspace";

export default function WorkspaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    const workspaceId = params.workspaceId as string;
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        if (authLoading) return; // Wait for Auth to init

        if (!user) {
            router.push('/');
            return;
        }

        checkAccess();
    }, [user, authLoading, workspaceId]);

    const checkAccess = async () => {
        if (!user) return;
        setChecking(true);
        try {
            const workspace = await getWorkspace(workspaceId);
            if (!workspace) {
                // Workspace doesn't exist
                router.push('/');
                return;
            }

            if (workspace.members.includes(user.uid)) {
                setIsAuthorized(true);
            } else {
                // Not a member
                alert("You do not have permission to access this workspace.");
                router.push('/');
            }
        } catch (error) {
            console.error(error);
            router.push('/');
        }
        setChecking(false);
    };

    if (authLoading || checking) {
        return (
            <div className="flex h-screen items-center justify-center text-gray-400 text-sm">
                Verifying access...
            </div>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    return (
        <div className="flex h-screen w-full bg-white text-gray-900 font-sans">
            <Sidebar workspaceId={workspaceId} />
            <main className="flex-1 overflow-y-auto h-full relative">
                {children}
            </main>
        </div>
    );
}

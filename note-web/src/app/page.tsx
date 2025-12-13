"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { getUserWorkspaces, createWorkspace } from "@/lib/workspace";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

export default function Home() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();
  const [initLoading, setInitLoading] = useState(false);

  useEffect(() => {
    if (user) {
      handleUserRedirect();
    }
  }, [user]);

  const handleUserRedirect = async () => {
    if (!user) return;
    setInitLoading(true);
    try {
      const workspaces = await getUserWorkspaces(user.uid);
      if (workspaces.length > 0) {
        // Go to first workspace
        router.push(`/workspace/${workspaces[0].id}`);
      } else {
        // Create default workspace
        const newWs = await createWorkspace(user.uid, `${user.displayName}'s Workspace`);
        router.push(`/workspace/${newWs.id}`);
      }
    } catch (e) {
      console.error("Failed to redirect", e);
      setInitLoading(false);
    }
  };

  if (loading || initLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
      <div className="mb-8">
        <span className="text-6xl">📝</span>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">MyArchive Notes</h1>
      <p className="text-xl text-gray-500 max-w-md mb-8">
        Your personal workspace for thoughts, wikis, and projects.
      </p>

      <button
        onClick={() => signInWithGoogle()}
        className="flex items-center gap-2 px-8 py-4 bg-black text-white text-lg rounded-xl font-bold shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
      >
        <LogIn size={20} />
        Continue with Google
      </button>
    </div>
  );
}

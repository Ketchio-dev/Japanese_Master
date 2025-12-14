"use client";

import { useAuth } from "@/context/AuthContext";
import StatsDashboard from "@/components/statistics/StatsDashboard";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function StatsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) return <div className="text-center mt-20 text-white">Loading...</div>;
    if (!user) return null;

    return (
        <div className="min-h-[85vh] flex flex-col items-center px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                Detailed Statistics
            </h1>
            <div className="w-full max-w-6xl">
                <StatsDashboard uid={user.uid} />
            </div>
        </div>
    );
}

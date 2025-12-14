"use client";

import { useEffect, useState } from "react";
import { getGameResults, GameResult } from "@/lib/firestore";
import UserStatsCards from "./UserStatsCards";
import ProgressChart from "./ProgressChart";

interface StatsDashboardProps {
    uid: string;
}

export default function StatsDashboard({ uid }: StatsDashboardProps) {
    const [results, setResults] = useState<GameResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [uid]);

    const loadData = async () => {
        try {
            const data = await getGameResults(uid);
            setResults(data);
        } catch (error) {
            console.error("Failed to load game results", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-gray-400 text-center py-8">Loading stats...</div>;

    if (results.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-800/30 rounded-3xl border border-gray-700 border-dashed">
                <p className="text-gray-400 text-lg mb-2">No game data yet</p>
                <p className="text-gray-500 text-sm">Play some typing games to see your stats!</p>
            </div>
        );
    }

    return (
        <div className="w-full animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-white px-2">Your Statistics</h2>
            <UserStatsCards results={results} totalGames={results.length} />
            <ProgressChart results={results} />
        </div>
    );
}

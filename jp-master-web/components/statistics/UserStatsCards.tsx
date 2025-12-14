import { Trophy, Target, Zap, Clock } from "lucide-react";
import { GameResult } from "@/lib/firestore";

interface UserStatsCardsProps {
    results: GameResult[];
    totalGames: number;
}

export default function UserStatsCards({ results, totalGames }: UserStatsCardsProps) {
    // Calculate Stats
    const bestWpm = results.reduce((max, r) => Math.max(max, r.wpm), 0);
    const avgWpm = results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + r.wpm, 0) / results.length)
        : 0;
    const avgAccuracy = results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + r.accuracy, 0) / results.length)
        : 0;

    // Last 10 games trend (visualized simply by arrow or color? For now just static status)

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
                label="Games Played"
                value={totalGames}
                icon={<Trophy className="w-6 h-6 text-yellow-400" />}
                color="bg-yellow-500/10 border-yellow-500/20"
            />
            <StatCard
                label="Best Speed"
                value={`${bestWpm} CPM`}
                icon={<Zap className="w-6 h-6 text-blue-400" />}
                color="bg-blue-500/10 border-blue-500/20"
            />
            <StatCard
                label="Avg Accuracy"
                value={`${avgAccuracy}%`}
                icon={<Target className="w-6 h-6 text-green-400" />}
                color="bg-green-500/10 border-green-500/20"
            />
            <StatCard
                label="Avg Speed"
                value={`${avgWpm} CPM`}
                icon={<Clock className="w-6 h-6 text-purple-400" />}
                color="bg-purple-500/10 border-purple-500/20"
            />
        </div>
    );
}

function StatCard({ label, value, icon, color }: { label: string, value: string | number, icon: React.ReactNode, color: string }) {
    return (
        <div className={`p-4 rounded-2xl border ${color} backdrop-blur-sm flex flex-col items-center justify-center text-center`}>
            <div className="mb-2 p-2 rounded-full bg-gray-800/50">{icon}</div>
            <p className="text-gray-400 text-xs uppercase tracking-wider font-bold">{label}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
    );
}

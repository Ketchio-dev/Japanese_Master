"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { GameResult } from "@/lib/firestore";

interface ProgressChartProps {
    results: GameResult[];
}

export default function ProgressChart({ results }: ProgressChartProps) {
    // Format data for chart (timestamp to localized date/time)
    const data = results.map(r => ({
        ...r,
        date: r.timestamp?.seconds
            ? new Date(r.timestamp.seconds * 1000).toLocaleDateString([], { month: 'short', day: 'numeric' })
            : 'Recent',
    }));

    // Take last 20 games for cleaner chart
    const chartData = data.slice(-20);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* WPM Trend */}
            <div className="bg-gray-800/50 p-6 rounded-3xl border border-gray-700/50">
                <h3 className="text-xl font-bold mb-6 text-blue-400 flex items-center gap-2">
                    <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                    Speed Trend (CPM)
                </h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="#9ca3af"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#9ca3af"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                domain={['dataMin - 20', 'auto']}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '12px', color: '#fff' }}
                                itemStyle={{ color: '#60a5fa' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="wpm"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorWpm)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Accuracy Trend */}
            <div className="bg-gray-800/50 p-6 rounded-3xl border border-gray-700/50">
                <h3 className="text-xl font-bold mb-6 text-green-400 flex items-center gap-2">
                    <span className="w-2 h-8 bg-green-500 rounded-full"></span>
                    Accuracy Trend (%)
                </h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="#9ca3af"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#9ca3af"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                domain={[80, 100]}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '12px', color: '#fff' }}
                                itemStyle={{ color: '#4ade80' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="accuracy"
                                stroke="#4ade80"
                                strokeWidth={3}
                                dot={{ fill: '#4ade80', r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

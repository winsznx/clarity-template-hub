import { useEffect, useState } from 'react';
import { Trophy, Award } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface LeaderboardEntry {
    rank: number;
    address: string;
    total_mints: number;
    total_deployments: number;
    reputation_points: number;
    badges: string[];
}

export function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'users' | 'templates'>('users');

    useEffect(() => {
        fetchLeaderboard();
    }, [view]);

    const fetchLeaderboard = async () => {
        try {
            const endpoint = view === 'users' ? 'users' : 'templates';
            const response = await fetch(`${API_BASE_URL}/api/leaderboard/${endpoint}?limit=100`);
            const data = await response.json();
            setLeaderboard(data.leaderboard || []);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const shortenAddress = (address: string) => {
        return `${address.slice(0, 8)}...${address.slice(-6)}`;
    };

    const getRankColor = (rank: number) => {
        if (rank === 1) return 'text-yellow-400';
        if (rank === 2) return 'text-gray-300';
        if (rank === 3) return 'text-orange-400';
        return 'text-gray-500';
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return rank;
    };

    if (loading) {
        return (
            <div className="bg-gray-900 rounded-lg p-6">
                <div className="animate-pulse space-y-4">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-800 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Leaderboard
                </h3>

                <div className="flex gap-2">
                    <button
                        onClick={() => setView('users')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'users'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        Users
                    </button>
                    <button
                        onClick={() => setView('templates')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'templates'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        Templates
                    </button>
                </div>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
                {leaderboard.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        No leaderboard data yet
                    </div>
                ) : (
                    leaderboard.map((entry) => (
                        <div
                            key={entry.rank}
                            className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${entry.rank <= 3
                                    ? 'bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700'
                                    : 'bg-gray-800 hover:bg-gray-750'
                                }`}
                        >
                            <div className={`text-2xl font-bold w-12 text-center ${getRankColor(entry.rank)}`}>
                                {getRankIcon(entry.rank)}
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="text-white font-mono text-sm">
                                        {shortenAddress(entry.address)}
                                    </p>
                                    {entry.badges && entry.badges.length > 0 && (
                                        <div className="flex gap-1">
                                            {entry.badges.slice(0, 3).map((badge, i) => (
                                                <span key={i} className="text-xs" title={badge}>
                                                    <Award className="w-4 h-4 text-yellow-400" />
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-4 mt-1 text-xs text-gray-400">
                                    <span>🎨 {entry.total_mints} mints</span>
                                    <span>🚀 {entry.total_deployments} deploys</span>
                                    <span>⭐ {entry.reputation_points} pts</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

import { useAnalytics } from '../hooks/useAnalytics';
import { BarChart3, TrendingUp, Users, Coins } from 'lucide-react';

export function AnalyticsDashboard() {
    const { overview, loading, error } = useAnalytics();

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-900 rounded-lg p-6 animate-pulse">
                        <div className="h-4 bg-gray-800 rounded w-1/2 mb-4"></div>
                        <div className="h-8 bg-gray-800 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-red-400">
                Failed to load analytics: {error}
            </div>
        );
    }

    if (!overview) return null;

    const stats = [
        {
            title: 'Total Mints',
            value: overview.total_mints.toLocaleString(),
            icon: <BarChart3 className="w-6 h-6" />,
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
        },
        {
            title: 'Total Revenue',
            value: `${overview.total_revenue_stx.toFixed(2)} STX`,
            icon: <Coins className="w-6 h-6" />,
            color: 'text-green-400',
            bgColor: 'bg-green-500/10',
        },
        {
            title: 'Deployments',
            value: overview.total_deployments.toLocaleString(),
            icon: <TrendingUp className="w-6 h-6" />,
            color: 'text-orange-400',
            bgColor: 'bg-orange-500/10',
        },
        {
            title: 'Active Users',
            value: overview.active_users.toLocaleString(),
            icon: <Users className="w-6 h-6" />,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                <div className={stat.color}>{stat.icon}</div>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-400">{stat.title}</p>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Trending Templates */}
            {overview.trending_templates.length > 0 && (
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-orange-400" />
                        Trending Templates
                    </h3>
                    <div className="space-y-3">
                        {overview.trending_templates.slice(0, 5).map((template, index) => (
                            <div
                                key={template.template_id}
                                className="flex items-center justify-between p-3 bg-gray-800 rounded hover:bg-gray-750 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl font-bold text-gray-600">#{index + 1}</span>
                                    <div>
                                        <p className="text-white font-medium">Template #{template.template_id}</p>
                                        <p className="text-sm text-gray-400">{template.total_mints} mints</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-orange-400">
                                        🔥 {template.trending_score.toFixed(1)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

import { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface AnalyticsOverview {
    total_mints: number;
    total_deployments: number;
    total_revenue_stx: number;
    active_users: number;
    total_transfers: number;
    trending_templates: Array<{
        template_id: number;
        total_mints: number;
        trending_score: number;
    }>;
    recent_activity_count: number;
}

export function useAnalytics() {
    const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchOverview();

        // Refresh every 30 seconds
        const interval = setInterval(fetchOverview, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchOverview = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/analytics/overview`);
            if (!response.ok) throw new Error('Failed to fetch analytics');

            const data = await response.json();
            setOverview(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const fetchTemplateStats = async (templateId: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/analytics/template/${templateId}`);
            if (!response.ok) throw new Error('Failed to fetch template stats');
            return await response.json();
        } catch (err) {
            console.error('Error fetching template stats:', err);
            return null;
        }
    };

    const fetchUserStats = async (address: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/analytics/user/${address}`);
            if (!response.ok) throw new Error('Failed to fetch user stats');
            return await response.json();
        } catch (err) {
            console.error('Error fetching user stats:', err);
            return null;
        }
    };

    return {
        overview,
        loading,
        error,
        fetchTemplateStats,
        fetchUserStats,
        refresh: fetchOverview,
    };
}

import { db } from '../db/client.js';

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

interface TemplateStats {
    template_id: number;
    total_mints: number;
    total_deployments: number;
    total_revenue_stx: number;
    last_mint_timestamp: number | null;
    trending_score: number;
    rank: number | null;
    mint_velocity: {
        last_hour: number;
        last_day: number;
        last_week: number;
    };
}

class AnalyticsService {
    async getOverview(): Promise<AnalyticsOverview> {
        try {
            const templates = await db.getAllTemplateAnalytics(50);

            const totalMints = templates.reduce((sum, t) => sum + t.total_mints, 0);
            const totalDeployments = templates.reduce((sum, t) => sum + t.total_deployments, 0);
            const totalRevenue = templates.reduce((sum, t) => sum + t.total_revenue_ustx, 0);

            // Get unique users (this would be a database query in production)
            const activeUsers = 0; // TODO: Implement unique user count

            // Get total transfers
            const totalTransfers = 0; // TODO: Implement transfer count

            // Get trending templates
            const trendingTemplates = templates
                .sort((a, b) => b.trending_score - a.trending_score)
                .slice(0, 10)
                .map(t => ({
                    template_id: t.template_id,
                    total_mints: t.total_mints,
                    trending_score: t.trending_score,
                }));

            // Get recent activity count
            const recentActivity = await db.getRecentActivity(100);

            return {
                total_mints: totalMints,
                total_deployments: totalDeployments,
                total_revenue_stx: totalRevenue / 1_000_000, // Convert to STX
                active_users: activeUsers,
                total_transfers: totalTransfers,
                trending_templates: trendingTemplates,
                recent_activity_count: recentActivity.length,
            };
        } catch (error) {
            console.error('Error getting analytics overview:', error);
            throw error;
        }
    }

    async getTemplateStats(templateId: number): Promise<TemplateStats | null> {
        try {
            const analytics = await db.getTemplateAnalytics(templateId);
            if (!analytics) return null;

            // Calculate mint velocity
            const now = Date.now() / 1000;
            const mints = await db.getMintsByTemplate(templateId, 1000);

            const mintVelocity = {
                last_hour: mints.filter(m => now - m.timestamp < 3600).length,
                last_day: mints.filter(m => now - m.timestamp < 86400).length,
                last_week: mints.filter(m => now - m.timestamp < 604800).length,
            };

            return {
                template_id: analytics.template_id,
                total_mints: analytics.total_mints,
                total_deployments: analytics.total_deployments,
                total_revenue_stx: analytics.total_revenue_ustx / 1_000_000,
                last_mint_timestamp: analytics.last_mint_timestamp,
                trending_score: analytics.trending_score,
                rank: analytics.rank,
                mint_velocity: mintVelocity,
            };
        } catch (error) {
            console.error('Error getting template stats:', error);
            return null;
        }
    }

    async getUserStats(userAddress: string) {
        try {
            const analytics = await db.getUserAnalytics(userAddress);
            if (!analytics) {
                return {
                    user_address: userAddress,
                    total_mints: 0,
                    total_deployments: 0,
                    total_spent_stx: 0,
                    reputation_points: 0,
                    badges: [],
                    rank: null,
                };
            }

            return {
                user_address: analytics.user_address,
                total_mints: analytics.total_mints,
                total_deployments: analytics.total_deployments,
                total_spent_stx: analytics.total_spent_ustx / 1_000_000,
                reputation_points: analytics.reputation_points,
                badges: analytics.badges,
                rank: analytics.rank,
            };
        } catch (error) {
            console.error('Error getting user stats:', error);
            throw error;
        }
    }
}

export const analyticsService = new AnalyticsService();

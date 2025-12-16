import { Request, Response } from 'express';
import { db } from '../../db/client.js';

export async function getUserLeaderboard(req: Request, res: Response): Promise<void> {
    try {
        const limit = Math.min(parseInt(req.query.limit as string, 10) || 100, 500);
        const users = await db.getTopUsers(limit);

        const leaderboard = users.map((user, index) => ({
            rank: index + 1,
            address: user.user_address,
            total_mints: user.total_mints,
            total_deployments: user.total_deployments,
            reputation_points: user.reputation_points,
            badges: user.badges,
        }));

        res.json({ leaderboard, total: users.length });
    } catch (error) {
        console.error('Error fetching user leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
}

export async function getTemplateLeaderboard(req: Request, res: Response): Promise<void> {
    try {
        const limit = Math.min(parseInt(req.query.limit as string, 10) || 50, 50);
        const templates = await db.getAllTemplateAnalytics(limit);

        const leaderboard = templates
            .sort((a, b) => b.total_mints - a.total_mints)
            .map((template, index) => ({
                rank: index + 1,
                template_id: template.template_id,
                total_mints: template.total_mints,
                total_deployments: template.total_deployments,
                trending_score: template.trending_score,
            }));

        res.json({ leaderboard, total: templates.length });
    } catch (error) {
        console.error('Error fetching template leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
}

export async function getUserRank(req: Request, res: Response): Promise<void> {
    try {
        const userAddress = req.params.address;

        if (!userAddress || !userAddress.match(/^S[TP][A-Z0-9]+$/)) {
            res.status(400).json({ error: 'Invalid user address' });
            return;
        }

        const analytics = await db.getUserAnalytics(userAddress);

        if (!analytics) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({
            address: analytics.user_address,
            rank: analytics.rank,
            total_mints: analytics.total_mints,
            total_deployments: analytics.total_deployments,
            reputation_points: analytics.reputation_points,
            badges: analytics.badges,
        });
    } catch (error) {
        console.error('Error fetching user rank:', error);
        res.status(500).json({ error: 'Failed to fetch user rank' });
    }
}

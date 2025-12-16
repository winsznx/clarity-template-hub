import { Request, Response } from 'express';
import { db } from '../../db/client.js';

export async function getRecentActivity(req: Request, res: Response): Promise<void> {
    try {
        const limit = Math.min(parseInt(req.query.limit as string, 10) || 50, 100);
        const network = req.query.network as 'mainnet' | 'testnet' | undefined;

        const activity = await db.getRecentActivity(limit, network);

        res.json({ activity, total: activity.length });
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        res.status(500).json({ error: 'Failed to fetch activity' });
    }
}

export async function getUserActivity(req: Request, res: Response): Promise<void> {
    try {
        const userAddress = req.params.address;

        if (!userAddress || !userAddress.match(/^S[TP][A-Z0-9]+$/)) {
            res.status(400).json({ error: 'Invalid user address' });
            return;
        }

        const limit = Math.min(parseInt(req.query.limit as string, 10) || 50, 100);

        // Get user's mints
        const mints = await db.getMintsByUser(userAddress, limit);

        // Get user's deployments
        const deployments = await db.getDeploymentsByUser(userAddress, limit);

        res.json({
            mints,
            deployments,
            total_mints: mints.length,
            total_deployments: deployments.length,
        });
    } catch (error) {
        console.error('Error fetching user activity:', error);
        res.status(500).json({ error: 'Failed to fetch user activity' });
    }
}

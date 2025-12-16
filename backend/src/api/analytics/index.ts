import { Request, Response } from 'express';
import { analyticsService } from '../../services/analytics.js';

export async function getAnalyticsOverview(req: Request, res: Response): Promise<void> {
    try {
        const overview = await analyticsService.getOverview();
        res.json(overview);
    } catch (error) {
        console.error('Error fetching analytics overview:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
}

export async function getTemplateAnalytics(req: Request, res: Response): Promise<void> {
    try {
        const templateId = parseInt(req.params.templateId, 10);

        if (isNaN(templateId) || templateId < 1 || templateId > 50) {
            res.status(400).json({ error: 'Invalid template ID' });
            return;
        }

        const stats = await analyticsService.getTemplateStats(templateId);

        if (!stats) {
            res.status(404).json({ error: 'Template not found' });
            return;
        }

        res.json(stats);
    } catch (error) {
        console.error('Error fetching template analytics:', error);
        res.status(500).json({ error: 'Failed to fetch template analytics' });
    }
}

export async function getUserAnalytics(req: Request, res: Response): Promise<void> {
    try {
        const userAddress = req.params.address;

        if (!userAddress || !userAddress.match(/^S[TP][A-Z0-9]+$/)) {
            res.status(400).json({ error: 'Invalid user address' });
            return;
        }

        const stats = await analyticsService.getUserStats(userAddress);
        res.json(stats);
    } catch (error) {
        console.error('Error fetching user analytics:', error);
        res.status(500).json({ error: 'Failed to fetch user analytics' });
    }
}

import { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { z } from 'zod';

const preferencesSchema = z.object({
    email: z.string().email().optional(),
    watch_templates: z.array(z.number().min(1).max(50)).optional(),
    notify_on_mint: z.boolean().optional(),
    notify_on_transfer: z.boolean().optional(),
    notify_on_deployment: z.boolean().optional(),
});

export async function getNotificationPreferences(req: Request, res: Response): Promise<void> {
    try {
        const userAddress = req.params.address;

        if (!userAddress || !userAddress.match(/^S[TP][A-Z0-9]+$/)) {
            res.status(400).json({ error: 'Invalid user address' });
            return;
        }

        const prefs = await db.getNotificationPreferences(userAddress);

        if (!prefs) {
            res.json({
                user_address: userAddress,
                watch_templates: [],
                notify_on_mint: true,
                notify_on_transfer: true,
                notify_on_deployment: false,
            });
            return;
        }

        res.json(prefs);
    } catch (error) {
        console.error('Error fetching notification preferences:', error);
        res.status(500).json({ error: 'Failed to fetch preferences' });
    }
}

export async function updateNotificationPreferences(req: Request, res: Response): Promise<void> {
    try {
        const userAddress = req.params.address;

        if (!userAddress || !userAddress.match(/^S[TP][A-Z0-9]+$/)) {
            res.status(400).json({ error: 'Invalid user address' });
            return;
        }

        const validated = preferencesSchema.parse(req.body);

        await db.upsertNotificationPreferences({
            user_address: userAddress,
            ...validated,
        });

        res.json({ success: true, message: 'Preferences updated' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: 'Invalid preferences data', details: error.errors });
            return;
        }

        console.error('Error updating notification preferences:', error);
        res.status(500).json({ error: 'Failed to update preferences' });
    }
}

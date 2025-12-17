import { Request, Response } from 'express';
import { db } from '../../db/railway-client.js';
import { broadcastEvent } from '../../services/websocket.js';

export async function handleMintWebhook(req: Request, res: Response): Promise<void> {
    try {
        // Log the raw payload for debugging
        console.log('🔍 ===== MINT WEBHOOK RECEIVED =====');
        console.log('Headers:', JSON.stringify(req.headers, null, 2));
        console.log('Body:', JSON.stringify(req.body, null, 2));
        console.log('🔍 ===== END WEBHOOK =====');

        // For now, just return success to avoid interrupting the chainhook
        res.status(200).json({ success: true, message: 'Webhook received and logged' });
    } catch (error) {
        console.error('Mint webhook error:', error);
        res.status(200).json({ success: true, message: 'Error logged' });
    }
}

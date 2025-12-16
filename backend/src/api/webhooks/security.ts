import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env.js';

// Rate limiting store
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function verifyWebhookSignature(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    const expectedAuth = `Bearer ${config.backend.webhookSecret}`;

    if (authHeader !== expectedAuth) {
        res.status(401).json({ error: 'Unauthorized: Invalid webhook signature' });
        return;
    }

    next();
}

export function rateLimitWebhook(req: Request, res: Response, next: NextFunction): void {
    const ip = req.ip || 'unknown';
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 100;

    const record = requestCounts.get(ip);

    if (!record || now > record.resetTime) {
        requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
        next();
        return;
    }

    if (record.count >= maxRequests) {
        res.status(429).json({ error: 'Too many requests' });
        return;
    }

    record.count++;
    next();
}

// Cleanup old rate limit records periodically
setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of requestCounts.entries()) {
        if (now > record.resetTime) {
            requestCounts.delete(ip);
        }
    }
}, 5 * 60 * 1000); // Every 5 minutes

import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { websocketService } from './services/websocket.js';
import { verifyWebhookSignature, rateLimitWebhook } from './api/webhooks/security.js';
import { handleMintWebhook } from './api/webhooks/mint.js';
import { handleTransferWebhook } from './api/webhooks/transfer.js';
import { handleDeploymentWebhook } from './api/webhooks/deployment.js';
import { getAnalyticsOverview, getTemplateAnalytics, getUserAnalytics } from './api/analytics/index.js';
import { getUserLeaderboard, getTemplateLeaderboard, getUserRank } from './api/leaderboard/index.js';
import { getRecentActivity, getUserActivity } from './api/activity/index.js';
import { getNotificationPreferences, updateNotificationPreferences } from './api/notifications/index.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        websocket_clients: websocketService.getClientCount(),
    });
});

// Webhook endpoints (with security middleware)
app.post('/api/webhooks/mint', verifyWebhookSignature, rateLimitWebhook, handleMintWebhook);
app.post('/api/webhooks/transfer', verifyWebhookSignature, rateLimitWebhook, handleTransferWebhook);
app.post('/api/webhooks/deployment', verifyWebhookSignature, rateLimitWebhook, handleDeploymentWebhook);

// Analytics endpoints
app.get('/api/analytics/overview', getAnalyticsOverview);
app.get('/api/analytics/template/:templateId', getTemplateAnalytics);
app.get('/api/analytics/user/:address', getUserAnalytics);

// Leaderboard endpoints
app.get('/api/leaderboard/users', getUserLeaderboard);
app.get('/api/leaderboard/templates', getTemplateLeaderboard);
app.get('/api/leaderboard/user/:address', getUserRank);

// Activity endpoints
app.get('/api/activity/recent', getRecentActivity);
app.get('/api/activity/user/:address', getUserActivity);

// Notification endpoints
app.get('/api/notifications/preferences/:address', getNotificationPreferences);
app.post('/api/notifications/preferences/:address', updateNotificationPreferences);

// Error handling
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = config.backend.port;

app.listen(PORT, () => {
    console.log(`\n🚀 Backend API running on port ${PORT}`);
    console.log(`📊 Environment: ${config.nodeEnv}`);
    console.log(`🔗 Backend URL: ${config.backend.url}\n`);

    // Initialize WebSocket server
    websocketService.initialize();
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    websocketService.close();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    websocketService.close();
    process.exit(0);
});

export default app;

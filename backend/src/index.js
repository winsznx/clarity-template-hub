"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var env_js_1 = require("./config/env.js");
var websocket_js_1 = require("./services/websocket.js");
var security_js_1 = require("./api/webhooks/security.js");
var mint_js_1 = require("./api/webhooks/mint.js");
var transfer_js_1 = require("./api/webhooks/transfer.js");
var deployment_js_1 = require("./api/webhooks/deployment.js");
var index_js_1 = require("./api/analytics/index.js");
var index_js_2 = require("./api/leaderboard/index.js");
var index_js_3 = require("./api/activity/index.js");
var index_js_4 = require("./api/notifications/index.js");
var app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health check
app.get('/health', function (_req, res) {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        websocket_clients: websocket_js_1.websocketService.getClientCount(),
    });
});
// Webhook endpoints (with security middleware)
app.post('/api/webhooks/mint', security_js_1.verifyWebhookSignature, security_js_1.rateLimitWebhook, mint_js_1.handleMintWebhook);
app.post('/api/webhooks/transfer', security_js_1.verifyWebhookSignature, security_js_1.rateLimitWebhook, transfer_js_1.handleTransferWebhook);
app.post('/api/webhooks/deployment', security_js_1.verifyWebhookSignature, security_js_1.rateLimitWebhook, deployment_js_1.handleDeploymentWebhook);
// Analytics endpoints
app.get('/api/analytics/overview', index_js_1.getAnalyticsOverview);
app.get('/api/analytics/template/:templateId', index_js_1.getTemplateAnalytics);
app.get('/api/analytics/user/:address', index_js_1.getUserAnalytics);
// Leaderboard endpoints
app.get('/api/leaderboard/users', index_js_2.getUserLeaderboard);
app.get('/api/leaderboard/templates', index_js_2.getTemplateLeaderboard);
app.get('/api/leaderboard/user/:address', index_js_2.getUserRank);
// Activity endpoints
app.get('/api/activity/recent', index_js_3.getRecentActivity);
app.get('/api/activity/user/:address', index_js_3.getUserActivity);
// Notification endpoints
app.get('/api/notifications/preferences/:address', index_js_4.getNotificationPreferences);
app.post('/api/notifications/preferences/:address', index_js_4.updateNotificationPreferences);
// Error handling
app.use(function (err, _req, res, _next) {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
// Start server
var PORT = env_js_1.config.backend.port;
app.listen(PORT, function () {
    console.log("\n\uD83D\uDE80 Backend API running on port ".concat(PORT));
    console.log("\uD83D\uDCCA Environment: ".concat(env_js_1.config.nodeEnv));
    console.log("\uD83D\uDD17 Backend URL: ".concat(env_js_1.config.backend.url, "\n"));
    // Initialize WebSocket server
    websocket_js_1.websocketService.initialize();
});
// Graceful shutdown
process.on('SIGTERM', function () {
    console.log('SIGTERM received, shutting down gracefully...');
    websocket_js_1.websocketService.close();
    process.exit(0);
});
process.on('SIGINT', function () {
    console.log('SIGINT received, shutting down gracefully...');
    websocket_js_1.websocketService.close();
    process.exit(0);
});
exports.default = app;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWebhookSignature = verifyWebhookSignature;
exports.rateLimitWebhook = rateLimitWebhook;
var env_js_1 = require("../config/env.js");
// Rate limiting store
var requestCounts = new Map();
function verifyWebhookSignature(req, res, next) {
    var authHeader = req.headers.authorization;
    var expectedAuth = "Bearer ".concat(env_js_1.config.backend.webhookSecret);
    if (authHeader !== expectedAuth) {
        res.status(401).json({ error: 'Unauthorized: Invalid webhook signature' });
        return;
    }
    next();
}
function rateLimitWebhook(req, res, next) {
    var ip = req.ip || 'unknown';
    var now = Date.now();
    var windowMs = 60 * 1000; // 1 minute
    var maxRequests = 100;
    var record = requestCounts.get(ip);
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
setInterval(function () {
    var now = Date.now();
    for (var _i = 0, _a = requestCounts.entries(); _i < _a.length; _i++) {
        var _b = _a[_i], ip = _b[0], record = _b[1];
        if (now > record.resetTime) {
            requestCounts.delete(ip);
        }
    }
}, 5 * 60 * 1000); // Every 5 minutes

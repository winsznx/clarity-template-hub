"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.websocketService = void 0;
exports.broadcastEvent = broadcastEvent;
var ws_1 = require("ws");
var env_js_1 = require("../config/env.js");
var WebSocketService = /** @class */ (function () {
    function WebSocketService() {
        this.wss = null;
        this.clients = new Set();
    }
    WebSocketService.prototype.initialize = function (port) {
        var _this = this;
        if (port === void 0) { port = env_js_1.config.websocket.port; }
        this.wss = new ws_1.WebSocketServer({ port: port });
        this.wss.on('connection', function (ws) {
            console.log('✅ New WebSocket client connected');
            _this.clients.add(ws);
            ws.on('close', function () {
                console.log('👋 WebSocket client disconnected');
                _this.clients.delete(ws);
            });
            ws.on('error', function (error) {
                console.error('WebSocket error:', error);
                _this.clients.delete(ws);
            });
            // Send welcome message
            ws.send(JSON.stringify({
                type: 'connection',
                data: { message: 'Connected to Clarity Template Hub real-time feed' }
            }));
        });
        console.log("\uD83D\uDE80 WebSocket server running on port ".concat(port));
    };
    WebSocketService.prototype.broadcast = function (message) {
        var payload = JSON.stringify(message);
        for (var _i = 0, _a = this.clients; _i < _a.length; _i++) {
            var client = _a[_i];
            if (client.readyState === ws_1.default.OPEN) {
                client.send(payload);
            }
        }
    };
    WebSocketService.prototype.getClientCount = function () {
        return this.clients.size;
    };
    WebSocketService.prototype.close = function () {
        if (this.wss) {
            this.wss.close();
            this.clients.clear();
        }
    };
    return WebSocketService;
}());
exports.websocketService = new WebSocketService();
// Helper function for broadcasting events
function broadcastEvent(message) {
    exports.websocketService.broadcast(message);
}

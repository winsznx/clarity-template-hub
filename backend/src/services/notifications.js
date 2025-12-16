"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
var resend_1 = require("resend");
var client_js_1 = require("../db/client.js");
var env_js_1 = require("../config/env.js");
var websocket_js_1 = require("./websocket.js");
var NotificationService = /** @class */ (function () {
    function NotificationService() {
        this.resend = null;
        if (env_js_1.config.notifications.resendApiKey) {
            this.resend = new resend_1.Resend(env_js_1.config.notifications.resendApiKey);
        }
    }
    NotificationService.prototype.notifyTemplateWatchers = function (templateId, payload) {
        return __awaiter(this, void 0, void 0, function () {
            var watchers, _i, watchers_1, watcher, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, client_js_1.db.getTemplateWatchers(templateId)];
                    case 1:
                        watchers = _a.sent();
                        _i = 0, watchers_1 = watchers;
                        _a.label = 2;
                    case 2:
                        if (!(_i < watchers_1.length)) return [3 /*break*/, 5];
                        watcher = watchers_1[_i];
                        if (!watcher.notify_on_mint && payload.type === 'mint') {
                            return [3 /*break*/, 4];
                        }
                        // Send in-app notification via WebSocket
                        (0, websocket_js_1.broadcastEvent)({
                            type: 'notification',
                            data: {
                                user_address: watcher.user_address,
                                message: this.formatNotificationMessage(payload),
                                template_id: templateId,
                                tx_id: payload.tx_id,
                            },
                        });
                        if (!(watcher.email && this.resend && env_js_1.config.notifications.fromEmail)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.sendEmail(watcher.email, this.formatEmailSubject(payload), this.formatEmailBody(payload, templateId))];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        console.error('Error notifying template watchers:', error_1);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    NotificationService.prototype.formatNotificationMessage = function (payload) {
        var shortAddress = "".concat(payload.user.slice(0, 6), "...").concat(payload.user.slice(-4));
        switch (payload.type) {
            case 'mint':
                return "".concat(shortAddress, " just minted template #").concat(payload.template_id);
            case 'transfer':
                return "NFT #".concat(payload.template_id, " was transferred");
            case 'deployment':
                return "".concat(shortAddress, " deployed a contract");
            default:
                return 'New activity';
        }
    };
    NotificationService.prototype.formatEmailSubject = function (payload) {
        switch (payload.type) {
            case 'mint':
                return "New Mint Alert - Template #".concat(payload.template_id);
            case 'transfer':
                return "NFT Transfer Alert - Token #".concat(payload.template_id);
            case 'deployment':
                return 'New Contract Deployment';
            default:
                return 'Clarity Template Hub Activity';
        }
    };
    NotificationService.prototype.formatEmailBody = function (payload, templateId) {
        var explorerUrl = payload.network === 'mainnet'
            ? "https://explorer.stacks.co/txid/".concat(payload.tx_id, "?chain=mainnet")
            : "https://explorer.stacks.co/txid/".concat(payload.tx_id, "?chain=testnet");
        return "\n      <h2>Activity Alert</h2>\n      <p>".concat(this.formatNotificationMessage(payload), "</p>\n      <p><strong>Transaction:</strong> <a href=\"").concat(explorerUrl, "\">").concat(payload.tx_id, "</a></p>\n      <p><strong>Network:</strong> ").concat(payload.network, "</p>\n      <hr>\n      <p><small>You're receiving this because you're watching template #").concat(templateId, "</small></p>\n    ");
    };
    NotificationService.prototype.sendEmail = function (to, subject, html) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.resend || !env_js_1.config.notifications.fromEmail) {
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.resend.emails.send({
                                from: env_js_1.config.notifications.fromEmail,
                                to: to,
                                subject: subject,
                                html: html,
                            })];
                    case 2:
                        _a.sent();
                        console.log("\uD83D\uDCE7 Email sent to ".concat(to));
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        console.error('Error sending email:', error_2);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    NotificationService.prototype.sendMilestoneNotification = function (userAddress, milestone) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                (0, websocket_js_1.broadcastEvent)({
                    type: 'notification',
                    data: {
                        user_address: userAddress,
                        message: "\uD83C\uDF89 Milestone achieved: ".concat(milestone),
                        type: 'milestone',
                    },
                });
                return [2 /*return*/];
            });
        });
    };
    return NotificationService;
}());
exports.notificationService = new NotificationService();

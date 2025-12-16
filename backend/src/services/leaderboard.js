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
exports.leaderboardService = void 0;
var client_js_1 = require("../db/client.js");
var websocket_js_1 = require("./websocket.js");
var notifications_js_1 = require("./notifications.js");
var LeaderboardService = /** @class */ (function () {
    function LeaderboardService() {
        this.BADGES = {
            early_adopter: {
                name: 'Early Adopter',
                description: 'One of the first 100 users',
                icon: '🌟',
            },
            collector: {
                name: 'Template Collector',
                description: 'Minted 5+ templates',
                icon: '📚',
            },
            power_user: {
                name: 'Power User',
                description: 'Minted 10+ templates',
                icon: '⚡',
            },
            master: {
                name: 'Template Master',
                description: 'Minted 25+ templates',
                icon: '👑',
            },
            complete: {
                name: 'Complete Collection',
                description: 'Minted all 50 templates',
                icon: '💎',
            },
            builder: {
                name: 'Builder',
                description: 'Deployed 1+ contracts',
                icon: '🔨',
            },
            architect: {
                name: 'Architect',
                description: 'Deployed 5+ contracts',
                icon: '🏗️',
            },
            legend: {
                name: 'Legend',
                description: 'Deployed 10+ contracts',
                icon: '🚀',
            },
        };
    }
    LeaderboardService.prototype.updateUserRankings = function () {
        return __awaiter(this, void 0, void 0, function () {
            var users, i, user, newRank, newBadges, _i, newBadges_1, badge, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 9, , 10]);
                        return [4 /*yield*/, client_js_1.db.getTopUsers(1000)];
                    case 1:
                        users = _a.sent();
                        // Sort by reputation points
                        users.sort(function (a, b) { return b.reputation_points - a.reputation_points; });
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < users.length)) return [3 /*break*/, 8];
                        user = users[i];
                        newRank = i + 1;
                        return [4 /*yield*/, this.checkAndAwardBadges(user.user_address, {
                                total_mints: user.total_mints,
                                total_deployments: user.total_deployments,
                                rank: newRank,
                            })];
                    case 3:
                        newBadges = _a.sent();
                        if (!(newBadges.length > 0)) return [3 /*break*/, 7];
                        _i = 0, newBadges_1 = newBadges;
                        _a.label = 4;
                    case 4:
                        if (!(_i < newBadges_1.length)) return [3 /*break*/, 7];
                        badge = newBadges_1[_i];
                        return [4 /*yield*/, notifications_js_1.notificationService.sendMilestoneNotification(user.user_address, "New badge earned: ".concat(badge.name))];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7:
                        i++;
                        return [3 /*break*/, 2];
                    case 8:
                        console.log('✅ User rankings updated');
                        return [3 /*break*/, 10];
                    case 9:
                        error_1 = _a.sent();
                        console.error('Error updating user rankings:', error_1);
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    LeaderboardService.prototype.updateTemplateRankings = function () {
        return __awaiter(this, void 0, void 0, function () {
            var templates, now, _i, templates_1, template, hoursSinceLastMint, recencyBoost, popularityScore, deploymentBonus, _trendingScore, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, client_js_1.db.getAllTemplateAnalytics(50)];
                    case 1:
                        templates = _a.sent();
                        now = Date.now() / 1000;
                        for (_i = 0, templates_1 = templates; _i < templates_1.length; _i++) {
                            template = templates_1[_i];
                            hoursSinceLastMint = template.last_mint_timestamp
                                ? (now - template.last_mint_timestamp) / 3600
                                : 999999;
                            recencyBoost = Math.max(0, 1 - (hoursSinceLastMint / 168));
                            popularityScore = template.total_mints;
                            deploymentBonus = template.total_deployments * 2;
                            _trendingScore = (popularityScore + deploymentBonus) * (1 + recencyBoost);
                            // TODO: Update template analytics with trending score
                            // await db.updateTemplateAnalytics(template.id, { trending_score: trendingScore });
                        }
                        console.log('✅ Template rankings updated');
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Error updating template rankings:', error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    LeaderboardService.prototype.checkAndAwardBadges = function (userAddress, stats) {
        return __awaiter(this, void 0, void 0, function () {
            var user, currentBadges, newBadges, _reputationBonus;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, client_js_1.db.getUserAnalytics(userAddress)];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            return [2 /*return*/, []];
                        currentBadges = new Set(user.badges);
                        newBadges = [];
                        // Check mint-based badges
                        if (stats.total_mints >= 50 && !currentBadges.has('complete')) {
                            newBadges.push(this.BADGES.complete);
                            currentBadges.add('complete');
                        }
                        else if (stats.total_mints >= 25 && !currentBadges.has('master')) {
                            newBadges.push(this.BADGES.master);
                            currentBadges.add('master');
                        }
                        else if (stats.total_mints >= 10 && !currentBadges.has('power_user')) {
                            newBadges.push(this.BADGES.power_user);
                            currentBadges.add('power_user');
                        }
                        else if (stats.total_mints >= 5 && !currentBadges.has('collector')) {
                            newBadges.push(this.BADGES.collector);
                            currentBadges.add('collector');
                        }
                        // Check deployment-based badges
                        if (stats.total_deployments >= 10 && !currentBadges.has('legend')) {
                            newBadges.push(this.BADGES.legend);
                            currentBadges.add('legend');
                        }
                        else if (stats.total_deployments >= 5 && !currentBadges.has('architect')) {
                            newBadges.push(this.BADGES.architect);
                            currentBadges.add('architect');
                        }
                        else if (stats.total_deployments >= 1 && !currentBadges.has('builder')) {
                            newBadges.push(this.BADGES.builder);
                            currentBadges.add('builder');
                        }
                        // Check rank-based badges
                        if (stats.rank <= 100 && !currentBadges.has('early_adopter')) {
                            newBadges.push(this.BADGES.early_adopter);
                            currentBadges.add('early_adopter');
                        }
                        if (!(newBadges.length > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, client_js_1.db.updateUserBadges(userAddress, Array.from(currentBadges))];
                    case 2:
                        _a.sent();
                        _reputationBonus = newBadges.length * 10;
                        _a.label = 3;
                    case 3: return [2 /*return*/, newBadges];
                }
            });
        });
    };
    LeaderboardService.prototype.recalculateAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.updateUserRankings()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.updateTemplateRankings()];
                    case 2:
                        _a.sent();
                        (0, websocket_js_1.broadcastEvent)({
                            type: 'leaderboard_update',
                            data: { timestamp: Date.now() },
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    return LeaderboardService;
}());
exports.leaderboardService = new LeaderboardService();

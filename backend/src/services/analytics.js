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
exports.analyticsService = void 0;
var client_js_1 = require("../db/client.js");
var AnalyticsService = /** @class */ (function () {
    function AnalyticsService() {
    }
    AnalyticsService.prototype.getOverview = function () {
        return __awaiter(this, void 0, void 0, function () {
            var templates, totalMints, totalDeployments, totalRevenue, activeUsers, totalTransfers, trendingTemplates, recentActivity, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, client_js_1.db.getAllTemplateAnalytics(50)];
                    case 1:
                        templates = _a.sent();
                        totalMints = templates.reduce(function (sum, t) { return sum + t.total_mints; }, 0);
                        totalDeployments = templates.reduce(function (sum, t) { return sum + t.total_deployments; }, 0);
                        totalRevenue = templates.reduce(function (sum, t) { return sum + t.total_revenue_ustx; }, 0);
                        activeUsers = 0;
                        totalTransfers = 0;
                        trendingTemplates = templates
                            .sort(function (a, b) { return b.trending_score - a.trending_score; })
                            .slice(0, 10)
                            .map(function (t) { return ({
                            template_id: t.template_id,
                            total_mints: t.total_mints,
                            trending_score: t.trending_score,
                        }); });
                        return [4 /*yield*/, client_js_1.db.getRecentActivity(100)];
                    case 2:
                        recentActivity = _a.sent();
                        return [2 /*return*/, {
                                total_mints: totalMints,
                                total_deployments: totalDeployments,
                                total_revenue_stx: totalRevenue / 1000000, // Convert to STX
                                active_users: activeUsers,
                                total_transfers: totalTransfers,
                                trending_templates: trendingTemplates,
                                recent_activity_count: recentActivity.length,
                            }];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Error getting analytics overview:', error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AnalyticsService.prototype.getTemplateStats = function (templateId) {
        return __awaiter(this, void 0, void 0, function () {
            var analytics, now_1, mints, mintVelocity, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, client_js_1.db.getTemplateAnalytics(templateId)];
                    case 1:
                        analytics = _a.sent();
                        if (!analytics)
                            return [2 /*return*/, null];
                        now_1 = Date.now() / 1000;
                        return [4 /*yield*/, client_js_1.db.getMintsByTemplate(templateId, 1000)];
                    case 2:
                        mints = _a.sent();
                        mintVelocity = {
                            last_hour: mints.filter(function (m) { return now_1 - m.timestamp < 3600; }).length,
                            last_day: mints.filter(function (m) { return now_1 - m.timestamp < 86400; }).length,
                            last_week: mints.filter(function (m) { return now_1 - m.timestamp < 604800; }).length,
                        };
                        return [2 /*return*/, {
                                template_id: analytics.template_id,
                                total_mints: analytics.total_mints,
                                total_deployments: analytics.total_deployments,
                                total_revenue_stx: analytics.total_revenue_ustx / 1000000,
                                last_mint_timestamp: analytics.last_mint_timestamp,
                                trending_score: analytics.trending_score,
                                rank: analytics.rank,
                                mint_velocity: mintVelocity,
                            }];
                    case 3:
                        error_2 = _a.sent();
                        console.error('Error getting template stats:', error_2);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AnalyticsService.prototype.getUserStats = function (userAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var analytics, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, client_js_1.db.getUserAnalytics(userAddress)];
                    case 1:
                        analytics = _a.sent();
                        if (!analytics) {
                            return [2 /*return*/, {
                                    user_address: userAddress,
                                    total_mints: 0,
                                    total_deployments: 0,
                                    total_spent_stx: 0,
                                    reputation_points: 0,
                                    badges: [],
                                    rank: null,
                                }];
                        }
                        return [2 /*return*/, {
                                user_address: analytics.user_address,
                                total_mints: analytics.total_mints,
                                total_deployments: analytics.total_deployments,
                                total_spent_stx: analytics.total_spent_ustx / 1000000,
                                reputation_points: analytics.reputation_points,
                                badges: analytics.badges,
                                rank: analytics.rank,
                            }];
                    case 2:
                        error_3 = _a.sent();
                        console.error('Error getting user stats:', error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return AnalyticsService;
}());
exports.analyticsService = new AnalyticsService();

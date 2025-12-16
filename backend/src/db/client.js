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
exports.db = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var env_js_1 = require("../config/env.js");
// Database client
var DatabaseClient = /** @class */ (function () {
    function DatabaseClient() {
        this.client = (0, supabase_js_1.createClient)(env_js_1.config.supabase.url, env_js_1.config.supabase.serviceKey);
    }
    // Mints
    DatabaseClient.prototype.insertMint = function (mint) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.client
                            .from('mints')
                            .insert(mint)
                            .select()
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    DatabaseClient.prototype.getMintsByUser = function (userAddress_1) {
        return __awaiter(this, arguments, void 0, function (userAddress, limit) {
            var _a, data, error;
            if (limit === void 0) { limit = 50; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.client
                            .from('mints')
                            .select('*')
                            .eq('user_address', userAddress)
                            .order('timestamp', { ascending: false })
                            .limit(limit)];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    DatabaseClient.prototype.getMintsByTemplate = function (templateId_1) {
        return __awaiter(this, arguments, void 0, function (templateId, limit) {
            var _a, data, error;
            if (limit === void 0) { limit = 50; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.client
                            .from('mints')
                            .select('*')
                            .eq('template_id', templateId)
                            .order('timestamp', { ascending: false })
                            .limit(limit)];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    // Transfers
    DatabaseClient.prototype.insertTransfer = function (transfer) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.client
                            .from('transfers')
                            .insert(transfer)
                            .select()
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    // Deployments
    DatabaseClient.prototype.insertDeployment = function (deployment) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.client
                            .from('deployments')
                            .insert(deployment)
                            .select()
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    DatabaseClient.prototype.getDeploymentsByUser = function (userAddress_1) {
        return __awaiter(this, arguments, void 0, function (userAddress, limit) {
            var _a, data, error;
            if (limit === void 0) { limit = 50; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.client
                            .from('deployments')
                            .select('*')
                            .eq('deployer_address', userAddress)
                            .order('timestamp', { ascending: false })
                            .limit(limit)];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    DatabaseClient.prototype.updateDeploymentVerification = function (contractIdentifier, templateId, similarityScore) {
        return __awaiter(this, void 0, void 0, function () {
            var error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client
                            .from('deployments')
                            .update({
                            template_id: templateId,
                            verified: true,
                            similarity_score: similarityScore
                        })
                            .eq('contract_identifier', contractIdentifier)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        return [2 /*return*/];
                }
            });
        });
    };
    // Template Analytics
    DatabaseClient.prototype.getTemplateAnalytics = function (templateId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.client
                            .from('template_analytics')
                            .select('*')
                            .eq('template_id', templateId)
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error && error.code !== 'PGRST116')
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    DatabaseClient.prototype.getAllTemplateAnalytics = function () {
        return __awaiter(this, arguments, void 0, function (limit) {
            var _a, data, error;
            if (limit === void 0) { limit = 50; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.client
                            .from('template_analytics')
                            .select('*')
                            .order('total_mints', { ascending: false })
                            .limit(limit)];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    DatabaseClient.prototype.updateTrendingScores = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.rpc('calculate_trending_scores')];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            console.error('Error updating trending scores:', error);
                        return [2 /*return*/];
                }
            });
        });
    };
    // User Analytics
    DatabaseClient.prototype.getUserAnalytics = function (userAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.client
                            .from('user_analytics')
                            .select('*')
                            .eq('user_address', userAddress)
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error && error.code !== 'PGRST116')
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    DatabaseClient.prototype.getTopUsers = function () {
        return __awaiter(this, arguments, void 0, function (limit) {
            var _a, data, error;
            if (limit === void 0) { limit = 100; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.client
                            .from('user_analytics')
                            .select('*')
                            .order('reputation_points', { ascending: false })
                            .limit(limit)];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    DatabaseClient.prototype.updateUserBadges = function (userAddress, badges) {
        return __awaiter(this, void 0, void 0, function () {
            var error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client
                            .from('user_analytics')
                            .update({ badges: badges })
                            .eq('user_address', userAddress)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        return [2 /*return*/];
                }
            });
        });
    };
    DatabaseClient.prototype.incrementUserDeployments = function (userAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var error, analytics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.rpc('increment_user_deployments', {
                            p_user_address: userAddress
                        })];
                    case 1:
                        error = (_a.sent()).error;
                        if (!error) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.getUserAnalytics(userAddress)];
                    case 2:
                        analytics = _a.sent();
                        if (!analytics) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.client
                                .from('user_analytics')
                                .update({
                                total_deployments: analytics.total_deployments + 1,
                                updated_at: new Date().toISOString()
                            })
                                .eq('user_address', userAddress)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, this.client
                            .from('user_analytics')
                            .insert({
                            user_address: userAddress,
                            total_deployments: 1
                        })];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    // Activity Feed
    DatabaseClient.prototype.insertActivityEvent = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.client
                            .from('activity_feed')
                            .insert(event)
                            .select()
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    DatabaseClient.prototype.getRecentActivity = function () {
        return __awaiter(this, arguments, void 0, function (limit, network) {
            var query, _a, data, error;
            if (limit === void 0) { limit = 50; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        query = this.client
                            .from('activity_feed')
                            .select('*')
                            .order('timestamp', { ascending: false })
                            .limit(limit);
                        if (network) {
                            query = query.eq('network', network);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    // Notification Preferences
    DatabaseClient.prototype.getNotificationPreferences = function (userAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.client
                            .from('notification_preferences')
                            .select('*')
                            .eq('user_address', userAddress)
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error && error.code !== 'PGRST116')
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    DatabaseClient.prototype.upsertNotificationPreferences = function (prefs) {
        return __awaiter(this, void 0, void 0, function () {
            var error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client
                            .from('notification_preferences')
                            .upsert(prefs)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        return [2 /*return*/];
                }
            });
        });
    };
    DatabaseClient.prototype.getTemplateWatchers = function (templateId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.client
                            .from('notification_preferences')
                            .select('*')
                            .contains('watch_templates', [templateId])];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    // Badges
    DatabaseClient.prototype.getAllBadges = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.client
                            .from('badges')
                            .select('*')
                            .order('requirement_value', { ascending: true })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    // Leaderboard Rankings
    DatabaseClient.prototype.recalculateRankings = function () {
        return __awaiter(this, void 0, void 0, function () {
            var userError, templateError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.rpc('update_user_rankings')];
                    case 1:
                        userError = (_a.sent()).error;
                        if (userError)
                            console.error('Error updating user rankings:', userError);
                        return [4 /*yield*/, this.client.rpc('update_template_rankings')];
                    case 2:
                        templateError = (_a.sent()).error;
                        if (templateError)
                            console.error('Error updating template rankings:', templateError);
                        return [2 /*return*/];
                }
            });
        });
    };
    return DatabaseClient;
}());
exports.db = new DatabaseClient();

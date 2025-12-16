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
exports.getUserLeaderboard = getUserLeaderboard;
exports.getTemplateLeaderboard = getTemplateLeaderboard;
exports.getUserRank = getUserRank;
var client_js_1 = require("../../db/client.js");
function getUserLeaderboard(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var limit, users, leaderboard, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
                    return [4 /*yield*/, client_js_1.db.getTopUsers(limit)];
                case 1:
                    users = _a.sent();
                    leaderboard = users.map(function (user, index) { return ({
                        rank: index + 1,
                        address: user.user_address,
                        total_mints: user.total_mints,
                        total_deployments: user.total_deployments,
                        reputation_points: user.reputation_points,
                        badges: user.badges,
                    }); });
                    res.json({ leaderboard: leaderboard, total: users.length });
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error fetching user leaderboard:', error_1);
                    res.status(500).json({ error: 'Failed to fetch leaderboard' });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getTemplateLeaderboard(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var limit, templates, leaderboard, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    limit = Math.min(parseInt(req.query.limit, 10) || 50, 50);
                    return [4 /*yield*/, client_js_1.db.getAllTemplateAnalytics(limit)];
                case 1:
                    templates = _a.sent();
                    leaderboard = templates
                        .sort(function (a, b) { return b.total_mints - a.total_mints; })
                        .map(function (template, index) { return ({
                        rank: index + 1,
                        template_id: template.template_id,
                        total_mints: template.total_mints,
                        total_deployments: template.total_deployments,
                        trending_score: template.trending_score,
                    }); });
                    res.json({ leaderboard: leaderboard, total: templates.length });
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error fetching template leaderboard:', error_2);
                    res.status(500).json({ error: 'Failed to fetch leaderboard' });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getUserRank(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var userAddress, analytics, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    userAddress = req.params.address;
                    if (!userAddress || !userAddress.match(/^S[TP][A-Z0-9]+$/)) {
                        res.status(400).json({ error: 'Invalid user address' });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, client_js_1.db.getUserAnalytics(userAddress)];
                case 1:
                    analytics = _a.sent();
                    if (!analytics) {
                        res.status(404).json({ error: 'User not found' });
                        return [2 /*return*/];
                    }
                    res.json({
                        address: analytics.user_address,
                        rank: analytics.rank,
                        total_mints: analytics.total_mints,
                        total_deployments: analytics.total_deployments,
                        reputation_points: analytics.reputation_points,
                        badges: analytics.badges,
                    });
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error fetching user rank:', error_3);
                    res.status(500).json({ error: 'Failed to fetch user rank' });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}

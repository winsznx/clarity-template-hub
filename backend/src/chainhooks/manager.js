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
exports.chainhookManager = exports.ChainhookManager = void 0;
var chainhooks_client_1 = require("@hirosystems/chainhooks-client");
var env_js_1 = require("../config/env.js");
var ChainhookManager = /** @class */ (function () {
    function ChainhookManager() {
        this.registeredHooks = new Map();
        this.mainnetClient = new chainhooks_client_1.ChainhooksClient({
            baseUrl: env_js_1.config.chainhooks.mainnetUrl,
            apiKey: env_js_1.config.chainhooks.apiKey,
        });
        this.testnetClient = new chainhooks_client_1.ChainhooksClient({
            baseUrl: env_js_1.config.chainhooks.testnetUrl,
            apiKey: env_js_1.config.chainhooks.apiKey,
        });
    }
    ChainhookManager.prototype.getClient = function (network) {
        return network === 'mainnet' ? this.mainnetClient : this.testnetClient;
    };
    ChainhookManager.prototype.getContractAddress = function (network) {
        return network === 'mainnet' ? env_js_1.config.contracts.mainnet : env_js_1.config.contracts.testnet;
    };
    ChainhookManager.prototype.registerMintMonitoring = function () {
        return __awaiter(this, arguments, void 0, function (network) {
            var client, contractAddress, chainhook, result, error_1;
            if (network === void 0) { network = 'mainnet'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        client = this.getClient(network);
                        contractAddress = this.getContractAddress(network);
                        chainhook = {
                            version: '1',
                            name: "template-nft-mints-".concat(network),
                            chain: 'stacks',
                            network: network,
                            filters: {
                                events: [
                                    {
                                        type: 'nft_mint',
                                        asset_identifier: "".concat(contractAddress, "::access-template"),
                                    },
                                ],
                            },
                            action: {
                                type: 'http_post',
                                url: "".concat(env_js_1.config.backend.url, "/api/webhooks/mint"),
                                authorization_header: "Bearer ".concat(env_js_1.config.backend.webhookSecret),
                            },
                            options: {
                                decode_clarity_values: true,
                                enable_on_registration: true,
                            },
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, client.registerChainhook(chainhook)];
                    case 2:
                        result = _a.sent();
                        this.registeredHooks.set("mint-".concat(network), { uuid: result.uuid, network: network });
                        console.log("\u2705 Registered mint monitoring for ".concat(network, ": ").concat(result.uuid));
                        return [2 /*return*/, result.uuid];
                    case 3:
                        error_1 = _a.sent();
                        console.error("\u274C Failed to register mint monitoring for ".concat(network, ":"), error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ChainhookManager.prototype.registerTransferMonitoring = function () {
        return __awaiter(this, arguments, void 0, function (network) {
            var client, contractAddress, chainhook, result, error_2;
            if (network === void 0) { network = 'mainnet'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        client = this.getClient(network);
                        contractAddress = this.getContractAddress(network);
                        chainhook = {
                            version: '1',
                            name: "template-nft-transfers-".concat(network),
                            chain: 'stacks',
                            network: network,
                            filters: {
                                events: [
                                    {
                                        type: 'nft_transfer',
                                        asset_identifier: "".concat(contractAddress, "::access-template"),
                                    },
                                ],
                            },
                            action: {
                                type: 'http_post',
                                url: "".concat(env_js_1.config.backend.url, "/api/webhooks/transfer"),
                                authorization_header: "Bearer ".concat(env_js_1.config.backend.webhookSecret),
                            },
                            options: {
                                decode_clarity_values: true,
                                enable_on_registration: true,
                            },
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, client.registerChainhook(chainhook)];
                    case 2:
                        result = _a.sent();
                        this.registeredHooks.set("transfer-".concat(network), { uuid: result.uuid, network: network });
                        console.log("\u2705 Registered transfer monitoring for ".concat(network, ": ").concat(result.uuid));
                        return [2 /*return*/, result.uuid];
                    case 3:
                        error_2 = _a.sent();
                        console.error("\u274C Failed to register transfer monitoring for ".concat(network, ":"), error_2);
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ChainhookManager.prototype.registerDeploymentMonitoring = function () {
        return __awaiter(this, arguments, void 0, function (network) {
            var client, chainhook, result, error_3;
            if (network === void 0) { network = 'mainnet'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        client = this.getClient(network);
                        chainhook = {
                            version: '1',
                            name: "contract-deployments-".concat(network),
                            chain: 'stacks',
                            network: network,
                            filters: {
                                events: [
                                    {
                                        type: 'contract_deploy',
                                    },
                                ],
                            },
                            action: {
                                type: 'http_post',
                                url: "".concat(env_js_1.config.backend.url, "/api/webhooks/deployment"),
                                authorization_header: "Bearer ".concat(env_js_1.config.backend.webhookSecret),
                            },
                            options: {
                                decode_clarity_values: true,
                                enable_on_registration: true,
                            },
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, client.registerChainhook(chainhook)];
                    case 2:
                        result = _a.sent();
                        this.registeredHooks.set("deployment-".concat(network), { uuid: result.uuid, network: network });
                        console.log("\u2705 Registered deployment monitoring for ".concat(network, ": ").concat(result.uuid));
                        return [2 /*return*/, result.uuid];
                    case 3:
                        error_3 = _a.sent();
                        console.error("\u274C Failed to register deployment monitoring for ".concat(network, ":"), error_3);
                        throw error_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ChainhookManager.prototype.registerAllHooks = function () {
        return __awaiter(this, arguments, void 0, function (network) {
            var error_4;
            if (network === void 0) { network = 'mainnet'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("\n\uD83D\uDE80 Registering all chainhooks for ".concat(network, "...\n"));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, this.registerMintMonitoring(network)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.registerTransferMonitoring(network)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.registerDeploymentMonitoring(network)];
                    case 4:
                        _a.sent();
                        console.log("\n\u2705 All chainhooks registered successfully for ".concat(network, "\n"));
                        return [3 /*break*/, 6];
                    case 5:
                        error_4 = _a.sent();
                        console.error("\n\u274C Failed to register all chainhooks for ".concat(network, "\n"));
                        throw error_4;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ChainhookManager.prototype.getStatus = function () {
        return __awaiter(this, arguments, void 0, function (network) {
            var client;
            if (network === void 0) { network = 'mainnet'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        client = this.getClient(network);
                        return [4 /*yield*/, client.getStatus()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ChainhookManager.prototype.listAllHooks = function () {
        return __awaiter(this, arguments, void 0, function (network) {
            var client;
            if (network === void 0) { network = 'mainnet'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        client = this.getClient(network);
                        return [4 /*yield*/, client.getChainhooks({ limit: 50 })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ChainhookManager.prototype.enableHook = function (name, enabled) {
        return __awaiter(this, void 0, void 0, function () {
            var hook, client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        hook = this.registeredHooks.get(name);
                        if (!hook) {
                            throw new Error("Hook ".concat(name, " not found in registered hooks"));
                        }
                        client = this.getClient(hook.network);
                        return [4 /*yield*/, client.enableChainhook(hook.uuid, enabled)];
                    case 1:
                        _a.sent();
                        console.log("".concat(enabled ? '✅ Enabled' : '⏸️  Disabled', " hook: ").concat(name));
                        return [2 /*return*/];
                }
            });
        });
    };
    ChainhookManager.prototype.deleteHook = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var hook, client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        hook = this.registeredHooks.get(name);
                        if (!hook) {
                            throw new Error("Hook ".concat(name, " not found in registered hooks"));
                        }
                        client = this.getClient(hook.network);
                        return [4 /*yield*/, client.deleteChainhook(hook.uuid)];
                    case 1:
                        _a.sent();
                        this.registeredHooks.delete(name);
                        console.log("\uD83D\uDDD1\uFE0F  Deleted hook: ".concat(name));
                        return [2 /*return*/];
                }
            });
        });
    };
    ChainhookManager.prototype.getRegisteredHooks = function () {
        return this.registeredHooks;
    };
    return ChainhookManager;
}());
exports.ChainhookManager = ChainhookManager;
exports.chainhookManager = new ChainhookManager();

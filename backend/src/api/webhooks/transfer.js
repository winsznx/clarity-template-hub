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
exports.handleTransferWebhook = handleTransferWebhook;
var client_js_1 = require("../../db/client.js");
var websocket_js_1 = require("../../services/websocket.js");
var zod_1 = require("zod");
var transferEventSchema = zod_1.z.object({
    apply: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.literal('ContractCall'),
        contract_call: zod_1.z.object({
            contract_id: zod_1.z.string(),
            function_name: zod_1.z.string(),
            function_args: zod_1.z.array(zod_1.z.any()),
        }),
        transaction: zod_1.z.object({
            transaction_identifier: zod_1.z.object({
                hash: zod_1.z.string(),
            }),
            metadata: zod_1.z.object({
                sender: zod_1.z.string(),
                success: zod_1.z.boolean(),
            }),
        }),
        block_identifier: zod_1.z.object({
            index: zod_1.z.number(),
        }),
        timestamp: zod_1.z.number(),
    })),
});
function handleTransferWebhook(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var event_1, _i, _a, apply, txId, blockHeight, timestamp, args, tokenId, fromAddress, toAddress, contractId, network, error_1, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 8, , 9]);
                    event_1 = transferEventSchema.parse(req.body);
                    _i = 0, _a = event_1.apply;
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 7];
                    apply = _a[_i];
                    if (!apply.transaction.metadata.success) {
                        return [3 /*break*/, 6];
                    }
                    txId = apply.transaction.transaction_identifier.hash;
                    blockHeight = apply.block_identifier.index;
                    timestamp = apply.timestamp;
                    args = apply.contract_call.function_args;
                    tokenId = void 0;
                    fromAddress = void 0;
                    toAddress = void 0;
                    try {
                        tokenId = typeof args[0] === 'object' && 'uint' in args[0]
                            ? parseInt(args[0].uint, 10)
                            : parseInt(args[0], 10);
                        fromAddress = typeof args[1] === 'object' && 'principal' in args[1]
                            ? args[1].principal
                            : args[1];
                        toAddress = typeof args[2] === 'object' && 'principal' in args[2]
                            ? args[2].principal
                            : args[2];
                    }
                    catch (error) {
                        console.error('Error parsing transfer args:', error);
                        return [3 /*break*/, 6];
                    }
                    contractId = apply.contract_call.contract_id;
                    network = contractId.startsWith('SP') ? 'mainnet' : 'testnet';
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, client_js_1.db.insertTransfer({
                            tx_id: txId,
                            token_id: tokenId,
                            from_address: fromAddress,
                            to_address: toAddress,
                            block_height: blockHeight,
                            timestamp: timestamp,
                            network: network,
                        })];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, client_js_1.db.insertActivityEvent({
                            event_type: 'transfer',
                            user_address: fromAddress,
                            template_id: tokenId,
                            contract_identifier: null,
                            tx_id: txId,
                            timestamp: timestamp,
                            network: network,
                            metadata: {
                                from: fromAddress,
                                to: toAddress,
                                token_id: tokenId,
                            },
                        })];
                case 4:
                    _b.sent();
                    console.log("\u2705 Stored transfer event: token #".concat(tokenId, " from ").concat(fromAddress, " to ").concat(toAddress));
                    (0, websocket_js_1.broadcastEvent)({
                        type: 'transfer',
                        data: {
                            token_id: tokenId,
                            from_address: fromAddress,
                            to_address: toAddress,
                            tx_id: txId,
                            timestamp: timestamp,
                            network: network,
                        },
                    });
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _b.sent();
                    console.error('Error storing transfer event:', error_1);
                    return [3 /*break*/, 6];
                case 6:
                    _i++;
                    return [3 /*break*/, 1];
                case 7:
                    res.status(200).json({ success: true, processed: event_1.apply.length });
                    return [3 /*break*/, 9];
                case 8:
                    error_2 = _b.sent();
                    console.error('Transfer webhook error:', error_2);
                    res.status(500).json({ error: 'Internal server error' });
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}

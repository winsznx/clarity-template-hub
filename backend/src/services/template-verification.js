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
exports.templateVerificationService = void 0;
var crypto_1 = require("crypto");
var diff = require("diff");
var TemplateVerificationService = /** @class */ (function () {
    function TemplateVerificationService() {
        this._templates = new Map();
        // Load templates from templates.json
        // TODO: Implement template loading from file system
        // For now, templates will be loaded on-demand
    }
    TemplateVerificationService.prototype.loadTemplates = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // In production, load from templates.json or database
                // For now, we'll load dynamically when needed
                console.log('Template verification service initialized');
                return [2 /*return*/];
            });
        });
    };
    TemplateVerificationService.prototype.calculateCodeHash = function (code) {
        return crypto_1.default.createHash('sha256').update(code.trim()).digest('hex');
    };
    TemplateVerificationService.prototype.calculateSimilarity = function (code1, code2) {
        // Normalize code for comparison
        var normalize = function (code) {
            return code
                .replace(/\s+/g, ' ') // Normalize whitespace
                .replace(/;;.*$/gm, '') // Remove comments
                .trim();
        };
        var normalized1 = normalize(code1);
        var normalized2 = normalize(code2);
        // Calculate diff-based similarity
        var differences = diff.diffChars(normalized1, normalized2);
        var matchingChars = 0;
        var totalChars = 0;
        for (var _i = 0, differences_1 = differences; _i < differences_1.length; _i++) {
            var part = differences_1[_i];
            totalChars += part.value.length;
            if (!part.added && !part.removed) {
                matchingChars += part.value.length;
            }
        }
        return totalChars > 0 ? matchingChars / totalChars : 0;
    };
    TemplateVerificationService.prototype.verifyDeployment = function (deployedCode) {
        return __awaiter(this, void 0, void 0, function () {
            var codeHash;
            return __generator(this, function (_a) {
                codeHash = this.calculateCodeHash(deployedCode);
                // Try to load templates from public directory
                try {
                    // In a real implementation, fetch from your templates.json
                    // For now, we'll return unverified but with hash
                    // TODO: Load actual templates and compare
                    // const templates = await fetch('/templates.json').then(r => r.json());
                    // for (const template of templates) {
                    //   const similarity = this.calculateSimilarity(deployedCode, template.code);
                    //   if (similarity > 0.95) {
                    //     return {
                    //       verified: true,
                    //       templateId: template.id,
                    //       similarityScore: similarity,
                    //       codeHash,
                    //     };
                    //   }
                    // }
                    return [2 /*return*/, {
                            verified: false,
                            templateId: null,
                            similarityScore: null,
                            codeHash: codeHash,
                        }];
                }
                catch (error) {
                    console.error('Error verifying deployment:', error);
                    return [2 /*return*/, {
                            verified: false,
                            templateId: null,
                            similarityScore: null,
                            codeHash: codeHash,
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    return TemplateVerificationService;
}());
exports.templateVerificationService = new TemplateVerificationService();

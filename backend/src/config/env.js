"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
var dotenv_1 = require("dotenv");
var zod_1 = require("zod");
dotenv_1.default.config();
var envSchema = zod_1.z.object({
    // Chainhooks
    CHAINHOOKS_API_KEY: zod_1.z.string().min(1),
    CHAINHOOKS_BASE_URL: zod_1.z.string().url().default('https://api.mainnet.hiro.so'),
    CHAINHOOKS_TESTNET_URL: zod_1.z.string().url().default('https://api.testnet.hiro.so'),
    // Contracts
    NFT_CONTRACT_MAINNET: zod_1.z.string().min(1),
    NFT_CONTRACT_TESTNET: zod_1.z.string().min(1),
    // Backend
    BACKEND_URL: zod_1.z.string().url(),
    WEBHOOK_SECRET: zod_1.z.string().min(1),
    PORT: zod_1.z.string().default('3001'),
    // Supabase
    SUPABASE_URL: zod_1.z.string().url().optional(),
    SUPABASE_ANON_KEY: zod_1.z.string().optional(),
    SUPABASE_SERVICE_KEY: zod_1.z.string().optional(),
    // Railway PostgreSQL (auto-injected)
    DATABASE_URL: zod_1.z.string().url().optional(),
    // Optional services
    RESEND_API_KEY: zod_1.z.string().optional(),
    FROM_EMAIL: zod_1.z.string().email().optional(),
    // WebSocket
    WS_PORT: zod_1.z.string().default('3002'),
    // Environment
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
});
var parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.format());
    process.exit(1);
}
exports.config = {
    chainhooks: {
        apiKey: parsed.data.CHAINHOOKS_API_KEY,
        mainnetUrl: parsed.data.CHAINHOOKS_BASE_URL,
        testnetUrl: parsed.data.CHAINHOOKS_TESTNET_URL,
    },
    contracts: {
        mainnet: parsed.data.NFT_CONTRACT_MAINNET,
        testnet: parsed.data.NFT_CONTRACT_TESTNET,
    },
    backend: {
        url: parsed.data.BACKEND_URL,
        webhookSecret: parsed.data.WEBHOOK_SECRET,
        port: parseInt(parsed.data.PORT, 10),
    },
    supabase: {
        url: parsed.data.DATABASE_URL || parsed.data.SUPABASE_URL || '',
        anonKey: parsed.data.SUPABASE_ANON_KEY || '',
        serviceKey: parsed.data.SUPABASE_SERVICE_KEY || parsed.data.DATABASE_URL || '',
    },
    database: {
        provider: parsed.data.DATABASE_URL ? 'railway' : 'supabase',
        url: parsed.data.DATABASE_URL || parsed.data.SUPABASE_URL || '',
    },
    notifications: {
        resendApiKey: parsed.data.RESEND_API_KEY,
        fromEmail: parsed.data.FROM_EMAIL,
    },
    websocket: {
        port: parseInt(parsed.data.WS_PORT, 10),
    },
    nodeEnv: parsed.data.NODE_ENV,
    isDevelopment: parsed.data.NODE_ENV === 'development',
    isProduction: parsed.data.NODE_ENV === 'production',
};

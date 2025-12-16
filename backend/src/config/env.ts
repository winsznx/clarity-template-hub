import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    // Chainhooks
    CHAINHOOKS_API_KEY: z.string().min(1),
    CHAINHOOKS_BASE_URL: z.string().url().default('https://api.mainnet.hiro.so'),
    CHAINHOOKS_TESTNET_URL: z.string().url().default('https://api.testnet.hiro.so'),

    // Contracts
    NFT_CONTRACT_MAINNET: z.string().min(1),
    NFT_CONTRACT_TESTNET: z.string().min(1),

    // Backend
    BACKEND_URL: z.string().url(),
    WEBHOOK_SECRET: z.string().min(1),
    PORT: z.string().default('3001'),

    // Supabase
    SUPABASE_URL: z.string().url().optional(),
    SUPABASE_ANON_KEY: z.string().optional(),
    SUPABASE_SERVICE_KEY: z.string().optional(),

    // Railway PostgreSQL (auto-injected)
    DATABASE_URL: z.string().url().optional(),

    // Optional services
    RESEND_API_KEY: z.string().optional(),
    FROM_EMAIL: z.string().email().optional(),

    // WebSocket
    WS_PORT: z.string().default('3002'),

    // Environment
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.format());
    process.exit(1);
}

export const config = {
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
} as const;

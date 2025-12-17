import { Pool, QueryResult } from 'pg';
import { config } from '../config/env.js';

// Database types
export interface Mint {
    id: number;
    tx_id: string;
    user_address: string;
    template_id: number;
    block_height: number;
    timestamp: number;
    network: 'mainnet' | 'testnet';
    created_at: string;
}

export interface ActivityFeedEvent {
    id: number;
    event_type: 'mint' | 'transfer' | 'deployment';
    user_address: string;
    template_id: number | null;
    contract_identifier: string | null;
    tx_id: string;
    timestamp: number;
    network: 'mainnet' | 'testnet';
    metadata: Record<string, unknown>;
    created_at: string;
}

// PostgreSQL Database client for Railway
class RailwayDatabaseClient {
    private pool: Pool;

    constructor() {
        this.pool = new Pool({
            connectionString: config.database.url,
            ssl: config.isProduction ? { rejectUnauthorized: false } : undefined,
        });

        this.pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
        });
    }

    // Mints
    async insertMint(mint: Omit<Mint, 'id' | 'created_at'>): Promise<Mint> {
        const query = `
            INSERT INTO mints (tx_id, user_address, template_id, block_height, timestamp, network)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const values = [
            mint.tx_id,
            mint.user_address,
            mint.template_id,
            mint.block_height,
            mint.timestamp,
            mint.network,
        ];

        const result = await this.pool.query(query, values);
        return result.rows[0];
    }

    // Activity Feed
    async insertActivityEvent(event: Omit<ActivityFeedEvent, 'id' | 'created_at'>): Promise<ActivityFeedEvent> {
        const query = `
            INSERT INTO activity_feed (event_type, user_address, template_id, contract_identifier, tx_id, timestamp, network, metadata)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;

        const values = [
            event.event_type,
            event.user_address,
            event.template_id,
            event.contract_identifier,
            event.tx_id,
            event.timestamp,
            event.network,
            JSON.stringify(event.metadata),
        ];

        const result = await this.pool.query(query, values);
        return result.rows[0];
    }

    async getRecentActivity(limit = 50, network?: 'mainnet' | 'testnet'): Promise<ActivityFeedEvent[]> {
        let query = `
            SELECT * FROM activity_feed
            ${network ? 'WHERE network = $2' : ''}
            ORDER BY timestamp DESC
            LIMIT $1
        `;

        const values = network ? [limit, network] : [limit];
        const result = await this.pool.query(query, values);
        return result.rows;
    }

    // Analytics
    async getAnalyticsOverview(): Promise<any> {
        const query = `
            SELECT 
                COUNT(DISTINCT user_address) as total_users,
                COUNT(*) as total_mints,
                COUNT(DISTINCT template_id) as unique_templates
            FROM mints
        `;

        const result = await this.pool.query(query);
        return result.rows[0];
    }

    async close(): Promise<void> {
        await this.pool.end();
    }
}

export const db = new RailwayDatabaseClient();

import { createClient, SupabaseClient } from '@supabase/supabase-js';
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

export interface Transfer {
    id: number;
    tx_id: string;
    token_id: number;
    from_address: string;
    to_address: string;
    block_height: number;
    timestamp: number;
    network: 'mainnet' | 'testnet';
    created_at: string;
}

export interface Deployment {
    id: number;
    contract_identifier: string;
    deployer_address: string;
    template_id: number | null;
    verified: boolean;
    similarity_score: number | null;
    code_hash: string | null;
    block_height: number;
    timestamp: number;
    network: 'mainnet' | 'testnet';
    created_at: string;
}

export interface TemplateAnalytics {
    template_id: number;
    total_mints: number;
    total_deployments: number;
    total_revenue_ustx: number;
    last_mint_timestamp: number | null;
    last_deployment_timestamp: number | null;
    trending_score: number;
    rank: number | null;
    updated_at: string;
}

export interface UserAnalytics {
    user_address: string;
    total_mints: number;
    total_deployments: number;
    total_spent_ustx: number;
    reputation_points: number;
    badges: string[];
    rank: number | null;
    updated_at: string;
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

export interface NotificationPreferences {
    user_address: string;
    email: string | null;
    discord_webhook: string | null;
    telegram_chat_id: string | null;
    watch_templates: number[];
    notify_on_mint: boolean;
    notify_on_transfer: boolean;
    notify_on_deployment: boolean;
    created_at: string;
    updated_at: string;
}

export interface Badge {
    id: number;
    name: string;
    description: string;
    icon: string | null;
    requirement_type: string;
    requirement_value: number;
    created_at: string;
}

// Database client
class DatabaseClient {
    private client: SupabaseClient;

    constructor() {
        this.client = createClient(
            config.supabase.url,
            config.supabase.serviceKey
        );
    }

    // Mints
    async insertMint(mint: Omit<Mint, 'id' | 'created_at'>): Promise<Mint> {
        const { data, error } = await this.client
            .from('mints')
            .insert(mint)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getMintsByUser(userAddress: string, limit = 50): Promise<Mint[]> {
        const { data, error } = await this.client
            .from('mints')
            .select('*')
            .eq('user_address', userAddress)
            .order('timestamp', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    }

    async getMintsByTemplate(templateId: number, limit = 50): Promise<Mint[]> {
        const { data, error } = await this.client
            .from('mints')
            .select('*')
            .eq('template_id', templateId)
            .order('timestamp', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    }

    // Transfers
    async insertTransfer(transfer: Omit<Transfer, 'id' | 'created_at'>): Promise<Transfer> {
        const { data, error } = await this.client
            .from('transfers')
            .insert(transfer)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Deployments
    async insertDeployment(deployment: Omit<Deployment, 'id' | 'created_at'>): Promise<Deployment> {
        const { data, error } = await this.client
            .from('deployments')
            .insert(deployment)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getDeploymentsByUser(userAddress: string, limit = 50): Promise<Deployment[]> {
        const { data, error } = await this.client
            .from('deployments')
            .select('*')
            .eq('deployer_address', userAddress)
            .order('timestamp', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    }

    async updateDeploymentVerification(
        contractIdentifier: string,
        templateId: number,
        similarityScore: number
    ): Promise<void> {
        const { error } = await this.client
            .from('deployments')
            .update({
                template_id: templateId,
                verified: true,
                similarity_score: similarityScore
            })
            .eq('contract_identifier', contractIdentifier);

        if (error) throw error;
    }

    // Template Analytics
    async getTemplateAnalytics(templateId: number): Promise<TemplateAnalytics | null> {
        const { data, error } = await this.client
            .from('template_analytics')
            .select('*')
            .eq('template_id', templateId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async getAllTemplateAnalytics(limit = 50): Promise<TemplateAnalytics[]> {
        const { data, error } = await this.client
            .from('template_analytics')
            .select('*')
            .order('total_mints', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    }

    async updateTrendingScores(): Promise<void> {
        // Calculate trending score based on recent activity
        const { error } = await this.client.rpc('calculate_trending_scores');
        if (error) console.error('Error updating trending scores:', error);
    }

    // User Analytics
    async getUserAnalytics(userAddress: string): Promise<UserAnalytics | null> {
        const { data, error } = await this.client
            .from('user_analytics')
            .select('*')
            .eq('user_address', userAddress)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async getTopUsers(limit = 100): Promise<UserAnalytics[]> {
        const { data, error } = await this.client
            .from('user_analytics')
            .select('*')
            .order('reputation_points', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    }

    async updateUserBadges(userAddress: string, badges: string[]): Promise<void> {
        const { error } = await this.client
            .from('user_analytics')
            .update({ badges })
            .eq('user_address', userAddress);

        if (error) throw error;
    }

    async incrementUserDeployments(userAddress: string): Promise<void> {
        const { error } = await this.client.rpc('increment_user_deployments', {
            p_user_address: userAddress
        });

        if (error) {
            // Fallback if RPC doesn't exist
            const analytics = await this.getUserAnalytics(userAddress);
            if (analytics) {
                await this.client
                    .from('user_analytics')
                    .update({
                        total_deployments: analytics.total_deployments + 1,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_address', userAddress);
            } else {
                await this.client
                    .from('user_analytics')
                    .insert({
                        user_address: userAddress,
                        total_deployments: 1
                    });
            }
        }
    }

    // Activity Feed
    async insertActivityEvent(event: Omit<ActivityFeedEvent, 'id' | 'created_at'>): Promise<ActivityFeedEvent> {
        const { data, error } = await this.client
            .from('activity_feed')
            .insert(event)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getRecentActivity(limit = 50, network?: 'mainnet' | 'testnet'): Promise<ActivityFeedEvent[]> {
        let query = this.client
            .from('activity_feed')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(limit);

        if (network) {
            query = query.eq('network', network);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    }

    // Notification Preferences
    async getNotificationPreferences(userAddress: string): Promise<NotificationPreferences | null> {
        const { data, error } = await this.client
            .from('notification_preferences')
            .select('*')
            .eq('user_address', userAddress)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async upsertNotificationPreferences(
        prefs: Partial<NotificationPreferences> & { user_address: string }
    ): Promise<void> {
        const { error } = await this.client
            .from('notification_preferences')
            .upsert(prefs);

        if (error) throw error;
    }

    async getTemplateWatchers(templateId: number): Promise<NotificationPreferences[]> {
        const { data, error } = await this.client
            .from('notification_preferences')
            .select('*')
            .contains('watch_templates', [templateId]);

        if (error) throw error;
        return data || [];
    }

    // Badges
    async getAllBadges(): Promise<Badge[]> {
        const { data, error } = await this.client
            .from('badges')
            .select('*')
            .order('requirement_value', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    // Leaderboard Rankings
    async recalculateRankings(): Promise<void> {
        // Update user rankings
        const { error: userError } = await this.client.rpc('update_user_rankings');
        if (userError) console.error('Error updating user rankings:', userError);

        // Update template rankings
        const { error: templateError } = await this.client.rpc('update_template_rankings');
        if (templateError) console.error('Error updating template rankings:', templateError);
    }
}

export const db = new DatabaseClient();

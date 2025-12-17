import { ChainhooksClient } from '@hirosystems/chainhooks-client';
import { config } from '../config/env.js';

export class ChainhookManager {
    private mainnetClient: ChainhooksClient;
    private testnetClient: ChainhooksClient;
    private registeredHooks: Map<string, { uuid: string; network: 'mainnet' | 'testnet' }> = new Map();

    constructor() {
        // Use Platform API base URL with API key in path
        const platformBaseUrl = 'https://api.platform.hiro.so/v1/ext';

        this.mainnetClient = new ChainhooksClient({
            baseUrl: `${platformBaseUrl}/${config.chainhooks.apiKey}`,
        });

        this.testnetClient = new ChainhooksClient({
            baseUrl: `${platformBaseUrl}/${config.chainhooks.apiKey}`,
        });
    }

    private getClient(network: 'mainnet' | 'testnet'): ChainhooksClient {
        return network === 'mainnet' ? this.mainnetClient : this.testnetClient;
    }

    private getContractAddress(network: 'mainnet' | 'testnet'): string {
        return network === 'mainnet' ? config.contracts.mainnet : config.contracts.testnet;
    }

    async registerMintMonitoring(network: 'mainnet' | 'testnet' = 'mainnet'): Promise<string> {
        const client = this.getClient(network);
        const contractAddress = this.getContractAddress(network);

        const chainhook = {
            version: '1',
            name: `template-nft-mints-${network}`,
            chain: 'stacks',
            network,
            filters: {
                events: [
                    {
                        type: 'nft_mint',
                        asset_identifier: `${contractAddress}::access-template`,
                    },
                ],
            },
            action: {
                type: 'http_post',
                url: `${config.backend.url}/api/webhooks/mint`,
                authorization_header: `Bearer ${config.backend.webhookSecret}`,
            },
            options: {
                decode_clarity_values: true,
                enable_on_registration: true,
            },
        };

        try {
            const result = await client.registerChainhook(chainhook as any);
            this.registeredHooks.set(`mint-${network}`, { uuid: result.uuid, network });
            console.log(`✅ Registered mint monitoring for ${network}: ${result.uuid}`);
            return result.uuid;
        } catch (error) {
            console.error(`❌ Failed to register mint monitoring for ${network}:`, error);
            throw error;
        }
    }

    async registerTransferMonitoring(network: 'mainnet' | 'testnet' = 'mainnet'): Promise<string> {
        const client = this.getClient(network);
        const contractAddress = this.getContractAddress(network);

        const chainhook = {
            version: '1',
            name: `template-nft-transfers-${network}`,
            chain: 'stacks',
            network,
            filters: {
                events: [
                    {
                        type: 'nft_transfer',
                        asset_identifier: `${contractAddress}::access-template`,
                    },
                ],
            },
            action: {
                type: 'http_post',
                url: `${config.backend.url}/api/webhooks/transfer`,
                authorization_header: `Bearer ${config.backend.webhookSecret}`,
            },
            options: {
                decode_clarity_values: true,
                enable_on_registration: true,
            },
        };

        try {
            const result = await client.registerChainhook(chainhook as any);
            this.registeredHooks.set(`transfer-${network}`, { uuid: result.uuid, network });
            console.log(`✅ Registered transfer monitoring for ${network}: ${result.uuid}`);
            return result.uuid;
        } catch (error) {
            console.error(`❌ Failed to register transfer monitoring for ${network}:`, error);
            throw error;
        }
    }

    async registerDeploymentMonitoring(network: 'mainnet' | 'testnet' = 'mainnet'): Promise<string> {
        const client = this.getClient(network);

        const chainhook = {
            version: '1',
            name: `contract-deployments-${network}`,
            chain: 'stacks',
            network,
            filters: {
                events: [
                    {
                        type: 'contract_deploy',
                    },
                ],
            },
            action: {
                type: 'http_post',
                url: `${config.backend.url}/api/webhooks/deployment`,
                authorization_header: `Bearer ${config.backend.webhookSecret}`,
            },
            options: {
                decode_clarity_values: true,
                enable_on_registration: true,
            },
        };

        try {
            const result = await client.registerChainhook(chainhook as any);
            this.registeredHooks.set(`deployment-${network}`, { uuid: result.uuid, network });
            console.log(`✅ Registered deployment monitoring for ${network}: ${result.uuid}`);
            return result.uuid;
        } catch (error) {
            console.error(`❌ Failed to register deployment monitoring for ${network}:`, error);
            throw error;
        }
    }

    async registerAllHooks(network: 'mainnet' | 'testnet' = 'mainnet'): Promise<void> {
        console.log(`\n🚀 Registering all chainhooks for ${network}...\n`);

        try {
            await this.registerMintMonitoring(network);
            await this.registerTransferMonitoring(network);
            await this.registerDeploymentMonitoring(network);

            console.log(`\n✅ All chainhooks registered successfully for ${network}\n`);
        } catch (error) {
            console.error(`\n❌ Failed to register all chainhooks for ${network}\n`);
            throw error;
        }
    }

    async getStatus(network: 'mainnet' | 'testnet' = 'mainnet'): Promise<unknown> {
        const client = this.getClient(network);
        return await client.getStatus();
    }

    async listAllHooks(network: 'mainnet' | 'testnet' = 'mainnet'): Promise<unknown> {
        const client = this.getClient(network);
        return await client.getChainhooks({ limit: 50 });
    }

    async enableHook(name: string, enabled: boolean): Promise<void> {
        const hook = this.registeredHooks.get(name);
        if (!hook) {
            throw new Error(`Hook ${name} not found in registered hooks`);
        }

        const client = this.getClient(hook.network);
        await client.enableChainhook(hook.uuid, enabled);
        console.log(`${enabled ? '✅ Enabled' : '⏸️  Disabled'} hook: ${name}`);
    }

    async deleteHook(name: string): Promise<void> {
        const hook = this.registeredHooks.get(name);
        if (!hook) {
            throw new Error(`Hook ${name} not found in registered hooks`);
        }

        const client = this.getClient(hook.network);
        await client.deleteChainhook(hook.uuid);
        this.registeredHooks.delete(name);
        console.log(`🗑️  Deleted hook: ${name}`);
    }

    getRegisteredHooks(): Map<string, { uuid: string; network: 'mainnet' | 'testnet' }> {
        return this.registeredHooks;
    }
}

export const chainhookManager = new ChainhookManager();

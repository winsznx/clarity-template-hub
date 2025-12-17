import { config } from '../config/env.js';

interface ChainhookDefinition {
    name: string;
    version: string;
    chain: string;
    network: string;
    filters: any;
    action: {
        type: string;
        url: string;
        authorization_header?: string;
    };
    options: {
        decode_clarity_values: boolean;
        enable_on_registration: boolean;
    };
}

export class PlatformChainhookManager {
    private baseUrl: string;
    private registeredHooks: Map<string, { uuid: string; network: 'mainnet' | 'testnet' }> = new Map();

    constructor() {
        // Platform API uses path-based authentication
        this.baseUrl = `https://api.platform.hiro.so/v1/ext/${config.chainhooks.apiKey}`;
    }

    private async request(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
        const url = `${this.baseUrl}${endpoint}`;

        const options: RequestInit = {
            method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Platform API error (${response.status}): ${text}`);
        }

        return response.json();
    }

    async registerChainhook(definition: ChainhookDefinition): Promise<{ uuid: string }> {
        return this.request('/chainhooks', 'POST', definition);
    }

    async listChainhooks(): Promise<any> {
        return this.request('/chainhooks');
    }

    async getChainhook(uuid: string): Promise<any> {
        return this.request(`/chainhooks/${uuid}`);
    }

    async deleteChainhook(uuid: string): Promise<void> {
        await this.request(`/chainhooks/${uuid}`, 'DELETE');
    }

    private getContractAddress(network: 'mainnet' | 'testnet'): string {
        return network === 'mainnet' ? config.contracts.mainnet : config.contracts.testnet;
    }

    async registerMintMonitoring(network: 'mainnet' | 'testnet' = 'mainnet'): Promise<string> {
        const contractAddress = this.getContractAddress(network);

        const chainhook: ChainhookDefinition = {
            version: '1',
            name: `template-nft-mints-${network}`,
            chain: 'stacks',
            network,
            filters: {
                events: [
                    {
                        type: 'nft_mint',
                        asset_identifier: `${contractAddress}.template-access-nft-v2::access-template`,
                    },
                ],
            },
            action: {
                type: 'http_post',
                url: `${config.backend.url}/api/webhooks/mint`,
            },
            options: {
                decode_clarity_values: true,
                enable_on_registration: true,
            },
        };

        try {
            const result = await this.registerChainhook(chainhook);
            this.registeredHooks.set(`mint-${network}`, { uuid: result.uuid, network });
            console.log(`✅ Registered mint monitoring for ${network}: ${result.uuid}`);
            return result.uuid;
        } catch (error) {
            console.error(`❌ Failed to register mint monitoring for ${network}:`, error);
            throw error;
        }
    }

    async registerTransferMonitoring(network: 'mainnet' | 'testnet' = 'mainnet'): Promise<string> {
        const contractAddress = this.getContractAddress(network);

        const chainhook: ChainhookDefinition = {
            version: '1',
            name: `template-nft-transfers-${network}`,
            chain: 'stacks',
            network,
            filters: {
                events: [
                    {
                        type: 'nft_transfer',
                        asset_identifier: `${contractAddress}.template-access-nft-v2::access-template`,
                    },
                ],
            },
            action: {
                type: 'http_post',
                url: `${config.backend.url}/api/webhooks/transfer`,
            },
            options: {
                decode_clarity_values: true,
                enable_on_registration: true,
            },
        };

        try {
            const result = await this.registerChainhook(chainhook);
            this.registeredHooks.set(`transfer-${network}`, { uuid: result.uuid, network });
            console.log(`✅ Registered transfer monitoring for ${network}: ${result.uuid}`);
            return result.uuid;
        } catch (error) {
            console.error(`❌ Failed to register transfer monitoring for ${network}:`, error);
            throw error;
        }
    }

    async registerDeploymentMonitoring(network: 'mainnet' | 'testnet' = 'mainnet'): Promise<string> {
        const chainhook: ChainhookDefinition = {
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
            },
            options: {
                decode_clarity_values: true,
                enable_on_registration: true,
            },
        };

        try {
            const result = await this.registerChainhook(chainhook);
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

    getRegisteredHooks(): Map<string, { uuid: string; network: 'mainnet' | 'testnet' }> {
        return this.registeredHooks;
    }
}

export const platformChainhookManager = new PlatformChainhookManager();

#!/usr/bin/env tsx

import { chainhookManager } from '../chainhooks/manager.js';
import { config } from '../config/env.js';

async function main() {
    console.log('🔧 Chainhooks Setup Script\n');
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`Backend URL: ${config.backend.url}\n`);

    const network = process.argv[2] as 'mainnet' | 'testnet' || 'testnet';

    if (network !== 'mainnet' && network !== 'testnet') {
        console.error('❌ Invalid network. Use: npm run setup:chainhooks [mainnet|testnet]');
        process.exit(1);
    }

    console.log(`📡 Registering chainhooks for ${network}...\n`);

    try {
        await chainhookManager.registerAllHooks(network);

        console.log('\n✅ Setup complete!\n');
        console.log('Registered hooks:');

        const hooks = chainhookManager.getRegisteredHooks();
        for (const [name, { uuid, network: hookNetwork }] of hooks.entries()) {
            console.log(`  - ${name} (${hookNetwork}): ${uuid}`);
        }

        console.log('\n📊 Checking API status...\n');
        const status = await chainhookManager.getStatus(network);
        console.log('API Status:', status);

    } catch (error) {
        console.error('\n❌ Setup failed:', error);
        process.exit(1);
    }
}

main();

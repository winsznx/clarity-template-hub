import { chainhookManager } from '../chainhooks/manager.js';

async function main() {
    console.log('🗑️  Deleting old chainhooks...\n');

    const hooks = ['mint-testnet', 'transfer-testnet', 'deployment-testnet'];

    for (const hook of hooks) {
        try {
            await chainhookManager.deleteHook(hook);
        } catch (error) {
            console.log(`⚠️  Could not delete ${hook}:`, error.message);
        }
    }

    console.log('\n✅ Cleanup complete!\n');
}

main().catch(console.error);

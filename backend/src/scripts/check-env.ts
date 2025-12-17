import { config } from '../config/env.js';

console.log('🔍 Environment Check');
console.log('===================');
console.log(`NODE_ENV: ${config.nodeEnv}`);
console.log(`Backend URL: ${config.backend.url}`);
console.log(`Chainhooks API Key: ${config.chainhooks.apiKey ? `${config.chainhooks.apiKey.substring(0, 8)}...` : 'NOT SET'}`);
console.log(`Chainhooks Testnet URL: ${config.chainhooks.testnetUrl}`);
console.log(`Chainhooks Mainnet URL: ${config.chainhooks.mainnetUrl}`);

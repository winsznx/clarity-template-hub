// Reown AppKit Configuration for Bitcoin/Multi-Chain Wallet Support
import { createAppKit } from '@reown/appkit/react'
import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin'
import { bitcoin, bitcoinTestnet } from '@reown/appkit/networks'

// Get Project ID from environment variable
// Create one at https://dashboard.reown.com
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || ''

// Set up the Bitcoin adapter
const bitcoinAdapter = new BitcoinAdapter({ projectId })

// App metadata for wallet display
const metadata = {
    name: 'Clarity Hub',
    description: 'Premium Smart Contract Templates for Bitcoin/Stacks',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://clarityhub.app',
    icons: ['/logo.svg']
}

// Create the AppKit modal
export const appKit = createAppKit({
    adapters: [bitcoinAdapter],
    networks: [bitcoin, bitcoinTestnet],
    metadata,
    projectId,
    features: {
        analytics: true,
        email: false,
        socials: []
    }
})

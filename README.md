# Clarity Template Hub

> A decentralized marketplace for Clarity smart contract templates, powered by SIP-009 NFTs on the Stacks blockchain.

![Clarity 4](https://img.shields.io/badge/Clarity-4-orange)
![SIP-009](https://img.shields.io/badge/SIP-009-blue)
![Stacks](https://img.shields.io/badge/Stacks-Mainnet-green)

## Overview

Clarity Template Hub is a Web3 DApp that provides access-gated smart contract templates for Stacks developers. Users mint NFTs to unlock premium Clarity 4 templates, which can be viewed, copied, and deployed.

### Features

- 🔐 **NFT-Gated Access** - Mint SIP-009 NFTs to unlock template access
- 📝 **50 Templates** - Production-ready Clarity 4 smart contracts
- 🌐 **Multi-Network** - Supports both Testnet and Mainnet
- 👛 **Wallet Integration** - Works with Leather, Xverse, and other Stacks wallets
- 🎨 **Modern UI** - Dark/light theme with responsive design
- ⚡ **On-Chain Ownership** - Persistent ownership verification from blockchain

## Deployed Contracts

### Mainnet
- **Address:** `SP31DP8F8CF2GXSZBHHHK5J6Y061744E1TNFGYWYV`
- **Contract:** `template-access-nft-v2`
- **Explorer:** [View on Explorer](https://explorer.stacks.co/address/SP31DP8F8CF2GXSZBHHHK5J6Y061744E1TNFGYWYV.template-access-nft-v2?chain=mainnet)

### Testnet
- **Address:** `ST31DP8F8CF2GXSZBHHHK5J6Y061744E1TP7FRGHT`
- **Contract:** `template-access-nft-v2`
- **Explorer:** [View on Explorer](https://explorer.stacks.co/address/ST31DP8F8CF2GXSZBHHHK5J6Y061744E1TP7FRGHT.template-access-nft-v2?chain=testnet)

## Tech Stack

- **Smart Contracts:** Clarity 4 with SIP-009 NFT standard
- **Frontend:** React 18 + TypeScript + Vite
- **Wallet:** @stacks/connect v8.2.3
- **Transactions:** @stacks/transactions v7.3.0
- **Styling:** Vanilla CSS with custom design system
- **Deployment:** Clarinet + Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- [Clarinet](https://docs.hiro.so/clarinet/getting-started) (for contract development)
- Stacks wallet (Leather or Xverse)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/clarity-template-hub.git
cd clarity-template-hub

# Install frontend dependencies
cd frontend
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_TESTNET_CONTRACT_ADDRESS=ST31DP8F8CF2GXSZBHHHK5J6Y061744E1TP7FRGHT
VITE_MAINNET_CONTRACT_ADDRESS=SP31DP8F8CF2GXSZBHHHK5J6Y061744E1TNFGYWYV
VITE_NFT_CONTRACT_NAME=template-access-nft-v2
VITE_TEMPLATES_JSON_URL=/templates.json
```

### Building for Production

```bash
cd frontend
npm run build
```

Output will be in `frontend/dist/`.

## Smart Contract

The `template-access-nft-v2` contract is a SIP-009 compliant NFT with these key functions:

### Public Functions

| Function | Description |
|----------|-------------|
| `mint(template-id uint)` | Mint access NFT for a template (0.1 STX) |
| `transfer(token-id uint, sender principal, recipient principal)` | Transfer NFT |

### Read-Only Functions

| Function | Description |
|----------|-------------|
| `has-access(user principal, template-id uint)` | Check if user owns template |
| `get-owner(token-id uint)` | Get owner of token |
| `get-mint-price()` | Get current mint price |

### Clarity 4 Features

- `stacks-block-time` - Block timestamp in mint events
- SIP-009 trait implementation
- Post-condition protected minting

## Template Categories

- **DeFi** - Token swaps, lending, vaults
- **NFT** - Collections, marketplaces, royalties
- **DAO** - Governance, voting, treasury
- **Gaming** - On-chain games, rewards
- **Security** - Multisig, timelocks, escrow
- **Utility** - Oracles, bridges, utilities
- **Social** - Tipping, subscriptions
- **Identity** - Credentials, verification

## Project Structure

```
clarity-template-hub/
├── contracts/
│   ├── sip-009-nft-trait.clar    # SIP-009 trait
│   ├── template-access-nft.clar   # Original contract
│   └── template-access-nft-v2.clar # Updated contract (deployed)
├── frontend/
│   ├── src/
│   │   ├── App.tsx               # Main application
│   │   └── index.css             # Design system
│   ├── public/
│   │   ├── logo.svg              # App logo
│   │   └── templates.json        # Template data
│   ├── vercel.json               # Vercel config
│   └── .env                      # Environment variables
├── templates/
│   └── templates.json            # Full template library
├── settings/
│   ├── Testnet.toml              # Testnet deployer config
│   └── Mainnet.toml              # Mainnet deployer config
└── Clarinet.toml                 # Clarinet project config
```

## Deployment

### Frontend (Vercel)

```bash
cd frontend
npx vercel --prod
```

### Contracts (Clarinet)

```bash
# Testnet
clarinet deployments generate --testnet --medium-cost
clarinet deployments apply --testnet

# Mainnet
clarinet deployments generate --mainnet --medium-cost
clarinet deployments apply --mainnet
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- [Stacks Foundation](https://stacks.org)
- [Hiro](https://hiro.so) for Clarinet and Stacks.js
- [Lucide](https://lucide.dev) for icons

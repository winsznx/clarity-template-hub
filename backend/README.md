# Clarity Template Hub - Backend API

Real-time backend API for Clarity Template Hub with Chainhooks integration.

## Features

- 🔗 **Chainhooks Integration** - Real-time blockchain event monitoring
- 📊 **Analytics** - Template and user statistics
- 🏆 **Leaderboards** - User and template rankings
- 🔔 **Notifications** - Multi-channel notification system
- 🌐 **WebSocket** - Real-time updates to frontend clients
- 🗄️ **Supabase** - PostgreSQL database for event storage

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `CHAINHOOKS_API_KEY` - Get from [Hiro](https://www.hiro.so/)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_KEY` - Supabase service role key
- `BACKEND_URL` - Your deployed backend URL (for webhooks)
- `WEBHOOK_SECRET` - Generate a random secret for webhook security

### 3. Set Up Database

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the schema from `src/db/schema.sql` in the Supabase SQL editor
3. Update `.env` with your Supabase credentials

```bash
npm run setup:db
```

### 4. Register Chainhooks

For testnet:
```bash
npm run setup:chainhooks testnet
```

For mainnet:
```bash
npm run setup:chainhooks mainnet
```

### 5. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3001`
WebSocket server will run on `ws://localhost:3002`

## API Endpoints

### Analytics

- `GET /api/analytics/overview` - Platform overview stats
- `GET /api/analytics/template/:templateId` - Template-specific stats
- `GET /api/analytics/user/:address` - User-specific stats

### Leaderboards

- `GET /api/leaderboard/users?limit=100` - User leaderboard
- `GET /api/leaderboard/templates?limit=50` - Template leaderboard
- `GET /api/leaderboard/user/:address` - User rank

### Activity

- `GET /api/activity/recent?limit=50&network=mainnet` - Recent activity feed
- `GET /api/activity/user/:address?limit=50` - User activity history

### Notifications

- `GET /api/notifications/preferences/:address` - Get user preferences
- `POST /api/notifications/preferences/:address` - Update preferences

### Webhooks (Internal)

These endpoints receive events from Chainhooks:

- `POST /api/webhooks/mint` - NFT mint events
- `POST /api/webhooks/transfer` - NFT transfer events
- `POST /api/webhooks/deployment` - Contract deployment events

## WebSocket Events

Connect to `ws://localhost:3002` to receive real-time updates:

```typescript
const ws = new WebSocket('ws://localhost:3002');

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  switch (message.type) {
    case 'mint':
      console.log('New mint:', message.data);
      break;
    case 'transfer':
      console.log('NFT transferred:', message.data);
      break;
    case 'deployment':
      console.log('Contract deployed:', message.data);
      break;
    case 'notification':
      console.log('Notification:', message.data);
      break;
    case 'leaderboard_update':
      console.log('Leaderboard updated');
      break;
  }
};
```

## Deployment

### Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Set environment variables in Vercel dashboard

4. Register chainhooks with production URL:
```bash
BACKEND_URL=https://your-backend.vercel.app npm run setup:chainhooks mainnet
```

### Environment Variables

Make sure to set all environment variables in your deployment platform:

```
CHAINHOOKS_API_KEY=your-api-key
CHAINHOOKS_BASE_URL=https://api.mainnet.hiro.so
CHAINHOOKS_TESTNET_URL=https://api.testnet.hiro.so
NFT_CONTRACT_MAINNET=SP31DP8F8CF2GXSZBHHHK5J6Y061744E1TNFGYWYV.template-access-nft-v2
NFT_CONTRACT_TESTNET=ST31DP8F8CF2GXSZBHHHK5J6Y061744E1TP7FRGHT.template-access-nft-v2
BACKEND_URL=https://your-backend.vercel.app
WEBHOOK_SECRET=your-webhook-secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
RESEND_API_KEY=your-resend-key (optional)
FROM_EMAIL=noreply@yourdomain.com (optional)
NODE_ENV=production
```

## Architecture

```
backend/
├── src/
│   ├── api/
│   │   ├── webhooks/       # Chainhook webhook handlers
│   │   ├── analytics/      # Analytics endpoints
│   │   ├── leaderboard/    # Leaderboard endpoints
│   │   ├── activity/       # Activity feed endpoints
│   │   └── notifications/  # Notification endpoints
│   ├── services/
│   │   ├── websocket.ts    # WebSocket server
│   │   ├── notifications.ts # Notification service
│   │   ├── analytics.ts    # Analytics aggregation
│   │   ├── leaderboard.ts  # Ranking calculations
│   │   └── template-verification.ts # Code verification
│   ├── chainhooks/
│   │   └── manager.ts      # Chainhook registration
│   ├── db/
│   │   ├── schema.sql      # Database schema
│   │   └── client.ts       # Supabase client
│   ├── config/
│   │   └── env.ts          # Environment configuration
│   ├── scripts/
│   │   ├── setup-chainhooks.ts # Chainhook setup
│   │   └── setup-database.ts   # Database setup
│   └── index.ts            # Express server
├── package.json
├── tsconfig.json
└── vercel.json
```

## Monitoring

### Health Check

```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-16T19:00:00.000Z",
  "websocket_clients": 5
}
```

### Check Chainhooks Status

```typescript
import { chainhookManager } from './src/chainhooks/manager';

const status = await chainhookManager.getStatus('mainnet');
console.log(status);

const hooks = await chainhookManager.listAllHooks('mainnet');
console.log(hooks);
```

## Troubleshooting

### Webhooks Not Receiving Events

1. Check chainhook registration:
```bash
npm run setup:chainhooks testnet
```

2. Verify webhook URL is publicly accessible
3. Check webhook secret matches in `.env`
4. Review Hiro dashboard for chainhook status

### Database Connection Issues

1. Verify Supabase credentials in `.env`
2. Check if schema is properly created
3. Ensure service key has proper permissions

### WebSocket Connection Failed

1. Check if WebSocket port (3002) is available
2. Verify firewall allows WebSocket connections
3. Check CORS settings if connecting from different origin

## License

MIT

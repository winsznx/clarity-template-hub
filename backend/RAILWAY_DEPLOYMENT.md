# Railway Deployment Guide

## Prerequisites

- Railway account ([railway.app](https://railway.app))
- Hiro API key from [platform.hiro.so](https://platform.hiro.so)
- GitHub repository with your code

## Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

## Step 2: Login to Railway

```bash
railway login
```

## Step 3: Create New Project

```bash
cd backend
railway init
```

Select "Create new project" and give it a name (e.g., "clarity-template-hub-backend")

## Step 4: Add PostgreSQL Database

```bash
railway add
```

Select "PostgreSQL" from the list. Railway will automatically inject `DATABASE_URL` environment variable.

## Step 5: Set Environment Variables

```bash
# Chainhooks Configuration
railway variables set CHAINHOOKS_API_KEY="your-hiro-api-key"
railway variables set CHAINHOOKS_BASE_URL="https://api.mainnet.hiro.so"
railway variables set CHAINHOOKS_TESTNET_URL="https://api.testnet.hiro.so"

# Contract Addresses
railway variables set NFT_CONTRACT_MAINNET="SP31DP8F8CF2GXSZBHHHK5J6Y061744E1TNFGYWYV.template-access-nft-v2"
railway variables set NFT_CONTRACT_TESTNET="ST31DP8F8CF2GXSZBHHHK5J6Y061744E1TP7FRGHT.template-access-nft-v2"

# Backend Configuration (will be set after first deployment)
railway variables set BACKEND_URL="https://your-backend.up.railway.app"
railway variables set WEBHOOK_SECRET="$(openssl rand -hex 32)"
railway variables set PORT="3001"

# WebSocket
railway variables set WS_PORT="3002"

# Optional: Email notifications
railway variables set RESEND_API_KEY="your-resend-key"
railway variables set FROM_EMAIL="noreply@yourdomain.com"

# Environment
railway variables set NODE_ENV="production"
```

## Step 6: Deploy Backend

```bash
railway up
```

This will:
1. Build your TypeScript code
2. Deploy to Railway
3. Start the server

## Step 7: Get Your Railway URL

```bash
railway status
```

Copy the deployment URL (e.g., `https://clarity-template-hub-backend.up.railway.app`)

## Step 8: Update BACKEND_URL

```bash
railway variables set BACKEND_URL="https://your-actual-url.up.railway.app"
```

## Step 9: Run Database Migrations

```bash
railway run npm run setup:db
```

Or manually run the SQL from `src/db/schema.sql` in Railway's PostgreSQL dashboard.

## Step 10: Register Chainhooks

For testnet:
```bash
railway run npm run setup:chainhooks testnet
```

For mainnet:
```bash
railway run npm run setup:chainhooks mainnet
```

## Step 11: Verify Deployment

```bash
# Check health endpoint
curl https://your-backend.up.railway.app/health

# Expected response:
# {"status":"ok","timestamp":"...","websocket_clients":0}
```

## Step 12: Deploy Frontend to Vercel

```bash
cd ../frontend

# Update .env with Railway backend URL
echo "VITE_API_URL=https://your-backend.up.railway.app" > .env
echo "VITE_WS_URL=wss://your-backend.up.railway.app" >> .env

# Deploy to Vercel
vercel --prod
```

Set environment variables in Vercel dashboard:
- `VITE_API_URL=https://your-backend.up.railway.app`
- `VITE_WS_URL=wss://your-backend.up.railway.app`
- `VITE_TESTNET_CONTRACT_ADDRESS=ST31DP8F8CF2GXSZBHHHK5J6Y061744E1TP7FRGHT`
- `VITE_MAINNET_CONTRACT_ADDRESS=SP31DP8F8CF2GXSZBHHHK5J6Y061744E1TNFGYWYV`
- `VITE_NFT_CONTRACT_NAME=template-access-nft-v2`
- `VITE_TEMPLATES_JSON_URL=/templates.json`

## Monitoring

### View Logs

```bash
railway logs
```

### View Database

```bash
railway connect postgres
```

### Restart Service

```bash
railway restart
```

## Troubleshooting

### Database Connection Issues

If you see database connection errors:

1. Verify `DATABASE_URL` is set:
```bash
railway variables
```

2. Check PostgreSQL is running:
```bash
railway status
```

3. Run migrations again:
```bash
railway run npm run setup:db
```

### Chainhooks Not Registering

1. Verify API key is correct:
```bash
railway variables | grep CHAINHOOKS_API_KEY
```

2. Check backend URL is accessible:
```bash
curl https://your-backend.up.railway.app/health
```

3. Re-register chainhooks:
```bash
railway run npm run setup:chainhooks testnet
```

### WebSocket Not Connecting

1. Ensure WebSocket port is configured:
```bash
railway variables | grep WS_PORT
```

2. Check if WebSocket server is running in logs:
```bash
railway logs | grep WebSocket
```

## Continuous Deployment

Railway automatically deploys when you push to your connected GitHub repository.

To connect GitHub:
1. Go to Railway dashboard
2. Select your project
3. Click "Settings" → "GitHub"
4. Connect your repository

Now every push to `main` branch will trigger a deployment!

## Cost Estimation

Railway pricing (as of 2024):
- **Starter Plan**: $5/month
  - 500 hours of usage
  - 8GB RAM
  - 8GB storage
  - PostgreSQL included

- **Pro Plan**: $20/month
  - Unlimited usage
  - More resources
  - Priority support

For this project, the Starter plan should be sufficient for development and moderate production use.

## Next Steps

1. ✅ Backend deployed to Railway
2. ✅ PostgreSQL database configured
3. ✅ Chainhooks registered
4. ✅ Frontend deployed to Vercel
5. 🎯 Monitor chainhook events in Railway logs
6. 🎯 Test real-time features with a testnet mint

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Hiro Discord: https://stacks.chat (# chainhook channel)

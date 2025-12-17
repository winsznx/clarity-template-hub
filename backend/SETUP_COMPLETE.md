# Railway Deployment - Final Setup Steps

## ✅ Backend Deployed!

**URL**: https://precious-ambition-production.up.railway.app

## Next Steps

### 1. Set Environment Variables in Railway

Go to Railway dashboard → "precious-ambition" → Variables tab:

```bash
CHAINHOOKS_API_KEY=<your-hiro-api-key-here>
BACKEND_URL=https://precious-ambition-production.up.railway.app
WEBHOOK_SECRET=a75f3bfe63b5fd5e8fb9dd239a5f9d25b5c423a907530ad16ff7af5ba4e0a1e0
CHAINHOOKS_BASE_URL=https://api.mainnet.hiro.so
CHAINHOOKS_TESTNET_URL=https://api.testnet.hiro.so
NFT_CONTRACT_MAINNET=SP31DP8F8CF2GXSZBHHHK5J6Y061744E1TNFGYWYV.template-access-nft-v2
NFT_CONTRACT_TESTNET=ST31DP8F8CF2GXSZBHHHK5J6Y061744E1TP7FRGHT.template-access-nft-v2
PORT=3001
WS_PORT=3002
NODE_ENV=production
```

**Note**: `DATABASE_URL` is auto-injected by Railway PostgreSQL

### 2. Run Database Migrations

**Option A: Via Railway Dashboard**
1. Go to PostgreSQL service → Data tab
2. Open SQL editor
3. Copy and paste contents of `backend/src/db/schema.sql`
4. Execute

**Option B: Via Railway CLI**
```bash
railway run npm run setup:db
```

### 3. Register Chainhooks

After setting environment variables:

```bash
# For testnet (recommended first)
railway run npm run setup:chainhooks testnet

# For mainnet (after testing)
railway run npm run setup:chainhooks mainnet
```

### 4. Update Frontend Environment

Update `frontend/.env`:
```env
VITE_API_URL=https://precious-ambition-production.up.railway.app
VITE_WS_URL=wss://precious-ambition-production.up.railway.app
VITE_TESTNET_CONTRACT_ADDRESS=ST31DP8F8CF2GXSZBHHHK5J6Y061744E1TP7FRGHT
VITE_MAINNET_CONTRACT_ADDRESS=SP31DP8F8CF2GXSZBHHHK5J6Y061744E1TNFGYWYV
VITE_NFT_CONTRACT_NAME=template-access-nft-v2
VITE_TEMPLATES_JSON_URL=/templates.json
```

### 5. Deploy Frontend to Vercel

```bash
cd frontend
vercel --prod
```

Or connect GitHub repo in Vercel dashboard for auto-deployments.

### 6. Test the Integration

**Health Check:**
```bash
curl https://precious-ambition-production.up.railway.app/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-12-16T...",
  "websocket_clients": 0
}
```

**Test Analytics Endpoint:**
```bash
curl https://precious-ambition-production.up.railway.app/api/analytics/overview
```

### 7. Monitor Chainhooks

After registration, monitor webhook events:
```bash
railway logs
```

## Verification Checklist

- [ ] Environment variables set in Railway
- [ ] Database schema executed
- [ ] Chainhooks registered (testnet)
- [ ] Health endpoint responding
- [ ] Frontend deployed with correct API URL
- [ ] Test mint on testnet
- [ ] Verify webhook receives event
- [ ] Check activity feed updates
- [ ] Verify analytics dashboard

## Troubleshooting

### Service Not Starting

Check Railway logs:
```bash
railway logs
```

Common issues:
- Missing environment variables
- Database connection failed
- Port binding issues

### Chainhook Registration Fails

Verify:
1. `CHAINHOOKS_API_KEY` is set correctly
2. `BACKEND_URL` matches your Railway URL
3. Hiro API is accessible

### Database Connection Issues

Ensure PostgreSQL service is running and `DATABASE_URL` is injected.

## Success!

Once all steps are complete, your Clarity Template Hub will have:
- ✅ Real-time template deployment tracking
- ✅ Analytics dashboard
- ✅ Leaderboards
- ✅ Activity feed
- ✅ Notification system

All powered by Chainhooks! 🚀

# Railway Deployment - Quick Commands

## Current Status
- ✅ Project created: `clarity-template-hub-backend`
- ✅ PostgreSQL database added
- ❌ Backend service needs to be created

## Create Backend Service & Deploy

```bash
# Navigate to backend directory
cd backend

# Create new service (NOT linked to Postgres)
railway service link

# When prompted:
# 1. Select "Create new service"
# 2. Name it: backend
# 3. Press Enter

# Then deploy
railway up --detach

# Check deployment status
railway status

# View logs
railway logs
```

## After Successful Deployment

### 1. Get Your Backend URL
```bash
railway domain
```

### 2. Set Environment Variables
```bash
# Set your Hiro API key
railway variables --set "CHAINHOOKS_API_KEY=your-api-key-here"

# Set backend URL (use the domain from step 1)
railway variables --set "BACKEND_URL=https://your-backend.up.railway.app"
```

### 3. Run Database Migrations
```bash
# Connect to your Railway project's database
railway run npm run setup:db
```

### 4. Register Chainhooks
```bash
# For testnet
railway run npm run setup:chainhooks testnet

# For mainnet
railway run npm run setup:chainhooks mainnet
```

## Troubleshooting

### If deployment fails:
```bash
# Check logs
railway logs

# Check build logs
railway logs --build
```

### If service is linked to Postgres:
```bash
# Unlink and create new service
railway service link
# Select "Create new service" instead of "Postgres"
```

## Environment Variables Needed

Set these in Railway dashboard or via CLI:

- `CHAINHOOKS_API_KEY` - Your Hiro API key ✅ (you have this)
- `BACKEND_URL` - Your Railway backend URL (get after deployment)
- `WEBHOOK_SECRET` - Auto-generated: `a75f3bfe63b5fd5e8fb9dd239a5f9d25b5c423a907530ad16ff7af5ba4e0a1e0`
- `DATABASE_URL` - Auto-injected by Railway ✅
- `NODE_ENV=production` - Set automatically

Optional:
- `RESEND_API_KEY` - For email notifications
- `FROM_EMAIL` - Email sender address

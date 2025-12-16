# Quick Start Guide

## Local Development Setup

### 1. Configure Environment

You have two options:

**Option A: Interactive Setup (Recommended)**
```bash
cd backend
./setup-env.sh
```

**Option B: Manual Setup**
```bash
cd backend
cp .env.example .env
# Edit .env with your values
```

Required environment variables:
- `CHAINHOOKS_API_KEY` - Your Hiro API key
- `BACKEND_URL` - For local testing, use `http://localhost:3001`
- `WEBHOOK_SECRET` - Generate with: `openssl rand -hex 32`

### 2. Choose Database

**For Quick Testing (Supabase - Recommended)**:
1. Create free account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → API → Copy URL and keys
4. Run SQL from `src/db/schema.sql` in SQL Editor

**For Local Development (PostgreSQL)**:
```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL
brew services start postgresql@15

# Create database
createdb clarity_template_hub

# Set DATABASE_URL in .env
DATABASE_URL=postgresql://localhost/clarity_template_hub
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up Database

```bash
npm run setup:db
```

### 5. Start Development Server

```bash
npm run dev
```

Server will start on `http://localhost:3001`

### 6. Test Health Endpoint

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{"status":"ok","timestamp":"...","websocket_clients":0}
```

## Testing Chainhooks Locally

### Option 1: Use ngrok for Webhook Testing

```bash
# Install ngrok
brew install ngrok

# Start ngrok tunnel
ngrok http 3001
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.io`) and update your `.env`:
```bash
BACKEND_URL=https://abc123.ngrok.io
```

Then register chainhooks:
```bash
npm run setup:chainhooks testnet
```

### Option 2: Skip Webhook Testing (Test APIs Only)

You can test the API endpoints without registering chainhooks:

```bash
# Test analytics endpoint
curl http://localhost:3001/api/analytics/overview

# Test activity endpoint
curl http://localhost:3001/api/activity/recent?limit=10
```

## Frontend Setup

```bash
cd frontend

# Create .env
echo "VITE_API_URL=http://localhost:3001" > .env
echo "VITE_WS_URL=ws://localhost:3002" >> .env

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend will be available at `http://localhost:5173`

## Testing the Integration

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Open Browser
Navigate to `http://localhost:5173`

### 4. Connect Wallet
Click "Connect Wallet" and connect with Leather or Xverse

### 5. Mint a Template NFT (Testnet)
1. Make sure you're on testnet
2. Select a template
3. Click "Mint Access NFT"
4. Approve transaction in wallet

### 6. Watch Real-Time Updates
If chainhooks are registered, you'll see:
- Activity feed updates
- Analytics dashboard updates
- Leaderboard changes

## Troubleshooting

### "Cannot find module" errors
```bash
cd backend
npm install
npm run build
```

### Database connection errors
Verify your database credentials in `.env` and ensure the database is running.

### Chainhook registration fails
1. Verify `CHAINHOOKS_API_KEY` is correct
2. Ensure `BACKEND_URL` is publicly accessible (use ngrok for local testing)
3. Check Hiro API status at [status.hiro.so](https://status.hiro.so)

### WebSocket not connecting
1. Ensure backend is running
2. Check `WS_PORT` in `.env` (default: 3002)
3. Verify firewall allows WebSocket connections

## Next Steps

Once local testing is complete:
1. Deploy backend to Railway (see `RAILWAY_DEPLOYMENT.md`)
2. Deploy frontend to Vercel
3. Register chainhooks with production URLs
4. Monitor in production

## Useful Commands

```bash
# Backend
npm run dev          # Start development server
npm run build        # Build TypeScript
npm run start        # Start production server
npm run setup:db     # Set up database
npm run setup:chainhooks testnet  # Register testnet chainhooks
npm run setup:chainhooks mainnet  # Register mainnet chainhooks

# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

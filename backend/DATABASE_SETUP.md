# Quick Database Setup Guide

## The Issue

Railway's PostgreSQL uses an internal hostname (`postgres.railway.internal`) that's only accessible from within Railway's network, not from your local machine.

## Solution: Use Railway Dashboard

### Step-by-Step Instructions

1. **Open Railway Dashboard**
   - Go to: https://railway.com/project/b42b95ca-bb29-4b11-9eb4-20deed08752d

2. **Click on PostgreSQL Service**
   - You'll see two services: "Postgres" and "precious-ambition"
   - Click on **"Postgres"**

3. **Open Data Tab**
   - Click the **"Data"** tab at the top

4. **Open Query Editor**
   - Look for **"Query"** or **"SQL Editor"** button
   - Click it to open the SQL editor

5. **Copy the Schema**
   - Open `backend/src/db/schema.sql` in your editor
   - Select ALL content (Cmd+A)
   - Copy it (Cmd+C)

6. **Paste and Execute**
   - Paste the SQL into Railway's query editor
   - Click **"Run"** or **"Execute"**
   - Wait for completion (should take a few seconds)

7. **Verify Success**
   - You should see messages about tables being created
   - Check the "Tables" section - you should see 8 new tables:
     - mints
     - transfers
     - deployments
     - template_analytics
     - user_analytics
     - notification_preferences
     - activity_feed
     - badges

## What the Schema Creates

- **8 Tables** for storing blockchain data
- **Triggers** for automatic analytics updates
- **Indexes** for query performance
- **Functions** for leaderboard calculations

## After Setup

Once the database is set up, you can proceed to:

```bash
# Step 3: Register chainhooks
railway run npm run setup:chainhooks testnet

# Step 4: Deploy frontend
cd frontend
vercel --prod
```

## Alternative: Use Railway CLI with Proxy

If you really want to use the CLI:

```bash
railway connect postgres
# This opens a proxy connection
# Then in another terminal:
psql -h localhost -p <port-from-connect> -U postgres < src/db/schema.sql
```

But the dashboard method is much simpler! 🚀

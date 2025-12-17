#!/bin/bash

# Simple Railway Database Setup
# Uses Railway's connect command to create a local proxy

echo "🗄️  Setting up Railway PostgreSQL database..."
echo ""

# Step 1: Start Railway connection proxy in background
echo "📡 Starting Railway database connection..."
railway connect postgres &
PROXY_PID=$!

# Wait for proxy to start
sleep 3

# Step 2: Execute schema
echo "📝 Executing database schema..."
psql -h localhost -p 5432 -U postgres -d railway < src/db/schema.sql

# Step 3: Cleanup
echo ""
echo "🧹 Cleaning up..."
kill $PROXY_PID 2>/dev/null

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Next step: Register chainhooks"
echo "  railway run npm run setup:chainhooks testnet"

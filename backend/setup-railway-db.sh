#!/bin/bash

# Railway Database Setup Script
# This script executes the database schema in Railway PostgreSQL

echo "🗄️  Setting up Railway PostgreSQL database..."
echo ""

# Check if Railway CLI is available
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Install it first:"
    echo "npm install -g @railway/cli"
    exit 1
fi

# Get the DATABASE_URL from Railway
echo "📡 Fetching DATABASE_URL from Railway..."
DATABASE_URL=$(railway variables --json | jq -r '.DATABASE_URL')

if [ -z "$DATABASE_URL" ] || [ "$DATABASE_URL" = "null" ]; then
    echo "❌ DATABASE_URL not found in Railway variables"
    echo ""
    echo "Make sure:"
    echo "1. You're linked to the correct Railway project"
    echo "2. PostgreSQL service is added to your project"
    echo "3. DATABASE_URL is injected by Railway"
    exit 1
fi

echo "✅ DATABASE_URL found"
echo ""

# Execute the schema
echo "📝 Executing database schema..."
echo ""

# Use psql to execute the schema file
if command -v psql &> /dev/null; then
    psql "$DATABASE_URL" < src/db/schema.sql
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Database schema executed successfully!"
        echo ""
        echo "Tables created:"
        echo "  - mints"
        echo "  - transfers"
        echo "  - deployments"
        echo "  - template_analytics"
        echo "  - user_analytics"
        echo "  - notification_preferences"
        echo "  - activity_feed"
        echo "  - badges"
        echo ""
        echo "Next step: Register chainhooks"
        echo "  railway run npm run setup:chainhooks testnet"
    else
        echo ""
        echo "❌ Failed to execute schema"
        exit 1
    fi
else
    echo "❌ psql not found. Please install PostgreSQL client:"
    echo ""
    echo "macOS: brew install postgresql"
    echo "Ubuntu: sudo apt-get install postgresql-client"
    echo ""
    echo "Or manually execute the SQL in Railway dashboard:"
    echo "1. Go to PostgreSQL service → Data tab"
    echo "2. Open SQL editor"
    echo "3. Copy contents of backend/src/db/schema.sql"
    echo "4. Execute"
    exit 1
fi

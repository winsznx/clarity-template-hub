#!/bin/bash

# Clarity Template Hub - Environment Setup Script
echo "🚀 Setting up Clarity Template Hub Backend Environment"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

echo "Please provide the following information:"
echo ""

# Get API Key
read -p "Enter your Hiro API Key: " HIRO_API_KEY

# Generate webhook secret
WEBHOOK_SECRET=$(openssl rand -hex 32)
echo "Generated webhook secret: $WEBHOOK_SECRET"

# Get backend URL (for local testing, use ngrok or similar)
read -p "Enter your backend URL (e.g., https://your-domain.com or http://localhost:3001 for local): " BACKEND_URL

# Database choice
echo ""
echo "Choose database option:"
echo "1) Supabase (recommended for production)"
echo "2) Local PostgreSQL (for development)"
read -p "Enter choice (1 or 2): " DB_CHOICE

if [ "$DB_CHOICE" = "1" ]; then
    read -p "Enter Supabase URL: " SUPABASE_URL
    read -p "Enter Supabase Anon Key: " SUPABASE_ANON_KEY
    read -p "Enter Supabase Service Key: " SUPABASE_SERVICE_KEY
    
    # Update .env with Supabase
    sed -i '' "s|CHAINHOOKS_API_KEY=.*|CHAINHOOKS_API_KEY=$HIRO_API_KEY|" .env
    sed -i '' "s|BACKEND_URL=.*|BACKEND_URL=$BACKEND_URL|" .env
    sed -i '' "s|WEBHOOK_SECRET=.*|WEBHOOK_SECRET=$WEBHOOK_SECRET|" .env
    sed -i '' "s|SUPABASE_URL=.*|SUPABASE_URL=$SUPABASE_URL|" .env
    sed -i '' "s|SUPABASE_ANON_KEY=.*|SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY|" .env
    sed -i '' "s|SUPABASE_SERVICE_KEY=.*|SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY|" .env
else
    read -p "Enter PostgreSQL DATABASE_URL: " DATABASE_URL
    
    # Update .env with PostgreSQL
    sed -i '' "s|CHAINHOOKS_API_KEY=.*|CHAINHOOKS_API_KEY=$HIRO_API_KEY|" .env
    sed -i '' "s|BACKEND_URL=.*|BACKEND_URL=$BACKEND_URL|" .env
    sed -i '' "s|WEBHOOK_SECRET=.*|WEBHOOK_SECRET=$WEBHOOK_SECRET|" .env
    echo "DATABASE_URL=$DATABASE_URL" >> .env
fi

echo ""
echo "✅ Environment configured!"
echo ""
echo "Next steps:"
echo "1. Run 'npm run setup:db' to set up the database"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Run 'npm run setup:chainhooks testnet' to register chainhooks"
echo ""

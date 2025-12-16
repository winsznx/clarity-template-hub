#!/bin/bash

# Railway Deployment Script for Clarity Template Hub Backend

echo "🚀 Deploying Clarity Template Hub Backend to Railway"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Install it first:"
    echo "npm install -g @railway/cli"
    exit 1
fi

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway. Run: railway login"
    exit 1
fi

echo "✅ Railway CLI ready"
echo ""

# Create new service for backend
echo "Creating backend service..."
railway service link --new

# Deploy the code
echo ""
echo "Deploying backend code..."
railway up --detach

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "Next steps:"
echo "1. Get your deployment URL from Railway dashboard"
echo "2. Set environment variables (CHAINHOOKS_API_KEY, BACKEND_URL, etc.)"
echo "3. Run database migrations"
echo "4. Register chainhooks"
echo ""
echo "Visit: https://railway.com/project/b42b95ca-bb29-4b11-9eb4-20deed08752d"

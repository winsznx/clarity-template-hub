#!/bin/bash

# Git Commit Script - Individual commits for each file
# This script commits each new/modified file individually with descriptive messages

echo "🚀 Creating individual commits for all backend files..."
echo ""

# Add .gitignore first if it doesn't exist
if [ ! -f backend/.gitignore ]; then
    git add backend/.gitignore
    git commit -m "chore(backend): add gitignore for node_modules and env files"
fi

# Backend configuration files
git add backend/package.json
git commit -m "feat(backend): add package.json with dependencies for chainhooks integration"

git add backend/tsconfig.json
git commit -m "feat(backend): add TypeScript configuration"

git add backend/.env.example
git commit -m "docs(backend): add environment variables template"

git add backend/railway.json
git commit -m "feat(backend): add Railway deployment configuration"

git add backend/Procfile
git commit -m "feat(backend): add Procfile for Railway"

git add backend/vercel.json
git commit -m "feat(backend): add Vercel serverless configuration (alternative deployment)"

# Database
git add backend/src/db/schema.sql
git commit -m "feat(backend): add PostgreSQL database schema with triggers and indexes"

git add backend/src/db/client.ts
git commit -m "feat(backend): add Supabase database client with typed methods"

# Configuration
git add backend/src/config/env.ts
git commit -m "feat(backend): add environment configuration with Zod validation"

# Chainhooks
git add backend/src/chainhooks/manager.ts
git commit -m "feat(backend): add Chainhooks manager for event monitoring"

# Webhook handlers
git add backend/src/api/webhooks/security.ts
git commit -m "feat(backend): add webhook security middleware"

git add backend/src/api/webhooks/mint.ts
git commit -m "feat(backend): add mint event webhook handler"

git add backend/src/api/webhooks/transfer.ts
git commit -m "feat(backend): add transfer event webhook handler"

git add backend/src/api/webhooks/deployment.ts
git commit -m "feat(backend): add deployment event webhook handler"

# Services
git add backend/src/services/websocket.ts
git commit -m "feat(backend): add WebSocket service for real-time updates"

git add backend/src/services/notifications.ts
git commit -m "feat(backend): add notification service with multi-channel support"

git add backend/src/services/analytics.ts
git commit -m "feat(backend): add analytics service for metrics calculation"

git add backend/src/services/leaderboard.ts
git commit -m "feat(backend): add leaderboard service with ranking algorithms"

git add backend/src/services/template-verification.ts
git commit -m "feat(backend): add template verification service"

# API endpoints
git add backend/src/api/analytics/index.ts
git commit -m "feat(backend): add analytics API endpoints"

git add backend/src/api/leaderboard/index.ts
git commit -m "feat(backend): add leaderboard API endpoints"

git add backend/src/api/activity/index.ts
git commit -m "feat(backend): add activity feed API endpoints"

git add backend/src/api/notifications/index.ts
git commit -m "feat(backend): add notification preferences API endpoints"

# Main server
git add backend/src/index.ts
git commit -m "feat(backend): add Express server with all routes and middleware"

# Scripts
git add backend/src/scripts/setup-chainhooks.ts
git commit -m "feat(backend): add chainhook registration script"

git add backend/src/scripts/setup-database.ts
git commit -m "feat(backend): add database setup script"

# Documentation
git add backend/README.md
git commit -m "docs(backend): add comprehensive README with setup instructions"

git add backend/RAILWAY_DEPLOYMENT.md
git commit -m "docs(backend): add Railway deployment guide"

git add backend/DEPLOY.md
git commit -m "docs(backend): add quick deployment reference"

git add backend/setup-env.sh
git commit -m "feat(backend): add interactive environment setup script"

git add backend/deploy-railway.sh
git commit -m "feat(backend): add Railway deployment automation script"

# Frontend updates
git add frontend/package.json
git commit -m "feat(frontend): add recharts and date-fns dependencies"

git add frontend/.env.example
git commit -m "docs(frontend): update environment variables template"

# Frontend hooks
git add frontend/src/hooks/useWebSocket.ts
git commit -m "feat(frontend): add WebSocket hook with auto-reconnect"

git add frontend/src/hooks/useAnalytics.ts
git commit -m "feat(frontend): add analytics data fetching hook"

# Frontend components
git add frontend/src/components/ActivityFeed.tsx
git commit -m "feat(frontend): add real-time activity feed component"

git add frontend/src/components/AnalyticsDashboard.tsx
git commit -m "feat(frontend): add analytics dashboard component"

git add frontend/src/components/Leaderboard.tsx
git commit -m "feat(frontend): add leaderboard component with rankings"

# Root documentation
git add QUICKSTART.md
git commit -m "docs: add quick start guide for local development"

echo ""
echo "✅ All commits created successfully!"
echo ""
echo "Next steps:"
echo "1. Review commits: git log --oneline -20"
echo "2. Push to GitHub: git push origin main"
echo "3. Railway will auto-deploy from GitHub"

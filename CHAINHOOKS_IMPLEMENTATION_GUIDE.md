# Complete Chainhooks Implementation Guide

## Overview
This guide covers the **correct** way to implement Hiro Chainhooks for NFT minting events, based on real-world debugging and implementation.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Understanding the Payload Structure](#understanding-the-payload-structure)
3. [Backend Setup](#backend-setup)
4. [Common Mistakes & Solutions](#common-mistakes--solutions)
5. [Testing & Debugging](#testing--debugging)
6. [Production Checklist](#production-checklist)

---

## Prerequisites

### Required Accounts & Services
- **Hiro Platform Account**: https://platform.hiro.so
- **Railway Account**: For hosting (or any Node.js hosting)
- **PostgreSQL Database**: For data persistence

### Required Packages
```json
{
  "@hirosystems/chainhooks-client": "^1.0.0",
  "express": "^4.18.2",
  "pg": "^8.11.3",
  "@types/pg": "^8.10.9"
}
```

---

## Understanding the Payload Structure

### ⚠️ CRITICAL: The Actual Payload Format

**WRONG ASSUMPTION:**
```typescript
// ❌ This is NOT how Hiro sends NFT mint events
{
  type: 'NFTMintEvent',
  nft_id: '...',
  recipient: '...'
}
```

**ACTUAL PAYLOAD:**
```typescript
// ✅ This is the REAL structure from Hiro Chainhooks
{
  "apply": [
    {
      "block_identifier": {
        "index": 5353326,
        "hash": "0x..."
      },
      "timestamp": 1765988314,
      "transactions": [
        {
          "transaction_identifier": {
            "hash": "0x9077f0a3..."
          },
          "operations": [
            {
              "type": "DEBIT",  // STX payment
              "account": { "address": "SP2V5V6X..." },
              "amount": { "value": 100000, "currency": { "symbol": "STX" } }
            },
            {
              "type": "CREDIT",  // ⭐ THIS IS THE NFT MINT!
              "account": { "address": "SP2V5V6X..." },
              "amount": {
                "value": 1,
                "currency": {
                  "symbol": "SP31DP8F8CF2GXSZBHHHK5J6Y061744E1TNFGYWYV.template-access-nft-v2::access-template",
                  "decimals": 0,
                  "metadata": {
                    "asset_class_identifier": "SP31DP8F8CF2GXSZBHHHK5J6Y061744E1TNFGYWYV.template-access-nft-v2::access-template",
                    "asset_identifier": "0x010000000000000000000000000000001f",  // ⭐ Template ID in hex!
                    "standard": "SIP09"
                  }
                }
              },
              "operation_identifier": { "index": 2 },
              "status": "SUCCESS",
              "type": "CREDIT"
            }
          ],
          "metadata": {
            "success": true,
            "result": "0x0703",
            "sender": "SP3XGBWWBCWP5HE42QCB7A6PF1XNTB3BZTN8N4M7K",
            "fee": "0.003 STX"
          }
        }
      ],
      "metadata": {}
    }
  ],
  "rollback": [],
  "chainhook": {
    "uuid": "...",
    "predicate": { ... }
  }
}
```

### Key Insights

1. **NFT mints appear as `CREDIT` operations**, NOT as a special `NFTMintEvent` type
2. **Template ID is in hex format** in `asset_identifier` (e.g., `0x...001f` = template 31)
3. **Multiple operations per transaction**: DEBIT (payment) + CREDIT (NFT mint)
4. **Metadata is nested** deeply in `amount.currency.metadata`

---

## Backend Setup

### 1. Environment Configuration

```typescript
// config/env.ts
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  CHAINHOOKS_API_KEY: z.string(),
  BACKEND_URL: z.string().url(),
  WEBHOOK_SECRET: z.string().optional(),
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
})

export const config = {
  database: {
    url: process.env.DATABASE_URL!,
  },
  chainhooks: {
    apiKey: process.env.CHAINHOOKS_API_KEY!,
  },
  server: {
    port: parseInt(process.env.PORT || '3001'),
    url: process.env.BACKEND_URL!,
  },
}
```

### 2. Database Schema

```sql
-- schema.sql
CREATE TABLE IF NOT EXISTS mints (
    id SERIAL PRIMARY KEY,
    tx_id TEXT NOT NULL UNIQUE,
    user_address TEXT NOT NULL,
    template_id INTEGER NOT NULL,
    block_height INTEGER NOT NULL,
    timestamp BIGINT NOT NULL,
    network TEXT NOT NULL DEFAULT 'mainnet',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_feed (
    id SERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    user_address TEXT NOT NULL,
    template_id INTEGER,
    contract_identifier TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mints_user ON mints(user_address);
CREATE INDEX idx_mints_template ON mints(template_id);
CREATE INDEX idx_activity_user ON activity_feed(user_address);
```

### 3. Database Client

```typescript
// db/railway-client.ts
import { Pool } from 'pg'
import { config } from '../config/env.js'

export interface Mint {
  tx_id: string
  user_address: string
  template_id: number
  block_height: number
  timestamp: number
  network: string
}

export interface ActivityFeedEvent {
  event_type: 'mint' | 'transfer' | 'deployment'
  user_address: string
  template_id?: number
  contract_identifier?: string
}

export class RailwayDatabaseClient {
  private pool: Pool

  constructor() {
    this.pool = new Pool({
      connectionString: config.database.url,
      ssl: { rejectUnauthorized: false }
    })
  }

  async insertMint(mint: Mint): Promise<void> {
    const query = `
      INSERT INTO mints (tx_id, user_address, template_id, block_height, timestamp, network)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (tx_id) DO NOTHING
    `
    await this.pool.query(query, [
      mint.tx_id,
      mint.user_address,
      mint.template_id,
      mint.block_height,
      mint.timestamp,
      mint.network
    ])
  }

  async insertActivityEvent(event: ActivityFeedEvent): Promise<void> {
    const query = `
      INSERT INTO activity_feed (event_type, user_address, template_id, contract_identifier)
      VALUES ($1, $2, $3, $4)
    `
    await this.pool.query(query, [
      event.event_type,
      event.user_address,
      event.template_id,
      event.contract_identifier
    ])
  }

  async getRecentActivity(limit: number = 50): Promise<any[]> {
    const query = `
      SELECT * FROM activity_feed 
      ORDER BY created_at DESC 
      LIMIT $1
    `
    const result = await this.pool.query(query, [limit])
    return result.rows
  }
}

export const db = new RailwayDatabaseClient()
```

### 4. Webhook Handler (THE MOST IMPORTANT PART!)

```typescript
// api/webhooks/mint.ts
import { Request, Response } from 'express'
import { db } from '../../db/railway-client.js'

export async function handleMintWebhook(req: Request, res: Response): Promise<void> {
  try {
    console.log('🔍 ===== MINT WEBHOOK RECEIVED =====')
    console.log('Headers:', JSON.stringify(req.headers, null, 2))
    console.log('Body:', JSON.stringify(req.body, null, 2))

    const payload = req.body

    // Validate payload structure
    if (!payload.apply || !Array.isArray(payload.apply)) {
      console.log('⚠️  Invalid payload: missing apply array')
      return res.status(400).json({ error: 'Invalid payload structure' })
    }

    console.log(`📥 Processing ${payload.apply.length} block(s) from chainhook`)

    // Process each block
    for (const block of payload.apply) {
      const blockHeight = block.block_identifier?.index
      const timestamp = block.timestamp
      const transactions = block.transactions || []

      console.log(`📦 Block ${blockHeight}, ${transactions.length} transactions`)

      // Process each transaction
      for (const tx of transactions) {
        const txId = tx.transaction_identifier?.hash
        const operations = tx.operations || []
        const success = tx.metadata?.success

        console.log(`🔍 TX ${txId?.slice(0, 12)}... success=${success}, ops=${operations.length}`)

        if (!success) {
          console.log('⚠️  Skipping failed transaction')
          continue
        }

        // ⭐ CRITICAL: Filter for CREDIT operations with NFT metadata
        const mintOps = operations.filter(op => 
          op.type === 'CREDIT' && 
          op.amount?.currency?.metadata?.asset_class_identifier?.includes('template-access-nft')
        )

        console.log(`🎯 Found ${mintOps.length} NFT mint operations`)

        for (const op of mintOps) {
          console.log(`🔎 Processing mint op:`, JSON.stringify(op, null, 2))

          if (!op.amount?.currency?.metadata?.asset_identifier) {
            console.log(`⚠️  Missing asset_identifier, skipping`)
            continue
          }

          // ⭐ CRITICAL: Parse template ID from hex
          // Format: "0x010000000000000000000000000000001f" where last byte (1f) = template 31
          const assetIdHex = op.amount.currency.metadata.asset_identifier
          const templateId = parseInt(assetIdHex.slice(-2), 16)  // Last 2 hex chars = 1 byte
          console.log(`🎨 Parsed template ID: ${templateId} from ${assetIdHex}`)

          const userAddress = op.account?.address
          if (!userAddress) {
            console.log(`⚠️  Missing user address, skipping`)
            continue
          }

          console.log(`💾 Attempting to save mint: user=${userAddress}, template=${templateId}, tx=${txId}`)

          try {
            // Save to database
            await db.insertMint({
              tx_id: txId,
              user_address: userAddress,
              template_id: templateId,
              block_height: blockHeight,
              timestamp: timestamp,
              network: 'mainnet'
            })
            console.log(`✅ Mint saved to DB`)

            // Save activity event
            await db.insertActivityEvent({
              event_type: 'mint',
              user_address: userAddress,
              template_id: templateId
            })
            console.log(`✅ Activity saved to DB`)

          } catch (dbError: any) {
            console.error(`❌ Error saving mint event:`, dbError.message)
            console.error('Error details:', {
              name: dbError.name,
              message: dbError.message,
              stack: dbError.stack,
              code: dbError.code
            })
          }
        }
      }
    }

    console.log('🔍 ===== END WEBHOOK =====')
    res.status(200).json({ success: true, message: 'Webhook processed' })

  } catch (error) {
    console.error('❌ Webhook error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
```

### 5. Chainhooks Registration

```typescript
// chainhooks/manager.ts
import { ChainhooksClient } from '@hirosystems/chainhooks-client'
import { config } from '../config/env.js'

const platformBaseUrl = 'https://api.platform.hiro.so/v1/ext'

export const chainhooksClient = new ChainhooksClient({
  baseUrl: `${platformBaseUrl}/${config.chainhooks.apiKey}`,
  // ⚠️ DO NOT add 'network' property - it's invalid!
})

export async function registerMintChainhook() {
  const chainhook = {
    name: 'nft-mint-tracker',
    version: 1,
    chain: 'stacks',
    networks: {
      mainnet: {
        if_this: {
          scope: 'contract_call',
          contract_identifier: 'SP31DP8F8CF2GXSZBHHHK5J6Y061744E1TNFGYWYV.template-access-nft-v2',
          method: 'mint'
        },
        then_that: {
          http_post: {
            url: `${config.server.url}/api/webhooks/mint`,
            authorization_header: `Bearer ${config.chainhooks.apiKey}`
          }
        },
        start_block: 5350000  // Start from recent block
      }
    }
  }

  try {
    const result = await chainhooksClient.createChainhook(chainhook)
    console.log('✅ Chainhook registered:', result)
    return result
  } catch (error) {
    console.error('❌ Failed to register chainhook:', error)
    throw error
  }
}
```

---

## Common Mistakes & Solutions

### ❌ Mistake 1: Wrong Operation Type Filter
```typescript
// WRONG
const mintOps = tx.operations.filter(op => op.type === 'NFTMintEvent')

// CORRECT
const mintOps = tx.operations.filter(op => 
  op.type === 'CREDIT' && 
  op.amount?.currency?.metadata?.asset_class_identifier?.includes('your-nft-contract')
)
```

### ❌ Mistake 2: Wrong Template ID Parsing
```typescript
// WRONG - Causes overflow for large hex numbers
const templateId = parseInt(assetIdHex, 16)  // Returns 3.4e+38

// CORRECT - Extract last byte only
const templateId = parseInt(assetIdHex.slice(-2), 16)  // Returns 31
```

### ❌ Mistake 3: Invalid Network Configuration
```typescript
// WRONG
new ChainhooksClient({
  baseUrl: '...',
  network: 'mainnet'  // ❌ This property doesn't exist!
})

// CORRECT
new ChainhooksClient({
  baseUrl: '...'  // ✅ No network property
})
```

### ❌ Mistake 4: Wrong Database URL Fallback
```typescript
// WRONG - Falls back to invalid Supabase URL
url: parsed.data.DATABASE_URL || parsed.data.SUPABASE_URL || ''

// CORRECT - Ensure DATABASE_URL is set in Railway
url: parsed.data.DATABASE_URL  // Must be set as Variable Reference in Railway
```

### ❌ Mistake 5: Missing Error Handling
```typescript
// WRONG - Silent failures
await db.insertMint(mint)

// CORRECT - Log errors
try {
  await db.insertMint(mint)
  console.log('✅ Mint saved')
} catch (error) {
  console.error('❌ Error saving mint:', error)
  console.error('Error details:', {
    message: error.message,
    code: error.code,
    stack: error.stack
  })
}
```

---

## Testing & Debugging

### 1. Enable Detailed Logging
```typescript
// Log EVERYTHING during development
console.log('🔍 ===== WEBHOOK RECEIVED =====')
console.log('Headers:', JSON.stringify(req.headers, null, 2))
console.log('Body:', JSON.stringify(req.body, null, 2))
console.log('📥 Processing blocks:', payload.apply.length)
console.log('📦 Block height:', blockHeight)
console.log('🔍 TX:', txId)
console.log('📋 All operations:', operations.map(op => ({ 
  type: op.type, 
  hasAmount: !!op.amount 
})))
console.log('🎯 Found mint operations:', mintOps.length)
console.log('🔎 Processing mint op:', JSON.stringify(op, null, 2))
console.log('🎨 Parsed template ID:', templateId, 'from', assetIdHex)
console.log('💾 Attempting to save:', { user, template, tx })
console.log('✅ Saved successfully')
console.log('🔍 ===== END WEBHOOK =====')
```

### 2. Test with Railway Logs
```bash
# Monitor logs in real-time
railway logs --service your-service-name

# Filter for webhook events
railway logs --service your-service-name | grep -E "(webhook|mint|CREDIT)"
```

### 3. Verify Database
```sql
-- Check if data is being saved
SELECT * FROM mints ORDER BY created_at DESC LIMIT 10;

-- Check activity feed
SELECT * FROM activity_feed ORDER BY created_at DESC LIMIT 10;

-- Count mints per template
SELECT template_id, COUNT(*) as mint_count 
FROM mints 
GROUP BY template_id 
ORDER BY mint_count DESC;
```

### 4. Test Transaction Flow
1. **Mint an NFT** on mainnet
2. **Check Hiro Platform** - Should show webhook delivery
3. **Check Railway logs** - Should show webhook received and processed
4. **Check database** - Should have new row in `mints` table
5. **Check explorer** - Verify transaction succeeded on-chain

---

## Production Checklist

### Environment Variables (Railway)
- [ ] `DATABASE_URL` - Set as **Variable Reference** to PostgreSQL
- [ ] `CHAINHOOKS_API_KEY` - From Hiro Platform
- [ ] `BACKEND_URL` - Your Railway app URL
- [ ] `WEBHOOK_SECRET` - Random secure string (optional)
- [ ] `PORT` - 3001 (or Railway's PORT)
- [ ] `NODE_ENV` - production

### Database
- [ ] Schema created (`mints`, `activity_feed` tables)
- [ ] Indexes created for performance
- [ ] Connection pooling configured
- [ ] SSL enabled for production

### Chainhooks
- [ ] Registered on Hiro Platform
- [ ] Correct contract identifier
- [ ] Correct method name (`mint`)
- [ ] Webhook URL is publicly accessible
- [ ] Start block set appropriately
- [ ] Network set to `mainnet` or `testnet`

### Backend
- [ ] Webhook endpoint deployed and accessible
- [ ] Error handling implemented
- [ ] Logging enabled
- [ ] Database client properly configured
- [ ] Template ID parsing correct (last byte only)
- [ ] Operation type filter correct (`CREDIT` not `NFTMintEvent`)

### Testing
- [ ] Webhook receives payloads
- [ ] Payloads are parsed correctly
- [ ] Template IDs extracted correctly
- [ ] Data saves to database
- [ ] Activity feed updates
- [ ] Errors are logged
- [ ] Failed transactions are skipped

---

## Deployment Steps

### 1. Railway Setup
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Set environment variables
railway variables set DATABASE_URL=$POSTGRES_URL
railway variables set CHAINHOOKS_API_KEY=your-key
railway variables set BACKEND_URL=https://your-app.up.railway.app

# Deploy
git push origin master  # Railway auto-deploys
```

### 2. Database Setup
```bash
# Connect to Railway PostgreSQL
railway connect postgres

# Run schema
\i backend/src/db/schema.sql

# Verify tables
\dt
```

### 3. Register Chainhook
```bash
# Option 1: Via code (recommended)
# Add to your index.ts:
import { registerMintChainhook } from './chainhooks/manager.js'
await registerMintChainhook()

# Option 2: Via Hiro Platform UI
# Go to platform.hiro.so and create manually
```

### 4. Verify Deployment
```bash
# Check health
curl https://your-app.up.railway.app/health

# Check logs
railway logs --service your-service

# Mint a test NFT and verify
```

---

## Troubleshooting

### Issue: Webhook not receiving payloads
**Solution:**
- Check Hiro Platform - verify chainhook is active
- Check Railway logs - ensure app is running
- Verify webhook URL is publicly accessible
- Check authorization header matches

### Issue: Template ID parsing wrong
**Solution:**
```typescript
// Use slice(-2) to get last byte only
const templateId = parseInt(assetIdHex.slice(-2), 16)
```

### Issue: Database connection fails
**Solution:**
- Verify `DATABASE_URL` is set as Variable Reference in Railway
- Check SSL is enabled: `ssl: { rejectUnauthorized: false }`
- Test connection: `await pool.query('SELECT NOW()')`

### Issue: Operations array empty
**Solution:**
- Check contract identifier matches exactly
- Verify method name is correct
- Check start_block is not too far in past
- Ensure transaction succeeded (`metadata.success === true`)

---

## Example: Complete Working Implementation

See the full implementation in:
- `/backend/src/api/webhooks/mint.ts` - Webhook handler
- `/backend/src/db/railway-client.ts` - Database client
- `/backend/src/chainhooks/manager.ts` - Chainhooks registration
- `/backend/src/config/env.ts` - Environment config

**Key Success Metrics:**
- ✅ Webhook receives payloads from Hiro
- ✅ Template IDs parsed correctly (31 not 3.4e+38)
- ✅ Data saves to PostgreSQL
- ✅ Activity feed updates
- ✅ No crashes or silent failures

---

## Summary

**The 3 Most Important Things:**

1. **NFT mints are `CREDIT` operations**, not `NFTMintEvent`
2. **Template ID is the last byte** of `asset_identifier` hex string
3. **Log everything** during development to understand the payload structure

**Common Pitfalls:**
- Assuming payload structure without logging it first
- Using `parseInt(fullHex, 16)` instead of `parseInt(hex.slice(-2), 16)`
- Not handling errors properly
- Wrong database URL configuration
- Invalid ChainhooksClient configuration

**Success Formula:**
```
Detailed Logging + Correct Parsing + Error Handling + Database Persistence = Working Chainhooks
```

---

**Last Updated:** 2025-12-18  
**Status:** Production-Ready ✅

# Railway Deployment Fix

## Issue
Railway is looking for code in the root directory, but our backend is in `/backend`.

## Solution

### Option 1: Set Root Directory in Railway Dashboard (Recommended)

1. Go to Railway dashboard → "precious-ambition" service
2. Click **Settings** → **Source**
3. Under **Root Directory**, enter: `backend`
4. Click **Save**
5. Trigger a new deployment

### Option 2: Set via Railway CLI

```bash
cd backend
railway service
# Select "precious-ambition"

# Set the root directory
railway variables --set "RAILWAY_ROOT_DIRECTORY=backend"

# Or use Railway dashboard to set root directory in Settings → Source
```

### Option 3: Move railway.json to Root (Not Recommended)

This would require restructuring the project, which we don't want.

## Verification

After setting the root directory, Railway should:
1. ✅ Find `railway.json` in the backend folder
2. ✅ Find `package.json` with the "start" script
3. ✅ Run `npm install && npm run build`
4. ✅ Start with `node dist/index.js`

## Next Steps

1. Set root directory to `backend` in Railway dashboard
2. Trigger redeploy
3. Check logs for successful build
4. Set environment variables
5. Test the deployed API

## Current Railway Configuration

The `railway.json` in `/backend` is correctly configured:
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "node dist/index.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Railway just needs to know to look in the `/backend` directory!

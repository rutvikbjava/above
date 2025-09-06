# Vercel Deployment Guide

## Issue Resolution for 404 Asset Errors

The 404 errors you're experiencing (`Failed to load resource: the server responded with a status of 404`) are typically caused by:

1. **Stale build cache on Vercel**
2. **Missing Vercel configuration**
3. **Asset path mismatches**

## Solution Applied

### 1. Created `vercel.json` Configuration
- Proper SPA routing with catch-all rewrites
- Static asset caching headers
- Framework detection for Vite

### 2. Updated Vite Configuration
- Consistent asset naming patterns
- Proper output directory structure
- Asset directory configuration

### 3. Added `.vercelignore`
- Prevents deployment of unnecessary files
- Ensures clean builds

## Deployment Steps

### Step 1: Commit Changes
```bash
git add .
git commit -m "Fix Vercel deployment: Add vercel.json config and update build settings"
git push origin main
```

### Step 2: Force Rebuild on Vercel
1. Go to your Vercel dashboard
2. Navigate to your project
3. Go to "Deployments" tab
4. Click "..." menu on the latest deployment
5. Select "Redeploy"
6. **IMPORTANT**: Check "Use existing Build Cache" and **UNCHECK IT** to force a fresh build

### Step 3: Set Environment Variables
Make sure these environment variables are set in Vercel Dashboard:
- `VITE_CONVEX_URL` - Your Convex deployment URL
- `NODE_ENV` - Set to "production"
- Any other environment variables your app needs

### Step 4: Verify Build Settings
In Vercel project settings:
- **Build Command**: `npm run build` (or leave empty to use package.json)
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Framework Preset**: `Vite`

## Troubleshooting

### If 404 Errors Persist:
1. **Clear Browser Cache**: Hard refresh (Ctrl+F5) or open in incognito
2. **Check Vercel Function Logs**: Look for any server-side errors
3. **Verify Asset Paths**: Ensure all assets are in `/assets/` directory
4. **Force Redeploy**: Delete the deployment and redeploy fresh

### Common Issues:
- **Environment Variables**: Missing `VITE_CONVEX_URL`
- **Build Cache**: Old cached builds with different asset hashes
- **Browser Cache**: Old cached assets in user's browser

## Files Created/Modified:
- ✅ `vercel.json` - Vercel deployment configuration
- ✅ `.vercelignore` - Files to ignore during deployment
- ✅ `vite.config.ts` - Updated with proper asset handling
- ✅ `package.json` - Added vercel-build script

## Expected Result:
After following these steps, your assets should load correctly:
- `/assets/index-[hash].js` should load successfully
- `/assets/index-[hash].css` should load successfully
- SPA routing should work properly (no 404 on page refresh)

## Verification:
1. Check browser network tab - no 404 errors
2. Application loads and functions correctly
3. Page refresh works on any route
# Vercel Deployment Fixes

## Issues Fixed

### 1. Vite Command Not Found Error
**Problem**: The build was failing with `sh: line 1: vite: command not found`

**Root Cause**: Vite was listed as a devDependency, but Vercel's production build doesn't install devDependencies by default.

**Solution**: 
- Moved essential build dependencies to the `dependencies` section in package.json
- Updated Vercel config to explicitly include dev dependencies during install

### 2. Missing Build Dependencies
**Problem**: Build tools like TypeScript, Tailwind CSS, and PostCSS were not available during build

**Solution**: Moved critical build dependencies from devDependencies to dependencies:
- `vite: ^6.2.0`
- `@vitejs/plugin-react: ^4.3.4`
- `typescript: ~5.7.2`
- `tailwindcss: ~3`
- `autoprefixer: ~10`
- `postcss: ~8`

### 3. Environment Variables Required
**Required Environment Variables for Vercel Dashboard**:
- `VITE_CONVEX_URL`: Your Convex deployment URL
- `CONVEX_SITE_URL`: Your site URL for Convex auth
- `NODE_ENV`: Set to "production"

## Updated Files

### package.json
- Moved build dependencies from devDependencies to dependencies
- Kept only development-specific tools in devDependencies

### vercel.json
- Updated install command to include dev dependencies: `npm install --include=dev`
- Added NODE_ENV environment variable
- Maintained proper rewrites for SPA routing

## Deployment Steps

1. **Set Environment Variables in Vercel Dashboard**:
   ```
   VITE_CONVEX_URL=https://your-convex-deployment.convex.cloud
   CONVEX_SITE_URL=https://your-vercel-app.vercel.app
   NODE_ENV=production
   ```

2. **Push Changes to Repository**:
   ```bash
   git add .
   git commit -m "Fix Vercel deployment issues"
   git push origin main
   ```

3. **Redeploy on Vercel**:
   - Vercel will automatically redeploy when you push to main
   - Or manually trigger redeploy from Vercel dashboard

## Verification

After deployment, verify:
- [ ] Build completes successfully
- [ ] Vite command is found during build
- [ ] All dependencies are installed correctly
- [ ] Environment variables are properly set
- [ ] Application loads without errors

## Common Issues

1. **If build still fails**: Check that all environment variables are set in Vercel dashboard
2. **If app shows blank page**: Verify VITE_CONVEX_URL is correctly set
3. **If routing doesn't work**: Ensure vercel.json rewrites are in place

## Additional Notes

- The `.vercelignore` file helps optimize deployment by excluding unnecessary files
- SPA routing is handled by rewrites configuration
- Static assets are properly cached with appropriate headers
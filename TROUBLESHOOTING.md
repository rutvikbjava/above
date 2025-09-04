# 🔧 Troubleshooting Guide

## Quick Fix for Your Current Issue

The error you encountered was due to:
1. **Node.js version mismatch** - React Router requires Node 20+
2. **Missing dev dependencies** - TypeScript wasn't available for build
3. **Incorrect ngrok config** - Auth token format was wrong

### ✅ Fixed Issues:
- ✅ Updated Dockerfile to use Node.js 20
- ✅ Install dev dependencies for build, then remove them
- ✅ Fixed ngrok.yml configuration format
- ✅ Removed deprecated docker-compose version

## 🚀 Quick Deployment

**Option 1: Use the Fix Script**
```bash
fix-and-deploy.bat
```

**Option 2: Manual Steps**
```bash
# Make sure Docker Desktop is running first!

# Stop any existing containers
docker compose down

# Clean up
docker system prune -f

# Build and start
docker compose build --no-cache
docker compose up -d

# Check status
docker compose ps
```

## 🔍 Common Issues & Solutions

### 1. "docker: command not found"
**Problem**: Docker not in PATH
**Solution**: 
- Make sure Docker Desktop is running
- Use the `fix-and-deploy.bat` script which adds Docker to PATH

### 2. "tsc: not found" (Your original error)
**Problem**: TypeScript not available during build
**Solution**: ✅ Fixed in new Dockerfile - now installs all dependencies for build

### 3. "Unsupported engine" warnings
**Problem**: React Router requires Node 20+
**Solution**: ✅ Fixed - updated to Node.js 20

### 4. Ngrok not starting
**Problem**: Invalid auth token format
**Solution**: ✅ Fixed ngrok.yml format

### 5. Port already in use
**Problem**: Another service using port 3000 or 4040
**Solution**:
```bash
# Find what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :4040

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

## 📊 Checking Status

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f event-center
docker compose logs -f ngrok
```

### Check Running Containers
```bash
docker compose ps
```

### Get Ngrok URL
1. Open http://localhost:4040
2. Look for the HTTPS tunnel URL
3. That's your public URL!

## 🔄 Restart Services

```bash
# Restart everything
docker compose restart

# Restart specific service
docker compose restart event-center
docker compose restart ngrok
```

## 🧹 Clean Reset

If everything is broken:
```bash
# Stop everything
docker compose down

# Remove all containers and images
docker system prune -a -f

# Rebuild from scratch
docker compose build --no-cache
docker compose up -d
```

## 🆘 Still Having Issues?

1. **Check Docker Desktop is running**
2. **Make sure ports 3000 and 4040 are free**
3. **Verify your ngrok auth token is correct**
4. **Check the logs**: `docker compose logs -f`

## 📞 Quick Commands Reference

```bash
# Deploy
fix-and-deploy.bat

# Stop
docker compose down

# View logs
docker compose logs -f

# Restart
docker compose restart

# Clean rebuild
docker compose build --no-cache && docker compose up -d

# Get status
docker compose ps
```
# 🚀 Complete Docker + Ngrok Deployment Guide

## 📋 Prerequisites

1. **Docker Desktop** - Download and install from [docker.com](https://www.docker.com/products/docker-desktop/)
2. **Ngrok Account** - Sign up at [ngrok.com](https://ngrok.com/) (Free tier works)

---

## 🎯 Step-by-Step Deployment

### **Step 1: Get Your Ngrok Auth Token**

1. Go to [ngrok dashboard](https://dashboard.ngrok.com/get-started/your-authtoken)
2. Copy your auth token (looks like: `32ArKXmRqr7MiG9F6rqmHoWouzm_7vTRqBsXP8vbtUvA8Po1z`)
3. Keep it handy for the next step

### **Step 2: Configure Ngrok**

Open `ngrok.yml` in your project folder and update it:

```yaml
version: "2"
authtoken: YOUR_NGROK_AUTH_TOKEN_HERE  # Replace with your actual token
tunnels:
  event-center:
    addr: event-center:3000
    proto: http
    inspect: false
web_addr: 0.0.0.0:4040
```

**Replace `YOUR_NGROK_AUTH_TOKEN_HERE` with your actual token from Step 1**

### **Step 3: Configure Environment**

Update `.env.production` with your Convex details:

```env
# Convex Configuration
CONVEX_DEPLOY_KEY=your-convex-deploy-key
VITE_CONVEX_URL=https://your-convex-deployment.convex.cloud

# Application Configuration
NODE_ENV=production
PORT=3000
```

### **Step 4: Start Docker Desktop**

1. Open Docker Desktop application
2. Wait for it to fully start (Docker icon should be green)
3. Make sure it shows "Docker Desktop is running"

### **Step 5: Deploy Your Application**

Open Command Prompt in your project folder and run:

```bash
# Method 1: Use the automated script
fix-and-deploy.bat

# Method 2: Manual deployment
docker compose build --no-cache
docker compose up -d
```

### **Step 6: Verify Deployment**

Check if both containers are running:

```bash
docker compose ps
```

You should see output like:
```
NAME                              IMAGE                           STATUS         PORTS
event_center_og1-event-center-1   event_center_og1-event-center   Up 4 minutes   0.0.0.0:3000->3000/tcp
event_center_og1-ngrok-1          ngrok/ngrok:latest              Up 4 minutes   0.0.0.0:4040->4040/tcp
```

### **Step 7: Get Your Public URL**

**Option A: Use PowerShell Script**
```powershell
try { 
    $response = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -Method Get
    $tunnel = $response.tunnels | Where-Object { $_.proto -eq "https" } | Select-Object -First 1
    if ($tunnel) { 
        Write-Host "🎉 Your public URL is: $($tunnel.public_url)" 
    } else { 
        Write-Host "❌ No HTTPS tunnel found. Check http://localhost:4040 manually" 
    } 
} catch { 
    Write-Host "❌ Could not connect to ngrok API. Open http://localhost:4040 manually" 
}
```

**Option B: Manual Check**
1. Open http://localhost:4040 in your browser
2. Look for the "Forwarding" section
3. Copy the HTTPS URL (like `https://abc123.ngrok-free.app`)

---

## ✅ Success Verification

### **Your URLs Should Be:**
- **Local App**: http://localhost:3000 ✅
- **Ngrok Dashboard**: http://localhost:4040 ✅
- **Public URL**: https://your-unique-id.ngrok-free.app ✅

### **Test Your Deployment:**
1. Open your public URL in a browser
2. Verify your Event Center loads correctly
3. Test registration functionality
4. Check Convex database integration

---

## 🔗 Integration with Existing Website

### **Method 1: Direct Link**
```html
<a href="https://your-ngrok-url.ngrok-free.app" target="_blank" class="btn btn-primary">
    🚀 Register for Technical Events
</a>
```

### **Method 2: Navigation Menu**
```html
<nav>
    <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="https://your-ngrok-url.ngrok-free.app">Events</a></li>
        <li><a href="/contact">Contact</a></li>
    </ul>
</nav>
```

### **Method 3: Iframe Embed**
```html
<div class="events-section">
    <h2>Event Registration</h2>
    <iframe 
        src="https://your-ngrok-url.ngrok-free.app" 
        width="100%" 
        height="800px" 
        frameborder="0"
        style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    </iframe>
</div>
```

---

## 🛠️ Management Commands

### **Start/Stop Services**
```bash
# Start
docker compose up -d

# Stop
docker compose down

# Restart
docker compose restart
```

### **View Logs**
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f event-center
docker compose logs -f ngrok
```

### **Check Status**
```bash
docker compose ps
```

### **Clean Rebuild**
```bash
docker compose down
docker system prune -f
docker compose build --no-cache
docker compose up -d
```

---

## 🔧 Troubleshooting

### **Common Issues & Solutions**

#### **1. "docker: command not found"**
- **Solution**: Make sure Docker Desktop is running
- **Alternative**: Use full path: `"C:\Program Files\Docker\Docker\resources\bin\docker"`

#### **2. "tsc: not found" during build**
- **Solution**: ✅ Fixed in Dockerfile - uses Node.js 20 and installs dev dependencies

#### **3. No ngrok tunnel showing**
- **Check**: Verify auth token in `ngrok.yml`
- **Check**: Open http://localhost:4040
- **Fix**: Restart ngrok: `docker compose restart ngrok`

#### **4. Port already in use**
```bash
# Find what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :4040

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

#### **5. Convex connection issues**
- **Check**: Update `.env.production` with correct Convex URL
- **Check**: Ensure Convex deployment is active
- **Check**: Verify CORS settings in Convex dashboard

---

## 📊 Monitoring & Analytics

### **Ngrok Dashboard Features**
- **Request Inspector**: See all HTTP requests
- **Replay Requests**: Debug issues
- **Traffic Stats**: Monitor usage
- **Connection Status**: Check tunnel health

### **Docker Monitoring**
```bash
# Container stats
docker stats

# System info
docker system df

# Container details
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
```

---

## 🚀 Production Considerations

### **For Long-term Production Use:**

1. **Upgrade to Ngrok Pro**
   - Custom domains (e.g., `events.yourcompany.com`)
   - Reserved URLs (don't change on restart)
   - Better performance and reliability

2. **Security Enhancements**
   ```yaml
   # In ngrok.yml
   tunnels:
     event-center:
       auth: "username:password"  # Basic auth
       # or
       oauth: "google"  # OAuth protection
   ```

3. **SSL/HTTPS**
   - Ngrok provides HTTPS automatically
   - No additional SSL setup needed

4. **Environment Management**
   ```bash
   # Production environment
   cp .env.production .env.local
   
   # Update with production values
   # CONVEX_DEPLOYMENT=your-prod-deployment
   # VITE_CONVEX_URL=https://your-prod.convex.cloud
   ```

5. **Backup Strategy**
   - Convex handles database backups automatically
   - Export data regularly via Convex dashboard
   - Keep environment files secure

---

## 📞 Quick Reference

### **Essential URLs**
- **Local App**: http://localhost:3000
- **Ngrok Dashboard**: http://localhost:4040
- **Public App**: https://your-unique-id.ngrok-free.app

### **Key Commands**
```bash
# Deploy
docker compose up -d

# Get public URL
# Open http://localhost:4040 or use PowerShell script above

# Stop
docker compose down

# Logs
docker compose logs -f

# Status
docker compose ps
```

### **File Structure**
```
your-project/
├── Dockerfile                 # Container configuration
├── docker-compose.yml        # Multi-container setup
├── ngrok.yml                 # Ngrok tunnel configuration
├── .env.production           # Production environment variables
├── fix-and-deploy.bat        # Automated deployment script
└── COMPLETE-DEPLOYMENT-GUIDE.md  # This guide
```

---

## 🎉 Success Checklist

- [ ] Docker Desktop installed and running
- [ ] Ngrok account created and auth token obtained
- [ ] `ngrok.yml` configured with your auth token
- [ ] `.env.production` updated with Convex details
- [ ] Containers built and running (`docker compose ps`)
- [ ] Ngrok dashboard accessible (http://localhost:4040)
- [ ] Public HTTPS URL obtained and tested
- [ ] Event Center loads correctly on public URL
- [ ] Integration added to existing website

**🚀 Your Event Center is now live and accessible worldwide!**

---

## 📧 Support

If you encounter issues:
1. Check the troubleshooting section above
2. View logs: `docker compose logs -f`
3. Restart services: `docker compose restart`
4. Clean rebuild if needed: `docker compose down && docker compose build --no-cache && docker compose up -d`

**Happy Deploying! 🎯**
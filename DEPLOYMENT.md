# 🚀 Docker + Ngrok Deployment Guide

## Prerequisites

1. **Docker Desktop** - Download from [docker.com](https://www.docker.com/products/docker-desktop/)
2. **Ngrok Account** - Sign up at [ngrok.com](https://ngrok.com/)

## Quick Start

### 1. Setup Ngrok
1. Go to [ngrok dashboard](https://dashboard.ngrok.com/get-started/your-authtoken)
2. Copy your auth token
3. Open `ngrok.yml` and replace `YOUR_NGROK_AUTH_TOKEN_HERE` with your token

### 2. Configure Environment
1. Copy `.env.production` to `.env.local`
2. Update your Convex deployment URL in `.env.local`

### 3. Deploy
**Windows:**
```bash
deploy.bat
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

**Or using npm:**
```bash
npm run docker:deploy
```

## Management Commands

### Start/Stop
```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Restart
docker-compose restart
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f event-center
docker-compose logs -f ngrok
```

### Check Status
```bash
docker-compose ps
```

## URLs

- **Your App**: Check ngrok dashboard at http://localhost:4040
- **Ngrok Dashboard**: http://localhost:4040
- **Local App**: http://localhost:3000

## Troubleshooting

### Common Issues

1. **Docker not running**
   - Start Docker Desktop
   - Wait for it to fully initialize

2. **Ngrok auth token not set**
   - Update `ngrok.yml` with your token from ngrok dashboard

3. **Port already in use**
   - Stop other services using ports 3000 or 4040
   - Or change ports in `docker-compose.yml`

4. **Build fails**
   - Check if all dependencies are installed
   - Run `npm install` locally first

### Logs
```bash
# View all logs
npm run docker:logs

# Or specific service
docker-compose logs event-center
docker-compose logs ngrok
```

## Production Considerations

### For Production Use:
1. **Paid Ngrok Plan** - For custom domains and better reliability
2. **Environment Variables** - Secure your secrets
3. **SSL/HTTPS** - Ngrok provides HTTPS by default
4. **Monitoring** - Add health checks and monitoring
5. **Backup** - Regular database backups via Convex

### Scaling:
```yaml
# In docker-compose.yml
services:
  event-center:
    deploy:
      replicas: 3
    # ... rest of config
```

## Integration with Existing Website

### Method 1: Direct Link
```html
<a href="https://your-ngrok-url.ngrok-free.app">
  🚀 Event Registration
</a>
```

### Method 2: Iframe Embed
```html
<iframe 
  src="https://your-ngrok-url.ngrok-free.app" 
  width="100%" 
  height="800px">
</iframe>
```

### Method 3: Subdomain
With paid ngrok plan, use custom subdomain:
```yaml
# In ngrok.yml
tunnels:
  event-center:
    hostname: events.yourcompany.ngrok.io
```

## Security

- Ngrok URLs are public but hard to guess
- Use HTTPS (provided by ngrok)
- Secure your environment variables
- Consider ngrok's password protection for sensitive deployments

## Support

- **Ngrok Docs**: https://ngrok.com/docs
- **Docker Docs**: https://docs.docker.com/
- **Convex Docs**: https://docs.convex.dev/
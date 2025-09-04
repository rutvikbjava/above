@echo off
echo 🚀 Starting Event Center Deployment...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

REM Check if ngrok auth token is set
findstr "YOUR_NGROK_AUTH_TOKEN_HERE" ngrok.yml >nul
if not errorlevel 1 (
    echo ❌ Please set your ngrok auth token in ngrok.yml
    echo    Get your token from: https://dashboard.ngrok.com/get-started/your-authtoken
    pause
    exit /b 1
)

REM Build and start services
echo 🔨 Building Docker image...
docker-compose build

echo 🌐 Starting services...
docker-compose up -d

echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

echo ✅ Deployment started!
echo 🌍 Check your ngrok URL at: http://localhost:4040
echo 📊 Ngrok dashboard: http://localhost:4040
echo.
echo 📋 Next steps:
echo    1. Open http://localhost:4040 to get your public URL
echo    2. Update your Convex deployment with the new URL
echo    3. Test the application
echo    4. Share the URL with your users

pause
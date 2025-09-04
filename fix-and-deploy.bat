@echo off
echo 🔧 Fixing Docker deployment issues...

REM Check if Docker Desktop is running
echo Checking Docker Desktop...
"C:\Program Files\Docker\Docker\Docker Desktop.exe" --status >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Desktop is not running. Please start Docker Desktop first.
    echo    You can find it in your Start Menu or Desktop
    pause
    exit /b 1
)

REM Add Docker to PATH for this session
set PATH=%PATH%;"C:\Program Files\Docker\Docker\resources\bin"

echo 🛑 Stopping any existing containers...
docker compose down 2>nul

echo 🧹 Cleaning up old images...
docker system prune -f

echo 🔨 Building new image...
docker compose build --no-cache

echo 🚀 Starting services...
docker compose up -d

echo ⏳ Waiting for services to start...
timeout /t 15 /nobreak >nul

echo 🌐 Getting your public URL...
echo.
echo ✅ Deployment complete!
echo.
echo 📊 Open http://localhost:4040 to get your public ngrok URL
echo 🔗 Your Event Center will be available at the HTTPS URL shown in the ngrok dashboard
echo.
echo 📋 Useful commands:
echo    docker compose logs -f     (view logs)
echo    docker compose down        (stop services)
echo    docker compose restart     (restart services)
echo.
pause
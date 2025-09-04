@echo off
echo 📋 Checking Docker logs...
echo.

REM Add Docker to PATH
set PATH=%PATH%;"C:\Program Files\Docker\Docker\resources\bin"

echo 🚀 Event Center App Logs:
echo ================================
docker compose logs --tail=10 event-center
echo.

echo 🌐 Ngrok Tunnel Logs:
echo ================================
docker compose logs --tail=10 ngrok
echo.

echo 📊 Container Status:
echo ================================
docker compose ps
echo.

pause
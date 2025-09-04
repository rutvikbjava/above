@echo off
echo 🌐 Getting your public URL...
echo.

REM Add Docker to PATH
set PATH=%PATH%;"C:\Program Files\Docker\Docker\resources\bin"

echo 📊 Checking container status...
docker compose ps

echo.
echo 🔗 Your ngrok dashboard is at: http://localhost:4040
echo.
echo 📋 To get your public URL:
echo    1. Open http://localhost:4040 in your browser
echo    2. Look for the HTTPS tunnel URL (like https://abc123.ngrok-free.app)
echo    3. That's your public URL!
echo.

REM Try to get the URL programmatically
echo 🔍 Attempting to get URL automatically...
curl -s http://localhost:4040/api/tunnels 2>nul | findstr "public_url" | findstr "https"

echo.
echo 💡 If you don't see a URL above:
echo    - Make sure both containers are running
echo    - Open http://localhost:4040 manually
echo    - Check the ngrok logs: docker compose logs ngrok
echo.
pause
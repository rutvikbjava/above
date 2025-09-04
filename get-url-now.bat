@echo off
echo 🌐 Getting your ngrok public URL...
echo.

echo 📊 Ngrok Status:
docker compose logs --tail=5 ngrok

echo.
echo 🔗 Trying to get URL from ngrok API...
curl -s http://localhost:4040/api/tunnels

echo.
echo 💡 Manual steps:
echo 1. Open: http://localhost:4040
echo 2. Look for "Forwarding" section
echo 3. Copy the HTTPS URL (like https://abc123.ngrok-free.app)
echo.
pause
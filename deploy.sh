#!/bin/bash

echo "🚀 Starting Event Center Deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if ngrok auth token is set
if grep -q "YOUR_NGROK_AUTH_TOKEN_HERE" ngrok.yml; then
    echo "❌ Please set your ngrok auth token in ngrok.yml"
    echo "   Get your token from: https://dashboard.ngrok.com/get-started/your-authtoken"
    exit 1
fi

# Build and start services
echo "🔨 Building Docker image..."
docker-compose build

echo "🌐 Starting services..."
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 10

# Get ngrok URL
echo "🔗 Getting ngrok URL..."
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*' | grep -o 'https://[^"]*' | head -1)

if [ -n "$NGROK_URL" ]; then
    echo "✅ Deployment successful!"
    echo "🌍 Your Event Center is live at: $NGROK_URL"
    echo "📊 Ngrok dashboard: http://localhost:4040"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Update your Convex deployment with the new URL"
    echo "   2. Test the application"
    echo "   3. Share the URL with your users"
else
    echo "❌ Failed to get ngrok URL. Check the logs:"
    docker-compose logs ngrok
fi
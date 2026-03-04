#!/bin/bash

# Video Call Signaling Server Startup Script
echo "🚀 Starting Video Call System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Navigate to backend directory
cd mindVista-Backend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Install WebSocket dependency for signaling server
echo "📦 Installing WebSocket dependency..."
npm install ws

# Start the main backend server
echo "🌐 Starting main backend server..."
npm start &
BACKEND_PID=$!

# Wait a moment for the backend to start
sleep 3

# Start the signaling server
echo "🔌 Starting WebRTC signaling server..."
node signaling-server.js &
SIGNALING_PID=$!

echo "✅ Video Call System started successfully!"
echo ""
echo "📋 Server Information:"
echo "   • Backend Server: http://localhost:3000"
echo "   • Signaling Server: ws://localhost:8080/signaling"
echo "   • Frontend: https://mind-vista-psychology-web-app-dvb3.vercel.app"
echo ""
echo "🧪 Test the video call system:"
echo "   1. Open https://mind-vista-psychology-web-app-dvb3.vercel.app/video-call-test"
echo "   2. Generate a test link"
echo "   3. Open the link in two browser tabs"
echo "   4. Add ?role=doctor to one tab"
echo "   5. Add ?role=patient to the other tab"
echo "   6. Test the video call!"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $SIGNALING_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for processes
wait


#!/bin/bash

# Video Call System Startup Script for Windows
echo "🚀 Starting MindVista Video Call System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Download from: https://nodejs.org/"
    pause
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    pause
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Navigate to backend directory
cd mindVista-Backend

echo "📦 Installing dependencies..."

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

# Install WebSocket dependency for signaling server
echo "Installing WebSocket dependency..."
npm install ws

echo "🌐 Starting main backend server..."
start "Backend Server" cmd /k "npm start"

# Wait a moment for the backend to start
echo "⏳ Waiting for backend to start..."
timeout /t 5 /nobreak > nul

echo "🔌 Starting WebRTC signaling server..."
start "Signaling Server" cmd /k "node signaling-server.js"

echo "⏳ Waiting for signaling server to start..."
timeout /t 3 /nobreak > nul

echo ""
echo "✅ Video Call System started successfully!"
echo ""
echo "📋 Server Information:"
echo "   • Backend Server: http://localhost:3000"
echo "   • Signaling Server: ws://localhost:8080/signaling"
echo "   • Frontend: http://localhost:5173"
echo ""
echo "🧪 Test the video call system:"
echo "   1. Start your frontend: npm run dev (in mindVista-psychology-webApp)"
echo "   2. Go to: http://localhost:5173/video-call-test"
echo "   3. Generate a test link"
echo "   4. Open the link in two browser tabs:"
echo "      - Tab 1: Add ?role=doctor to URL"
echo "      - Tab 2: Add ?role=patient to URL"
echo "   5. Test the video call!"
echo ""
echo "📧 For appointment video calls:"
echo "   1. Approve an appointment in admin panel"
echo "   2. Patient will receive email with video call link"
echo "   3. Doctor joins with admin link"
echo "   4. Patient joins with email link"
echo ""
echo "Press any key to continue..."
pause > nul

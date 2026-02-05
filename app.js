const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');
const { WebSocketServer } = require('ws');
const mongoose = require('mongoose');
require('dotenv').config();
const DatabaseConnection = require('./config/databaseConnection');

const app = express();
const PORT = process.env.PORT || 3000;

// ----------------- MIDDLEWARE -----------------
app.use(cors({ 
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://mind-vista-psychology-web-app-dvb3.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ----------------- ROUTERS -----------------
const NotificationRouter = require('./router/notification');
const ProfileRouter = require('./router/profle');
const AppoinmentRouter = require('./router/appoiment');
const DoctorRouter = require('./router/doctor');
const RefifyUserRouter = require('./router/refifyUser');
const PaymentRouter = require('./router/payment');
const RazorpayRouter = require('./router/razorpayRouter');
const VideoCallLinkRouter = require('./router/videoCallLinkRouter');
const VideoCallStatusRouter = require('./router/videoCallStatus');
const ReviewRouter = require('./router/review');
const DashboardRouter = require('./router/dashboard');

app.use('/api', NotificationRouter);
app.use('/api', ProfileRouter);
app.use('/api', AppoinmentRouter);
app.use('/api', DoctorRouter);
app.use('/api', RefifyUserRouter);
app.use('/api', PaymentRouter);
app.use('/api', RazorpayRouter);
app.use('/api', VideoCallLinkRouter);
app.use('/api', VideoCallStatusRouter);
app.use('/api', ReviewRouter);
app.use('/api/dashboard', DashboardRouter);

// ----------------- HTTP + WS SERVER -----------------
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// ----------------- ROOMS -----------------
// Map<videoCallId, Map<userId, {ws, username}>>
const rooms = new Map();

wss.on('connection', (ws, req) => {
  const urlParams = new URLSearchParams(req.url.replace('/?', ''));
  const videoCallId = urlParams.get('videoCallId') || urlParams.get('roomId');
  const userId = urlParams.get('userId') || `user-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const username = urlParams.get('username') || 'Anonymous';

  if (!videoCallId) {
    ws.close(1008, 'Missing videoCallId parameter');
    return;
  }

  // Initialize room if it doesn't exist
  if (!rooms.has(videoCallId)) {
    rooms.set(videoCallId, new Map());
  }
  
  const room = rooms.get(videoCallId);
  room.set(userId, { ws, username });

  console.log(`🔌 ${username} (${userId}) joined video call ${videoCallId}`);
  console.log(`   Total participants in room: ${room.size}`);

  // Send current room state to the new user
  const participants = Array.from(room.entries())
    .filter(([id]) => id !== userId)
    .map(([id, data]) => ({ userId: id, username: data.username }));

  ws.send(JSON.stringify({
    type: 'room-joined',
    userId,
    participants,
    roomSize: room.size
  }));

  // Notify all other participants that a new user joined
  room.forEach(({ ws: clientWs }, uid) => {
    if (uid !== userId && clientWs.readyState === ws.OPEN) {
      clientWs.send(JSON.stringify({
        type: 'user-joined',
        userId,
        username
      }));
    }
  });

  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);
      console.log(`📨 Message from ${userId}:`, data.type);

      // Handle different message types
      switch (data.type) {
        case 'offer':
        case 'answer':
        case 'ice-candidate':
          // Forward WebRTC signaling to target user
          if (data.target) {
            const targetUser = room.get(data.target);
            if (targetUser && targetUser.ws.readyState === ws.OPEN) {
              targetUser.ws.send(JSON.stringify({
                ...data,
                userId
              }));
              console.log(`  ✅ Forwarded ${data.type} to ${data.target}`);
            } else {
              console.log(`  ❌ Target user ${data.target} not found or disconnected`);
            }
          }
          break;

        case 'chat':
          // Broadcast chat messages to all participants
          room.forEach(({ ws: clientWs }, uid) => {
            if (clientWs.readyState === ws.OPEN) {
              clientWs.send(JSON.stringify({
                type: 'chat',
                userId,
                username,
                message: data.message,
                timestamp: Date.now()
              }));
            }
          });
          break;

        case 'media-status':
          // Broadcast media status (audio/video on/off) to all
          room.forEach(({ ws: clientWs }, uid) => {
            if (uid !== userId && clientWs.readyState === ws.OPEN) {
              clientWs.send(JSON.stringify({
                type: 'media-status',
                userId,
                audio: data.audio,
                video: data.video
              }));
            }
          });
          break;

        default:
          // Broadcast any other messages to all participants
          room.forEach(({ ws: clientWs }, uid) => {
            if (uid !== userId && clientWs.readyState === ws.OPEN) {
              clientWs.send(JSON.stringify({
                ...data,
                userId
              }));
            }
          });
      }
    } catch (err) {
      console.error('❌ Failed to process message:', err);
    }
  });

  ws.on('close', () => {
    console.log(`❌ ${username} (${userId}) left video call ${videoCallId}`);
    room.delete(userId);

    // Notify everyone else that this user left
    room.forEach(({ ws: clientWs }) => {
      if (clientWs.readyState === ws.OPEN) {
        clientWs.send(JSON.stringify({
          type: 'user-left',
          userId,
          username
        }));
      }
    });

    // Clean up empty rooms
    if (room.size === 0) {
      rooms.delete(videoCallId);
      console.log(`🗑️  Room ${videoCallId} deleted (empty)`);
    } else {
      console.log(`   Remaining participants: ${room.size}`);
    }
  });

  ws.on('error', (err) => {
    console.error(`❌ WebSocket error for ${userId}:`, err);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    activeRooms: rooms.size,
    totalConnections: Array.from(rooms.values()).reduce((sum, room) => sum + room.size, 0)
  });
});

// ----------------- START SERVER -----------------
const startServer = async () => {
  try {
    // Connect to database first (it's a function, not a class)
    await DatabaseConnection();
    
    // Then start the server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 WebSocket signaling server ready on ws://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⚠️  Shutting down gracefully...');
  await mongoose.disconnect();
  server.close(() => {
    console.log('👋 Server closed');
    process.exit(0);
  });
});
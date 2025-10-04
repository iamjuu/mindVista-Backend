const WebSocket = require('ws');
const http = require('http');
const url = require('url');

// Create HTTP server
const server = http.createServer();

// Create WebSocket server
const wss = new WebSocket.Server({ 
    server,
    path: '/signaling'
});

// Store active connections by room ID
const rooms = new Map();

// Store user connections
const connections = new Map();

console.log('🚀 WebRTC Signaling Server starting...');

wss.on('connection', (ws, req) => {
    console.log('📱 New WebSocket connection established');
    
    const query = url.parse(req.url, true).query;
    const roomId = query.roomId;
    const userId = query.userId;
    const userRole = query.role || 'participant';
    
    console.log(`👤 User ${userId} (${userRole}) joined room ${roomId}`);
    
    // Store connection info
    const connectionInfo = {
        ws,
        userId,
        userRole,
        roomId,
        connectedAt: new Date()
    };
    
    connections.set(ws, connectionInfo);
    
    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
        rooms.set(roomId, {
            participants: new Map(),
            createdAt: new Date()
        });
    }
    
    const room = rooms.get(roomId);
    room.participants.set(userId, connectionInfo);
    
    // Send room info to the new participant
    ws.send(JSON.stringify({
        type: 'room-joined',
        roomId,
        userId,
        participants: Array.from(room.participants.keys()),
        message: `Joined room ${roomId}`
    }));
    
    // Notify other participants about the new user
    room.participants.forEach((participant, participantId) => {
        if (participantId !== userId && participant.ws.readyState === WebSocket.OPEN) {
            participant.ws.send(JSON.stringify({
                type: 'user-joined',
                userId,
                userRole,
                message: `${userId} joined the call`
            }));
        }
    });
    
    // Handle incoming messages
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log(`📨 Message from ${userId}:`, data.type);
            
            switch (data.type) {
                case 'offer':
                    handleOffer(roomId, userId, data);
                    break;
                case 'answer':
                    handleAnswer(roomId, userId, data);
                    break;
                case 'ice-candidate':
                    handleIceCandidate(roomId, userId, data);
                    break;
                case 'call-start':
                    handleCallStart(roomId, userId);
                    break;
                case 'call-end':
                    handleCallEnd(roomId, userId);
                    break;
                case 'toggle-video':
                    handleToggleVideo(roomId, userId, data);
                    break;
                case 'toggle-audio':
                    handleToggleAudio(roomId, userId, data);
                    break;
                case 'chat-message':
                    handleChatMessage(roomId, userId, data);
                    break;
                default:
                    console.log(`❓ Unknown message type: ${data.type}`);
            }
        } catch (error) {
            console.error('❌ Error parsing message:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid message format'
            }));
        }
    });
    
    // Handle connection close
    ws.on('close', () => {
        console.log(`👋 User ${userId} disconnected from room ${roomId}`);
        
        // Remove from room
        if (rooms.has(roomId)) {
            const room = rooms.get(roomId);
            room.participants.delete(userId);
            
            // Notify other participants
            room.participants.forEach((participant, participantId) => {
                if (participant.ws.readyState === WebSocket.OPEN) {
                    participant.ws.send(JSON.stringify({
                        type: 'user-left',
                        userId,
                        message: `${userId} left the call`
                    }));
                }
            });
            
            // Clean up empty rooms
            if (room.participants.size === 0) {
                rooms.delete(roomId);
                console.log(`🗑️ Room ${roomId} cleaned up`);
            }
        }
        
        connections.delete(ws);
    });
    
    // Handle errors
    ws.on('error', (error) => {
        console.error(`❌ WebSocket error for user ${userId}:`, error);
    });
});

// Handle WebRTC offer
function handleOffer(roomId, fromUserId, data) {
    const room = rooms.get(roomId);
    if (!room) return;
    
    room.participants.forEach((participant, userId) => {
        if (userId !== fromUserId && participant.ws.readyState === WebSocket.OPEN) {
            participant.ws.send(JSON.stringify({
                type: 'offer',
                from: fromUserId,
                offer: data.offer,
                timestamp: new Date().toISOString()
            }));
        }
    });
}

// Handle WebRTC answer
function handleAnswer(roomId, fromUserId, data) {
    const room = rooms.get(roomId);
    if (!room) return;
    
    room.participants.forEach((participant, userId) => {
        if (userId !== fromUserId && participant.ws.readyState === WebSocket.OPEN) {
            participant.ws.send(JSON.stringify({
                type: 'answer',
                from: fromUserId,
                answer: data.answer,
                timestamp: new Date().toISOString()
            }));
        }
    });
}

// Handle ICE candidates
function handleIceCandidate(roomId, fromUserId, data) {
    const room = rooms.get(roomId);
    if (!room) return;
    
    room.participants.forEach((participant, userId) => {
        if (userId !== fromUserId && participant.ws.readyState === WebSocket.OPEN) {
            participant.ws.send(JSON.stringify({
                type: 'ice-candidate',
                from: fromUserId,
                candidate: data.candidate,
                timestamp: new Date().toISOString()
            }));
        }
    });
}

// Handle call start
function handleCallStart(roomId, fromUserId) {
    const room = rooms.get(roomId);
    if (!room) return;
    
    room.participants.forEach((participant, userId) => {
        if (userId !== fromUserId && participant.ws.readyState === WebSocket.OPEN) {
            participant.ws.send(JSON.stringify({
                type: 'call-started',
                from: fromUserId,
                message: 'Call has started',
                timestamp: new Date().toISOString()
            }));
        }
    });
}

// Handle call end
function handleCallEnd(roomId, fromUserId) {
    const room = rooms.get(roomId);
    if (!room) return;
    
    room.participants.forEach((participant, userId) => {
        if (userId !== fromUserId && participant.ws.readyState === WebSocket.OPEN) {
            participant.ws.send(JSON.stringify({
                type: 'call-ended',
                from: fromUserId,
                message: 'Call has ended',
                timestamp: new Date().toISOString()
            }));
        }
    });
}

// Handle video toggle
function handleToggleVideo(roomId, fromUserId, data) {
    const room = rooms.get(roomId);
    if (!room) return;
    
    room.participants.forEach((participant, userId) => {
        if (userId !== fromUserId && participant.ws.readyState === WebSocket.OPEN) {
            participant.ws.send(JSON.stringify({
                type: 'video-toggled',
                from: fromUserId,
                videoEnabled: data.videoEnabled,
                timestamp: new Date().toISOString()
            }));
        }
    });
}

// Handle audio toggle
function handleToggleAudio(roomId, fromUserId, data) {
    const room = rooms.get(roomId);
    if (!room) return;
    
    room.participants.forEach((participant, userId) => {
        if (userId !== fromUserId && participant.ws.readyState === WebSocket.OPEN) {
            participant.ws.send(JSON.stringify({
                type: 'audio-toggled',
                from: fromUserId,
                audioEnabled: data.audioEnabled,
                timestamp: new Date().toISOString()
            }));
        }
    });
}

// Handle chat messages
function handleChatMessage(roomId, fromUserId, data) {
    const room = rooms.get(roomId);
    if (!room) return;
    
    const message = {
        id: Date.now(),
        from: fromUserId,
        text: data.message,
        timestamp: new Date().toISOString()
    };
    
    room.participants.forEach((participant, userId) => {
        if (participant.ws.readyState === WebSocket.OPEN) {
            participant.ws.send(JSON.stringify({
                type: 'chat-message',
                message,
                timestamp: new Date().toISOString()
            }));
        }
    });
}

// Start server
const PORT = process.env.SIGNALING_PORT || 8080;
server.listen(PORT, () => {
    console.log(`🎯 WebRTC Signaling Server running on port ${PORT}`);
    console.log(`🔗 WebSocket endpoint: ws://localhost:${PORT}/signaling`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Shutting down signaling server...');
    server.close(() => {
        console.log('✅ Signaling server closed');
        process.exit(0);
    });
});

module.exports = { server, wss };

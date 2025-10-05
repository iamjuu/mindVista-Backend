const express = require('express');
const router = express.Router();

// Health check endpoint for video call system
router.get('/video-call-health', (req, res) => {
    try {
        const healthStatus = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                backend: 'running',
                signalingServer: 'checking...',
                frontend: 'checking...'
            },
            ports: {
                backend: process.env.PORT || 3000,
                signaling: process.env.SIGNALING_PORT || 8080,
                frontend: process.env.FRONTEND_URL || 'http://localhost:5173'
            }
        };

        // Check if signaling server is accessible
        const WebSocket = require('ws');
        const signalingUrl = `ws://localhost:${process.env.SIGNALING_PORT || 8080}/signaling`;
        
        try {
            const ws = new WebSocket(signalingUrl);
            
            ws.on('open', () => {
                healthStatus.services.signalingServer = 'running';
                ws.close();
                res.json({
                    success: true,
                    data: healthStatus,
                    message: 'Video call system is healthy'
                });
            });
            
            ws.on('error', (error) => {
                healthStatus.services.signalingServer = 'not running';
                healthStatus.error = error.message;
                res.json({
                    success: false,
                    data: healthStatus,
                    message: 'Signaling server is not running. Please start it with: node signaling-server.js'
                });
            });
            
            // Timeout after 5 seconds
            setTimeout(() => {
                if (ws.readyState === WebSocket.CONNECTING) {
                    ws.close();
                    healthStatus.services.signalingServer = 'timeout';
                    res.json({
                        success: false,
                        data: healthStatus,
                        message: 'Signaling server connection timeout'
                    });
                }
            }, 5000);
            
        } catch (wsError) {
            healthStatus.services.signalingServer = 'error';
            healthStatus.error = wsError.message;
            res.json({
                success: false,
                data: healthStatus,
                message: 'Error checking signaling server'
            });
        }
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Health check failed',
            error: error.message
        });
    }
});

// Get video call connection status
router.get('/video-call/:videoCallId/status', async (req, res) => {
    try {
        const { videoCallId } = req.params;
        
        // This would ideally check the signaling server for active connections
        // For now, we'll return basic status
        res.json({
            success: true,
            data: {
                videoCallId,
                status: 'active',
                participants: [],
                connectionInfo: {
                    signalingServer: 'ws://localhost:8080/signaling',
                    stunServers: [
                        'stun:stun.l.google.com:19302',
                        'stun:stun1.l.google.com:19302'
                    ]
                },
                instructions: {
                    doctor: 'Join with ?role=doctor parameter',
                    patient: 'Join with ?role=patient parameter',
                    troubleshooting: 'Ensure signaling server is running on port 8080'
                }
            },
            message: 'Video call status retrieved'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get video call status',
            error: error.message
        });
    }
});


// Get video call details
// router.get('/video-call/:videoCallId/details', async (req, res) => {
//   try {
//     const { videoCallId } = req.params;

//     // Fetch appointment/video call info from database
//     const appointment = await Appointment.findOne({ videoCallId });
//     if (!appointment) {
//       return res.status(404).json({
//         success: false,
//         message: 'Video call not found'
//       });
//     }

//     res.json({
//       success: true,
//       data: {
//         name: appointment.patientName,
//         doctorName: appointment.doctorName,
//         date: appointment.date,
//         time: appointment.time,
//         videoCallId: appointment.videoCallId
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get video call details',
//       error: error.message
//     });
//   }
// });



module.exports = router;

const express = require('express');
const router = express.Router();
const VideoCallLinkController = require('../controller/videoCallLink');
const Appoinment = require('../models/appoiment')
router.post('/videocall-link', VideoCallLinkController.VideoCallLink);
router.post('/generate-simple-link', VideoCallLinkController.generateSimpleLink);


router.get('/video-call/:videoCallId/details', async (req, res) => {
  try {
    const { videoCallId } = req.params;
    const appointment = await Appoinment.findOne({ videoCallId });
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Video call not found'
      });
    }

    // const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';  // for local dev
    const baseUrl = process.env.FRONTEND_URL || 'https://mind-vista-psychology-web-app-dvb3.vercel.app';

    res.json({
      success: true,
      data: {
        name: appointment.name || appointment.patientName,
        doctorName: appointment.doctorName,
        date: appointment.date,
        time: appointment.time,
        videoCallId: appointment.videoCallId,
        // Send both links
        doctorLink: `${baseUrl}/video-call/${videoCallId}?role=doctor`,
        patientLink: `${baseUrl}/video-call/${videoCallId}?role=patient`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get video call details',
      error: error.message
    });
  }
});


router.post('/end-session', VideoCallLinkController.endsession);

// PeerJS room join - coordinate peer IDs (replaces WebSocket for signaling)
const VideoCallRoom = require('../models/videoCallRoom');
router.post('/video-call/:videoCallId/join', async (req, res) => {
  try {
    const { videoCallId } = req.params;
    const { role, peerId } = req.body;

    if (!videoCallId || !role || !peerId) {
      return res.status(400).json({
        success: false,
        message: 'Missing videoCallId, role, or peerId'
      });
    }

    if (!['doctor', 'patient'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be doctor or patient'
      });
    }

    // Verify appointment exists
    const appointment = await Appoinment.findOne({ videoCallId, videoCallGenerated: true });
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Video call not found'
      });
    }

    const room = await VideoCallRoom.findOneAndUpdate(
      { videoCallId },
      {
        $set: {
          [role === 'doctor' ? 'doctorPeerId' : 'patientPeerId']: peerId,
          updatedAt: new Date()
        }
      },
      { new: true, upsert: true }
    );

    const otherRole = role === 'doctor' ? 'patient' : 'doctor';
    const otherPeerId = room[`${otherRole}PeerId`];

    res.json({
      success: true,
      data: {
        peerId,
        otherPeerId: otherPeerId || null,
        shouldCall: !!otherPeerId  // true if other person is waiting - we should call them
      }
    });
  } catch (error) {
    console.error('PeerJS join error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join room',
      error: error.message
    });
  }
});

// Optional: leave room (cleanup peer ID)
router.post('/video-call/:videoCallId/leave', async (req, res) => {
  try {
    const { videoCallId } = req.params;
    const { role } = req.body;

    if (!videoCallId || !role) {
      return res.status(400).json({ success: false, message: 'Missing videoCallId or role' });
    }

    await VideoCallRoom.findOneAndUpdate(
      { videoCallId },
      { $set: { [role === 'doctor' ? 'doctorPeerId' : 'patientPeerId']: null, updatedAt: new Date() } }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

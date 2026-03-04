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

    let room;
    if (role === 'doctor') {
      // Doctor joins - set doctorPeerId
      room = await VideoCallRoom.findOneAndUpdate(
        { videoCallId },
        {
          $set: { doctorPeerId: peerId, updatedAt: new Date() }
        },
        { new: true, upsert: true }
      );
    } else {
      // Patient joins - add to patientPeerIds array
      room = await VideoCallRoom.findOneAndUpdate(
        { videoCallId },
        {
          $addToSet: { patientPeerIds: peerId },
          $set: { updatedAt: new Date() }
        },
        { new: true, upsert: true }
      );
    }

    // Return all other peer IDs to call
    const otherPeerIds = [];
    if (role === 'doctor') {
      // Doctor should call all patients
      otherPeerIds.push(...(room.patientPeerIds || []));
    } else {
      // Patient should call doctor and other patients
      if (room.doctorPeerId) otherPeerIds.push(room.doctorPeerId);
      const otherPatients = (room.patientPeerIds || []).filter(id => id !== peerId);
      otherPeerIds.push(...otherPatients);
    }

    res.json({
      success: true,
      data: {
        peerId,
        otherPeerIds,
        shouldCall: otherPeerIds.length > 0
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

// Reset/clear room (for testing/cleanup)
router.delete('/video-call/:videoCallId/room', async (req, res) => {
  try {
    const { videoCallId } = req.params;
    await VideoCallRoom.deleteOne({ videoCallId });
    res.json({ success: true, message: 'Room cleared' });
  } catch (error) {
    console.error('Clear room error:', error);
    res.status(500).json({ success: false, message: 'Failed to clear room' });
  }
});

// Optional: leave room (cleanup peer ID)
router.post('/video-call/:videoCallId/leave', async (req, res) => {
  try {
    const { videoCallId } = req.params;
    const { role, peerId } = req.body;

    if (!videoCallId || !peerId) {
      return res.status(400).json({ success: false, message: 'Missing videoCallId or peerId' });
    }

    if (role === 'doctor') {
      await VideoCallRoom.findOneAndUpdate(
        { videoCallId },
        { $set: { doctorPeerId: null, updatedAt: new Date() } }
      );
    } else {
      await VideoCallRoom.findOneAndUpdate(
        { videoCallId },
        { $pull: { patientPeerIds: req.body.peerId }, $set: { updatedAt: new Date() } }
      );
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

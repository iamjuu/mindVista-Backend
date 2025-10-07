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

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    res.json({
      success: true,
      data: {
        name: appointment.patientName,
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


router.post('/end-session',VideoCallLinkController.endsession)

module.exports = router;

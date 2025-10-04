const express = require('express');
const router = express.Router();
const VideoCallLinkController = require('../controller/videoCallLink');

router.post('/videocall-link', VideoCallLinkController.VideoCallLink);
router.post('/generate-simple-link', VideoCallLinkController.generateSimpleLink);

module.exports = router;

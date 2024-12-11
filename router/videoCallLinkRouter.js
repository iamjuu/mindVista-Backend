const express = require('express');
const router = express.Router();
const VideoCallLinkController = require('../controller/videoCallLink');

router.post('/videocall-link', VideoCallLinkController.VideoCallLink);

module.exports = router;

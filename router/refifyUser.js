const express = require('express');
const router = express.Router();
const RefifyUserController = require('../controller/refifyUser');

// Send approval email notification
router.post('/refify-user/approve', RefifyUserController.sendApprovalEmail);

// Send decline email notification
router.post('/refify-user/decline', RefifyUserController.sendDeclineEmail);

module.exports = router;


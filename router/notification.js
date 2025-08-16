const express = require("express");
const router = express.Router();
const Notification = require("../controller/notification");
router.post("/notification-sent", Notification.notificationsent);
router.post("/notification", Notification.notificationPost);

module.exports = router;

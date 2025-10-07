const express = require("express");
const router = express.Router();
const Notification = require("../controller/notification");

// Create
router.post("/notification-sent", Notification.notificationsent);
router.post("/notification", Notification.notificationPost);

// Read
router.get("/notifications/:userId", Notification.listByUser);

// Update
router.patch("/notifications/:id/read", Notification.markRead);
router.patch("/notifications/user/:userId/read-all", Notification.markAllReadForUser);

// Delete
router.delete("/notifications/:id", Notification.remove);

module.exports = router;

const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'appoiment', required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, enum: ['info', 'warning', 'success', 'error', 'message'], default: 'info' },
    isRead: { type: Boolean, default: false },
    metadata: { type: Object, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);



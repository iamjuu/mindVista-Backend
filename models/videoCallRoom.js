const mongoose = require('mongoose');

// Stores peer IDs for PeerJS room coordination (replaces WebSocket signaling)
// Used when doctor/patient join - we need to exchange peer IDs via REST
const videoCallRoomSchema = new mongoose.Schema({
  videoCallId: { type: String, required: true, unique: true },
  doctorPeerId: { type: String, default: null },
  patientPeerId: { type: String, default: null },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Auto-expire after 2 hours (cleanup abandoned rooms)
videoCallRoomSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 7200 });

module.exports = mongoose.model('VideoCallRoom', videoCallRoomSchema);

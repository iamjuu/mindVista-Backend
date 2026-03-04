const mongoose = require('mongoose');

// Stores peer IDs for PeerJS room coordination (replaces WebSocket signaling)
// Supports multiple participants (doctor + multiple patients/observers)
const videoCallRoomSchema = new mongoose.Schema({
  videoCallId: { type: String, required: true, unique: true },
  doctorPeerId: { type: String, default: null },
  patientPeerIds: [{ type: String }],  // Array for multiple patients/observers
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Auto-expire after 2 hours (cleanup abandoned rooms)
videoCallRoomSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 7200 });

module.exports = mongoose.model('VideoCallRoom', videoCallRoomSchema);

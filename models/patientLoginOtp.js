const mongoose = require('mongoose');

const patientLoginOtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

patientLoginOtpSchema.index({ email: 1 }, { unique: true });

const PatientLoginOtp = mongoose.model('PatientLoginOtp', patientLoginOtpSchema);
module.exports = PatientLoginOtp;

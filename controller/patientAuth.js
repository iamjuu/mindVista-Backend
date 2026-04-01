const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const PatientUser = require('../models/patientUser');
const PatientLoginOtp = require('../models/patientLoginOtp');
const Appoinment = require('../models/appoiment');
const { sendPatientLoginOtp } = require('../utils/mailer');
const { JWT_SECRET } = require('../middleware/authPatient');

const OTP_TTL_MS = 60 * 1000; // 1 minute

const signToken = (patientId) =>
  jwt.sign({ patientId: patientId.toString() }, JWT_SECRET, { expiresIn: '30d' });

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Register a patient account (optional — use same email as booking to see those appointments).
 */
exports.registerPatient = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required',
      });
    }
    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }
    const existing = await PatientUser.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please log in.',
      });
    }
    const passwordHash = await bcrypt.hash(String(password), 10);
    const patient = await PatientUser.create({
      email: email.toLowerCase().trim(),
      password: passwordHash,
      name: String(name).trim(),
      phone: phone != null ? String(phone).trim() : '',
    });
    const token = signToken(patient._id);
    const safe = {
      _id: patient._id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
    };
    return res.status(201).json({
      success: true,
      message: 'Account created',
      token,
      patient: safe,
    });
  } catch (error) {
    console.error('[registerPatient]', error);
    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
};

/**
 * Send login OTP to email (patient must already have registered).
 */
exports.sendLoginOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !String(email).trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    const normalized = email.toLowerCase().trim();
    const patient = await PatientUser.findOne({ email: normalized });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email. Create an account first.',
      });
    }

    const code = String(crypto.randomInt(100000, 1000000));
    const otpHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await PatientLoginOtp.findOneAndUpdate(
      { email: normalized },
      { email: normalized, otpHash, expiresAt },
      { upsert: true, new: true }
    );

    const mailResult = await sendPatientLoginOtp(normalized, code);
    if (!mailResult.success) {
      await PatientLoginOtp.deleteOne({ email: normalized });
      return res.status(503).json({
        success: false,
        message: 'Could not send email. Check server email settings.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Verification code sent to your email',
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('[sendLoginOtp]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send verification code',
      error: error.message,
    });
  }
};

/**
 * Verify OTP and return JWT.
 */
exports.verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification code are required',
      });
    }
    const normalized = email.toLowerCase().trim();
    const plain = String(otp).replace(/\D/g, '').slice(0, 6);
    if (plain.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Enter the 6-digit code from your email',
      });
    }

    const record = await PatientLoginOtp.findOne({ email: normalized });
    if (!record) {
      return res.status(401).json({
        success: false,
        message: 'No active code. Request a new one.',
      });
    }
    if (record.expiresAt.getTime() < Date.now()) {
      await PatientLoginOtp.deleteOne({ _id: record._id });
      return res.status(401).json({
        success: false,
        message: 'Code expired. Request a new one.',
      });
    }

    const match = await bcrypt.compare(plain, record.otpHash);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: 'Invalid verification code',
      });
    }

    await PatientLoginOtp.deleteOne({ _id: record._id });

    const patient = await PatientUser.findOne({ email: normalized });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    const token = signToken(patient._id);
    const safe = {
      _id: patient._id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
    };
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      patient: safe,
    });
  } catch (error) {
    console.error('[verifyLoginOtp]', error);
    return res.status(500).json({
      success: false,
      message: 'Verification failed',
      error: error.message,
    });
  }
};

/**
 * Log in — returns JWT. Use email that matches your appointment bookings to load history.
 */
exports.loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }
    const patient = await PatientUser.findOne({ email: email.toLowerCase().trim() });
    if (!patient) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
    const ok = await bcrypt.compare(String(password), patient.password);
    if (!ok) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
    const token = signToken(patient._id);
    const safe = {
      _id: patient._id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
    };
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      patient: safe,
    });
  } catch (error) {
    console.error('[loginPatient]', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
};

/**
 * Profile + appointments for this email (from bookings). Requires Bearer token.
 */
exports.getPatientProfile = async (req, res) => {
  try {
    const patient = req.patient;
    const emailRegex = new RegExp(`^${escapeRegex(patient.email)}$`, 'i');
    const appointments = await Appoinment.find({ email: emailRegex })
      .sort({ createdAt: -1 })
      .lean();

    const history = appointments.map((a) => ({
      id: a._id?.toString(),
      appointmentId: a._id?.toString(),
      name: a.name,
      doctorName: a.doctorName || '',
      age: a.age != null ? String(a.age) : '',
      date: a.date,
      time: a.time,
      location: a.location,
      email: a.email,
      number: a.phone,
      payment: a.payment,
      paymentStatus: a.paymentStatus,
      status: a.status,
    }));

    const latest = history[0] || null;

    return res.status(200).json({
      success: true,
      patient: {
        _id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
      },
      appointments: history,
      summary: latest
        ? {
            appointmentId: latest.appointmentId,
            name: latest.name || patient.name,
            email: patient.email,
            number: latest.number || patient.phone,
            age: latest.age,
            doctorName: latest.doctorName,
            date: latest.date,
            time: latest.time,
            location: latest.location,
          }
        : null,
    });
  } catch (error) {
    console.error('[getPatientProfile]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load profile',
      error: error.message,
    });
  }
};

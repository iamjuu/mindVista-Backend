const jwt = require('jsonwebtoken');
const PatientUser = require('../models/patientUser');

const JWT_SECRET = process.env.JWT_SECRET || 'mindvista-patient-dev-secret-change-in-production';

async function authPatient(req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization required' });
    }
    const token = auth.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    const patient = await PatientUser.findById(decoded.patientId).select('-password');
    if (!patient) {
      return res.status(401).json({ success: false, message: 'Account not found' });
    }
    req.patient = patient;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session' });
  }
}

module.exports = { authPatient, JWT_SECRET };

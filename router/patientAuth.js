const express = require('express');
const router = express.Router();
const PatientAuth = require('../controller/patientAuth');
const { authPatient } = require('../middleware/authPatient');

router.post('/patient/register', PatientAuth.registerPatient);
router.post('/patient/login/send-otp', PatientAuth.sendLoginOtp);
router.post('/patient/login/verify-otp', PatientAuth.verifyLoginOtp);
router.post('/patient/login', PatientAuth.loginPatient);
router.get('/patient/me', authPatient, PatientAuth.getPatientProfile);

module.exports = router;

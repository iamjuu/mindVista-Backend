const express = require('express');
const router = express.Router();
const { doctorUpload, handleMulterError } = require('../utils/multer');
const DoctorController = require('../controller/doctor');

// Doctor login
router.post('/login', DoctorController.loginDoctor);

// Create a new doctor
router.post('/add-doctor', doctorUpload, handleMulterError, DoctorController.createDoctor);

// Get all doctors (public - active and available only)
router.get('/doctors', DoctorController.getAllDoctors);

// Get all doctors for registration form (all-docters endpoint)
router.get('/all-docters', DoctorController.getAllDoctorsForForm);

// Get doctor by ID
router.get('/doctors/:id', DoctorController.getDoctorById);

// Update a doctor
router.put('/doctor-update/:id', DoctorController.updateDoctor);

// Delete a doctor (soft delete)
router.delete('/doctor-delete/:id', DoctorController.deleteDoctor);

// Get doctors by specialization
router.get('/doctors/specialization/:specialization', DoctorController.getDoctorsBySpecialization);

// Get all doctors for admin (including unavailable)
router.get('/doctors/admin/all', DoctorController.getAllDoctorsAdmin);

// Approve doctor
router.put('/doctors/approve/:id', DoctorController.approveDoctor);


// *********************login doctor*********************
// Doctor login
router.post('/doctor/login', DoctorController.loginDoctor);





module.exports = router; 
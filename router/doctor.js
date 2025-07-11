const express = require('express');
const router = express.Router();

const DoctorController = require('../controller/doctor');

// Get all doctors
router.get('/doctors', DoctorController.getAllDoctors);

// Get doctor by ID
router.get('/doctors/:id', DoctorController.getDoctorById);

// Create a new doctor
router.post('/doctors', DoctorController.createDoctor);

// Update a doctor
router.put('/doctors/:id', DoctorController.updateDoctor);

// Delete a doctor (soft delete)
router.delete('/doctors/:id', DoctorController.deleteDoctor);

// Get doctors by specialization
router.get('/doctors/specialization/:specialization', DoctorController.getDoctorsBySpecialization);

// Get all doctors for admin (including unavailable)
router.get('/doctors/admin/all', DoctorController.getAllDoctorsAdmin);

module.exports = router; 
const express = require('express');
const router = express.Router();
const dashboardController = require('../controller/dashboard');

// Get overall dashboard statistics
router.get('/stats', dashboardController.getDashboardStats);

// Get all doctors with their statistics
router.get('/doctors', dashboardController.getDoctorsWithStats);

// Get specific doctor statistics
router.get('/doctors/:doctorId', dashboardController.getDoctorStats);

// Get recent appointments
router.get('/appointments/recent', dashboardController.getRecentAppointments);

// Get financial overview
router.get('/finance', dashboardController.getFinancialOverview);

// Get work hour analysis
router.get('/work-hours', dashboardController.getWorkHourAnalysis);

// Get doctors work progress
router.get('/doctors-progress', dashboardController.getDoctorsWorkProgress);

// Dashboard notes
router.get('/notes', dashboardController.getNotes);
router.post('/notes', dashboardController.createNote);
router.put('/notes/:id/toggle', dashboardController.toggleNoteCompletion);
router.delete('/notes/:id', dashboardController.deleteNote);

module.exports = router;


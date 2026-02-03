const express = require('express')
const router = express.Router()

const AppointmentController = require('../controller/appoiment');


// Get all appointments
router.get('/appointment', AppointmentController.getAppointments)

// Get patient requests (request-pateint endpoint)
router.get('/request-pateint', AppointmentController.getPatientRequests)

// Create a new appointment
router.post('/appointment', AppointmentController.createAppointment)

// Approve an appointment
router.put('/appointment/:id/approve', AppointmentController.approveAppointment)

// Generate video call link for confirmed appointment
router.put('/appointment/:id/generate-video-call', AppointmentController.generateVideoCallForConfirmed)

// Decline an appointment
router.put('/appointment/:id/decline', AppointmentController.declineAppointment)

// Get appointments for a specific doctor
router.get('/doctor/:doctorId/appointments', AppointmentController.getDoctorAppointments)

// Get today's appointments with video call links
router.get('/appointments/today', AppointmentController.getTodayAppointments)

// Get video call details by video call ID
router.get('/video-call/:videoCallId/details', AppointmentController.getVideoCallDetails)

// Get available time slots for a doctor on a specific date
router.get('/available-slots', AppointmentController.getAvailableTimeSlots)

// Debug endpoint to check all appointments
router.get('/debug/appointments', AppointmentController.debugAppointments)

module.exports = router;

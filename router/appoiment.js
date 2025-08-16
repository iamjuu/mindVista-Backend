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

// Decline an appointment
router.put('/appointment/:id/decline', AppointmentController.declineAppointment)

module.exports = router;

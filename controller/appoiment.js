const Appoinment = require('../models/appoiment')

module.exports = {
    // Get all appointments
    getAppointments: async (req, res) => {
        try {
            // Remove populate since we don't have a register model
            const appointments = await Appoinment.find();
            // Transform the data to match frontend expectations (add id field)
            const transformedAppointments = appointments.map(appointment => ({
                id: appointment._id,
                _id: appointment._id,
                name: appointment.name,
                phone: appointment.phone,
                age: appointment.age,
                location: appointment.location,
                doctor: appointment.doctor,
                status: appointment.status,
                time: appointment.time,
                date: appointment.date,
                createdAt: appointment.createdAt,
                updatedAt: appointment.updatedAt
            }));
            
            console.log('Transformed appointments for frontend:', transformedAppointments);
            
            res.status(200).json({
                success: true,
                data: transformedAppointments,
                message: 'Appointments fetched successfully'
            });
        } catch (error) {
            console.error('Error fetching appointments:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch appointments',
                error: error.message
            });
        }
    },

    // Get patient requests (request-pateint endpoint)
    getPatientRequests: async (req, res) => {
        try {
            // Get all patient requests/appointments with doctor information
            const patientRequests = await Appoinment.find().populate('doctor', 'name specialization experience rating');
            
            // Transform the data to match frontend expectations
            const transformedRequests = patientRequests.map(request => ({
                id: request._id,
                _id: request._id,
                name: request.name,
                phone: request.phone,
                number: request.phone, // Alternative field name
                age: request.age,
                location: request.location,
                doctor: request.doctor,
                doctorName: request.doctor?.name || request.doctor || 'N/A',
                doctorSpecialization: request.doctor?.specialization || 'N/A',
                status: request.status || 'pending',
                time: request.time,
                date: request.date,
                createdAt: request.createdAt,
                updatedAt: request.updatedAt
            }));
            
            console.log('Patient requests fetched:', transformedRequests);
            
            res.status(200).json({
                success: true,
                data: transformedRequests,
                message: 'Patient requests fetched successfully'
            });
        } catch (error) {
            console.error('Error fetching patient requests:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch patient requests',
                error: error.message
            });
        }
    },

    // Create a new appointment
    createAppointment: async (req, res) => {
        try {

            console.log('Request body:', req.body);
            
            const { name, email, number, age, location, slot, time, date, doctor } = req.body;
            console.log('heloo');
            if (!name || !number || !age || !location || !time || !date || !doctor) {
  
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required including doctor selection'
                });
            }
      
            const newAppointment = new Appoinment({
                name,
                phone: number, // Map number to phone field
                age,
                location,
                doctor: doctor, // Use the selected doctor from form
                time,
                date,
                register: null, // Set to null for now since no user registration system
                status: 'pending'
            });
            
            await newAppointment.save();
            
            // Transform the data to match frontend expectations
            const transformedAppointment = {
                id: newAppointment._id,
                _id: newAppointment._id,
                name: newAppointment.name,
                phone: newAppointment.phone,
                age: newAppointment.age,
                location: newAppointment.location,
                doctor: newAppointment.doctor,
                status: newAppointment.status,
                time: newAppointment.time,
                date: newAppointment.date,
                createdAt: newAppointment.createdAt,
                updatedAt: newAppointment.updatedAt
            };
            
            res.status(201).json({
                success: true,
                data: transformedAppointment,
                message: 'Appointment created successfully'
            });
        } catch (error) {
            console.error('Error creating appointment:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create appointment',
                error: error.message
            });
        }
    },

    // Approve an appointment
    approveAppointment: async (req, res) => {
        try {
            const { id } = req.params;
            
            const appointment = await Appoinment.findByIdAndUpdate(
                id,
                { status: 'approved' },
                { new: true }
            );
            
            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }
            // Transform the data to match frontend expectations
            const transformedAppointment = {
                id: appointment._id,
                _id: appointment._id,
                name: appointment.name,
                phone: appointment.phone,
                age: appointment.age,
                location: appointment.location,
                doctor: appointment.doctor,
                status: appointment.status,
                time: appointment.time,
                date: appointment.date,
                createdAt: appointment.createdAt,
                updatedAt: appointment.updatedAt
            };
            
            res.status(200).json({
                success: true,
                data: transformedAppointment,
                message: 'Appointment approved successfully'
            });
        } catch (error) {
            console.error('Error approving appointment:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to approve appointment',
                error: error.message
            });
        }
    },

    // Decline an appointment
    declineAppointment: async (req, res) => {
        try {
            const { id } = req.params;
            
            const appointment = await Appoinment.findByIdAndUpdate(
                id,
                { status: 'declined' },
                { new: true }
            );
            
            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }            
            // Transform the data to match frontend expectations
            const transformedAppointment = {
                id: appointment._id,
                _id: appointment._id,
                name: appointment.name,
                phone: appointment.phone,
                age: appointment.age,
                location: appointment.location,
                doctor: appointment.doctor,
                status: appointment.status,
                time: appointment.time,
                date: appointment.date,
                createdAt: appointment.createdAt,
                updatedAt: appointment.updatedAt
            };
            
            res.status(200).json({
                success: true,
                data: transformedAppointment,
                message: 'Appointment declined successfully'
            });
        } catch (error) {
            console.error('Error declining appointment:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to decline appointment',
                error: error.message
            });
        }
    }
}
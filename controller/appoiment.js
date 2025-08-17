const Appoinment = require('../models/appoiment')
const axios = require('axios')

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
                email: appointment.email,
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
                email: request.email,
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
            if (!name || !email || !number || !age || !location || !time || !date || !doctor) {
  
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required including doctor selection and email'
                });
            }
      
            const newAppointment = new Appoinment({
                name,
                email,
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
                email: newAppointment.email,
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
            
            const appointment = await Appoinment.findById(id).populate('doctor', 'name specialization');
            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }

            // Update appointment status
            appointment.status = 'approved';
            await appointment.save();
            
            // Send email notification via refify-user endpoint
            try {
                const emailData = {
                    appointmentId: appointment._id,
                    patientName: appointment.name,
                    patientEmail: appointment.email,
                    doctorName: appointment.doctor?.name || 'Doctor',
                    appointmentDate: appointment.date,
                    appointmentTime: appointment.time
                };

                // Call the refify-user endpoint to send approval email
                await axios.post(`${process.env.BACKEND_URL || 'http://localhost:5000'}/refify-user/approve`, emailData);
                console.log('Approval email sent successfully');
            } catch (emailError) {
                console.error('Error sending approval email:', emailError);
                // Don't fail the appointment approval if email fails
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
            const { reason } = req.body; // Optional reason for declining
            
            const appointment = await Appoinment.findById(id).populate('doctor', 'name specialization');
            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }

            // Update appointment status
            appointment.status = 'declined';
            await appointment.save();
            
            // Send email notification via refify-user endpoint
            try {
                const emailData = {
                    appointmentId: appointment._id,
                    patientName: appointment.name,
                    patientEmail: appointment.email,
                    doctorName: appointment.doctor?.name || 'Doctor',
                    appointmentDate: appointment.date,
                    appointmentTime: appointment.time,
                    reason: reason || 'Schedule conflict'
                };

                // Call the refify-user endpoint to send decline email
                await axios.post(`${process.env.BACKEND_URL || 'http://localhost:5000'}/refify-user/decline`, emailData);
                console.log('Decline email sent successfully');
            } catch (emailError) {
                console.error('Error sending decline email:', emailError);
                // Don't fail the appointment decline if email fails
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
    },

    // Get appointments for a specific doctor
    getDoctorAppointments: async (req, res) => {
        try {
            const { doctorId } = req.params;
            
            if (!doctorId) {
                return res.status(400).json({
                    success: false,
                    message: 'Doctor ID is required'
                });
            }

            const appointments = await Appoinment.find({ doctor: doctorId }).sort({ date: 1, time: 1 });
            
            // Transform the data to match frontend expectations
            const transformedAppointments = appointments.map(appointment => ({
                id: appointment._id,
                _id: appointment._id,
                name: appointment.name,
                email: appointment.email,
                phone: appointment.phone,
                number: appointment.phone, // Alternative field name for compatibility
                age: appointment.age,
                location: appointment.location,
                doctor: appointment.doctor,
                status: appointment.status || 'pending',
                time: appointment.time,
                date: appointment.date,
                createdAt: appointment.createdAt,
                updatedAt: appointment.updatedAt
            }));
            
            console.log(`Appointments fetched for doctor ${doctorId}:`, transformedAppointments);
            
            res.status(200).json({
                success: true,
                data: transformedAppointments,
                message: 'Doctor appointments fetched successfully'
            });
        } catch (error) {
            console.error('Error fetching doctor appointments:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch doctor appointments',
                error: error.message
            });
        }
    }
}
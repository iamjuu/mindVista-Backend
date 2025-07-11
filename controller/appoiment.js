const Appoinment = require('../models/appoiment')

module.exports = {
    // Get all appointments
    getAppointments: async (req, res) => {
        try {
            console.log('Fetching all appointments...');
            
            // Remove populate since we don't have a register model
            const appointments = await Appoinment.find();
            console.log('====================================');
            console.log(appointments, 'fetched appointments');
            console.log('====================================');
            
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

    // Create a new appointment
    createAppointment: async (req, res) => {
        try {
            console.log('Creating new appointment...');
            console.log('Request body:', req.body);
            
            const { name, email, number, age, location, slot, time, date } = req.body;
            
            // Validate required fields
            if (!name || !number || !age || !location || !time || !date) {
                console.log('Missing required fields');
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required'
                });
            }
            
            console.log('Creating appointment with data:', {
                name,
                email,
                phone: number,
                age,
                location,
                slot,
                time,
                date
            });
            
            const newAppointment = new Appoinment({
                name,
                phone: number, // Map number to phone field
                age,
                location,
                doctor: 'General Doctor', // Default doctor since not provided in form
                time,
                date,
                register: null, // Set to null for now since no user registration system
                status: 'pending'
            });
            
            await newAppointment.save();
            console.log('Appointment created successfully:', newAppointment);
            
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
            console.log(`Approving appointment with ID: ${id}`);
            
            const appointment = await Appoinment.findByIdAndUpdate(
                id,
                { status: 'approved' },
                { new: true }
            );
            
            if (!appointment) {
                console.log(`Appointment with ID ${id} not found`);
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }
            
            console.log('Appointment approved successfully:', appointment);
            
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
            console.log(`Declining appointment with ID: ${id}`);
            
            const appointment = await Appoinment.findByIdAndUpdate(
                id,
                { status: 'declined' },
                { new: true }
            );
            
            if (!appointment) {
                console.log(`Appointment with ID ${id} not found`);
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }
            
            console.log('Appointment declined successfully:', appointment);
            
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
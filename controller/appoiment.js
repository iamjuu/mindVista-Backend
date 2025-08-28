const Appoinment = require('../models/appoiment')
const { sendApprovalEmail, sendDeclineEmail, sendApprovalEmailWithVideoCall } = require('../utils/mailer')
const { generateVideoCallLink } = require('../utils/videoCall')

module.exports = {
    // Get all appointments
    getAppointments: async (req, res) => {
        try {
            // Populate doctor information to get doctor name and details
            const appointments = await Appoinment.find().populate('doctor', 'name specialization experience rating');
            // Transform the data to match frontend expectations (add id field)
            const transformedAppointments = appointments.map(appointment => ({
                id: appointment._id,
                _id: appointment._id,
                name: appointment.name,
                email: appointment.email,
                phone: appointment.phone,
                number: appointment.phone,
                age: appointment.age,
                location: appointment.location,
                doctor: appointment.doctor?._id || appointment.doctor,
                doctorName: appointment.doctor?.name || appointment.doctorName || 'Unknown Doctor',
                doctorSpecialization: appointment.doctor?.specialization || 'N/A',
                doctorExperience: appointment.doctor?.experience || 'N/A',
                doctorRating: appointment.doctor?.rating || 'N/A',
                slot: appointment.slot,
                status: appointment.status,
                time: appointment.time,
                date: appointment.date,
                paymentStatus: appointment.paymentStatus,
                paymentCompletedAt: appointment.paymentCompletedAt,
                receiptUploaded: appointment.receiptUploaded,
                receiptFile: appointment.receiptFile,
                payment: appointment.payment,
                appointmentId: appointment.appointmentId,
                videoCallLink: appointment.videoCallLink,
                videoCallId: appointment.videoCallId,
                videoCallGenerated: appointment.videoCallGenerated,
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
                doctorName: request.doctorName || request.doctor?.name || 'N/A',
                doctorSpecialization: request.doctor?.specialization || 'N/A',
                slot: request.slot,
                status: request.status || 'pending',
                time: request.time,
                date: request.date,
                paymentStatus: request.paymentStatus,
                paymentCompletedAt: request.paymentCompletedAt,
                receiptUploaded: request.receiptUploaded,
                receiptFile: request.receiptFile,
                payment: request.payment,
                appointmentId: request.appointmentId,
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
            console.log('Request files:', req.files);
            
            // Check if this is a multipart form data request (with receipt file)
            if (req.files && req.files.receipt) {
                // Handle receipt upload and appointment creation
                const receiptFile = req.files.receipt;
                const appointmentData = JSON.parse(req.body.appointmentData);
                
                console.log('Receipt file received:', receiptFile.name);
                console.log('Appointment data:', appointmentData);
                
                // Validate required fields
                const { name, email, number, age, location, slot, time, date, doctor, doctorName, status, paymentStatus, paymentCompletedAt, receiptUploaded } = appointmentData;
                
                if (!name || !email || !number || !age || !location || !time || !date || !doctor) {
                    return res.status(400).json({
                        success: false,
                        message: 'All required fields are missing'
                    });
                }
                
                // Handle file upload (you can customize this based on your file storage solution)
                let receiptFilePath = null;
                try {
                    // Move file to uploads directory (create this directory if it doesn't exist)
                    const uploadDir = './uploads/receipts';
                    const fs = require('fs');
                    const path = require('path');
                    
                    // Create directory if it doesn't exist
                    if (!fs.existsSync(uploadDir)) {
                        fs.mkdirSync(uploadDir, { recursive: true });
                    }
                    
                    // Generate unique filename
                    const timestamp = Date.now();
                    const fileExtension = path.extname(receiptFile.name);
                    const fileName = `receipt_${timestamp}${fileExtension}`;
                    const filePath = path.join(uploadDir, fileName);
                    
                    // Move file
                    await receiptFile.mv(filePath);
                    receiptFilePath = `/uploads/receipts/${fileName}`;
                    
                    console.log('Receipt file saved to:', receiptFilePath);
                } catch (fileError) {
                    console.error('Error saving receipt file:', fileError);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to save receipt file'
                    });
                }
                
                // Create appointment with receipt information
                const newAppointment = new Appoinment({
                    name,
                    email,
                    phone: number,
                    age: parseInt(age),
                    location,
                    doctor,
                    doctorName,
                    slot,
                    time,
                    date,
                    status: status || 'confirmed',
                    paymentStatus: paymentStatus || 'completed',
                    paymentCompletedAt: paymentCompletedAt ? new Date(paymentCompletedAt) : new Date(),
                    receiptUploaded: receiptUploaded || true,
                    receiptFile: receiptFilePath,
                    payment: true, // Set payment to true since receipt is uploaded
                    appointmentId: appointmentData.appointmentId || null
                });
                
                await newAppointment.save();
                
                // Transform the data to match frontend expectations
                const transformedAppointment = {
                    id: newAppointment._id,
                    _id: newAppointment._id,
                    name: newAppointment.name,
                    email: newAppointment.email,
                    phone: newAppointment.phone,
                    number: newAppointment.phone,
                    age: newAppointment.age,
                    location: newAppointment.location,
                    doctor: newAppointment.doctor,
                    doctorName: newAppointment.doctorName,
                    slot: newAppointment.slot,
                    status: newAppointment.status,
                    time: newAppointment.time,
                    date: newAppointment.date,
                    paymentStatus: newAppointment.paymentStatus,
                    receiptUploaded: newAppointment.receiptUploaded,
                    receiptFile: newAppointment.receiptFile,
                    paymentCompletedAt: newAppointment.paymentCompletedAt,
                    createdAt: newAppointment.createdAt,
                    updatedAt: newAppointment.updatedAt
                };
                
                res.status(201).json({
                    success: true,
                    data: transformedAppointment,
                    message: 'Appointment created successfully with receipt'
                });
                
            } else {
                // Handle regular appointment creation (backward compatibility)
                const { name, email, number, age, location, slot, time, date, doctor } = req.body;
                console.log('Creating regular appointment without receipt');
                
                if (!name || !email || !number || !age || !location || !time || !date || !doctor) {
                    return res.status(400).json({
                        success: false,
                        message: 'All fields are required including doctor selection and email'
                    });
                }
                
                const newAppointment = new Appoinment({
                    name,
                    email,
                    phone: number,
                    age: parseInt(age),
                    location,
                    doctor: doctor,
                    slot: slot || 'morning',
                    time,
                    date,
                    status: 'pending',
                    paymentStatus: 'pending'
                });
                
                await newAppointment.save();
                
                // Transform the data to match frontend expectations
                const transformedAppointment = {
                    id: newAppointment._id,
                    _id: newAppointment._id,
                    name: newAppointment.name,
                    email: newAppointment.email,
                    phone: newAppointment.phone,
                    number: newAppointment.phone,
                    age: newAppointment.age,
                    location: newAppointment.location,
                    doctor: newAppointment.doctor,
                    slot: newAppointment.slot,
                    status: newAppointment.status,
                    time: newAppointment.time,
                    date: newAppointment.date,
                    paymentStatus: newAppointment.paymentStatus,
                    createdAt: newAppointment.createdAt,
                    updatedAt: newAppointment.updatedAt
                };
                
                res.status(201).json({
                    success: true,
                    data: transformedAppointment,
                    message: 'Appointment created successfully'
                });
            }
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

            // Generate unique video call link
            const videoCallResult = generateVideoCallLink(
                appointment._id.toString(),
                appointment.doctor._id.toString(),
                appointment.name
            );

            if (!videoCallResult.success) {
                console.error('❌ Failed to generate video call link:', videoCallResult.error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to generate video call link',
                    error: videoCallResult.error
                });
            }

            // Update appointment with video call info and approve status
            appointment.status = 'approved';
            appointment.videoCallLink = videoCallResult.videoCallLink;
            appointment.videoCallId = videoCallResult.videoCallId;
            appointment.videoCallGenerated = true;
            await appointment.save();
            
            // Send approval email with video call link
            try {
                const emailResult = await sendApprovalEmailWithVideoCall(
                    appointment.email,
                    appointment.name,
                    appointment.doctor?.name || 'Doctor',
                    appointment.date,
                    appointment.time,
                    videoCallResult.videoCallLink
                );
                
                if (emailResult.success) {
                    console.log('✅ Appointment approval email with video call link sent successfully to:', appointment.email);
                } else {
                    console.error('❌ Failed to send approval email:', emailResult.error);
                }
            } catch (emailError) {
                console.error('❌ Error sending approval email:', emailError);
                // Don't fail the appointment approval if email fails
            }
            
            // Transform the data to match frontend expectations
            const transformedAppointment = {
                id: appointment._id,
                _id: appointment._id,
                name: appointment.name,
                email: appointment.email,
                phone: appointment.phone,
                age: appointment.age,
                location: appointment.location,
                doctor: appointment.doctor,
                doctorName: appointment.doctor?.name || appointment.doctorName,
                status: appointment.status,
                time: appointment.time,
                date: appointment.date,
                videoCallLink: appointment.videoCallLink,
                videoCallId: appointment.videoCallId,
                videoCallGenerated: appointment.videoCallGenerated,
                createdAt: appointment.createdAt,
                updatedAt: appointment.updatedAt
            };
            
            res.status(200).json({
                success: true,
                data: transformedAppointment,
                message: 'Appointment approved successfully with video call link generated'
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
            
            // Send decline email directly to the patient
            try {
                const emailResult = await sendDeclineEmail(
                    appointment.email,
                    appointment.name,
                    appointment.doctor?.name || 'Doctor',
                    appointment.date,
                    appointment.time,
                    reason || 'Schedule conflict'
                );
                
                if (emailResult.success) {
                    console.log('✅ Appointment decline email sent successfully to:', appointment.email);
                } else {
                    console.error('❌ Failed to send decline email:', emailResult.error);
                }
            } catch (emailError) {
                console.error('❌ Error sending decline email:', emailError);
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

    // Get today's appointments with video call links
    getTodayAppointments: async (req, res) => {
        try {
            // Get today's date in YYYY-MM-DD format
            const today = new Date();
            const todayString = today.toISOString().split('T')[0];
            
            console.log('Fetching appointments for today:', todayString);
            
            // Find appointments for today that are approved and have video call links
            const todayAppointments = await Appoinment.find({
                date: todayString,
                status: 'approved',
                videoCallGenerated: true
            }).populate('doctor', 'name specialization experience rating').sort({ time: 1 });
            
            // Transform the data to match frontend expectations
            const transformedAppointments = todayAppointments.map(appointment => ({
                id: appointment._id,
                _id: appointment._id,
                name: appointment.name,
                email: appointment.email,
                phone: appointment.phone,
                number: appointment.phone,
                age: appointment.age,
                location: appointment.location,
                doctor: appointment.doctor?._id || appointment.doctor,
                doctorName: appointment.doctor?.name || appointment.doctorName || 'Unknown Doctor',
                doctorSpecialization: appointment.doctor?.specialization || 'N/A',
                doctorExperience: appointment.doctor?.experience || 'N/A',
                doctorRating: appointment.doctor?.rating || 'N/A',
                slot: appointment.slot,
                status: appointment.status,
                time: appointment.time,
                date: appointment.date,
                paymentStatus: appointment.paymentStatus,
                paymentCompletedAt: appointment.paymentCompletedAt,
                receiptUploaded: appointment.receiptUploaded,
                receiptFile: appointment.receiptFile,
                payment: appointment.payment,
                appointmentId: appointment.appointmentId,
                videoCallLink: appointment.videoCallLink,
                videoCallId: appointment.videoCallId,
                videoCallGenerated: appointment.videoCallGenerated,
                createdAt: appointment.createdAt,
                updatedAt: appointment.updatedAt
            }));
            
            console.log(`Today's appointments fetched: ${transformedAppointments.length} appointments`);
            
            res.status(200).json({
                success: true,
                data: transformedAppointments,
                count: transformedAppointments.length,
                date: todayString,
                message: `Today's appointments fetched successfully`
            });
        } catch (error) {
            console.error('Error fetching today\'s appointments:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch today\'s appointments',
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
                doctorName: appointment.doctorName,
                slot: appointment.slot,
                status: appointment.status || 'pending',
                time: appointment.time,
                date: appointment.date,
                paymentStatus: appointment.paymentStatus,
                paymentCompletedAt: appointment.paymentCompletedAt,
                receiptUploaded: appointment.receiptUploaded,
                receiptFile: appointment.receiptFile,
                payment: appointment.payment,
                appointmentId: appointment.appointmentId,
                videoCallLink: appointment.videoCallLink,
                videoCallId: appointment.videoCallId,
                videoCallGenerated: appointment.videoCallGenerated,
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
    },

    // Get video call details by video call ID
    getVideoCallDetails: async (req, res) => {
        try {
            const { videoCallId } = req.params;
            
            if (!videoCallId) {
                return res.status(400).json({
                    success: false,
                    message: 'Video call ID is required'
                });
            }

            // Find appointment by video call ID
            const appointment = await Appoinment.findOne({ 
                videoCallId: videoCallId,
                status: 'approved',
                videoCallGenerated: true 
            }).populate('doctor', 'name specialization experience rating');

            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Video call session not found or not authorized'
                });
            }

            // Check if appointment is for today
            const today = new Date().toISOString().split('T')[0];
            if (appointment.date !== today) {
                return res.status(403).json({
                    success: false,
                    message: 'Video call is only available on the appointment date'
                });
            }

            const appointmentDetails = {
                id: appointment._id,
                name: appointment.name,
                phone: appointment.phone,
                age: appointment.age,
                location: appointment.location,
                doctorName: appointment.doctor?.name || appointment.doctorName || 'Unknown Doctor',
                doctorSpecialization: appointment.doctor?.specialization || 'N/A',
                time: appointment.time,
                date: appointment.date,
                videoCallId: appointment.videoCallId,
                videoCallLink: appointment.videoCallLink,
                status: appointment.status
            };
            
            res.status(200).json({
                success: true,
                data: appointmentDetails,
                message: 'Video call details retrieved successfully'
            });
        } catch (error) {
            console.error('Error fetching video call details:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch video call details',
                error: error.message
            });
        }
    }
}
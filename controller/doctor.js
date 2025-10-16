const Doctor = require('../models/doctor');
const Appointment = require('../models/appoiment');
const { sendDoctorApprovalEmail } = require('../utils/mailer');
const axios = require('axios');

module.exports = {
    
    // Get all doctors
    getAllDoctors: async (req, res) => {
        try {
            const doctors = await Doctor.find({ isActive: true, available: true });
            return res.status(200).json({ 
                success: true, 
                count: doctors.length, 
                doctors 
            });
        } catch (error) {
            console.error('[getAllDoctors] Error:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Error fetching doctors', 
                error: error.message 
            });
        }
    },

    // Get doctor by ID
    getDoctorById: async (req, res) => {
        try {
            const { id } = req.params;
            
            const doctor = await Doctor.findById(id);
            if (!doctor || !doctor.isActive) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Doctor not found' 
                });
            }
            
            return res.status(200).json({ 
                success: true, 
                doctor 
            });
        } catch (error) {
            console.error('[getDoctorById] Error:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Error fetching doctor', 
                error: error.message 
            });
        }
    },

    // Get doctor by email
    getDoctorByEmail: async (req, res) => {
        console.log(req.params,'vbnm,');


        try {
            const { email } = req.params;
            
            const doctor = await Doctor.findOne({ email: email.toLowerCase() });
            if (!doctor || !doctor.isActive) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Doctor not found' 
                });
            }
            
            console.log(doctor,'doctor');
            
            return res.status(200).json({ 
                success: true, 
                doctor 
            });
        } catch (error) {
            console.error('[getDoctorByEmail] Error:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Error fetching doctor', 
                error: error.message 
            });
        }
    },

    // Create new doctor
    createDoctor: async (req, res) => {
        console.log("hello")
        try {
            const { name, email, specialization, phone, experience, available, age, gender, address, bio } = req.body;
            console.log(req.body,'data gooted')
            
            // Validate required fields
            if (!name || !specialization || !phone || !experience ) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: name, specialization, phone, and experience are required'
                });
            }
            
            // Validate phone number format
            if (!/^\d{10}$/.test(phone)) {
                return res.status(400).json({
                    success: false,
                    message: 'Phone number must be exactly 10 digits'
                });
            }
            
            // Validate experience
            if (isNaN(experience) || parseInt(experience) < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Experience must be a positive number'
                });
            }
            
            // Check if phone number already exists
            const existingPhone = await Doctor.findOne({ phone: phone });
            if (existingPhone) {
                return res.status(400).json({
                    success: false,
                    message: 'Phone number already exists for another doctor'
                });
            }
            
            // Check if email already exists (only if email is provided)
            if (email) {
                const existingEmail = await Doctor.findOne({ email: email });
                if (existingEmail) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email already exists for another doctor'
                    });
                }
            }
            
            // Generate a default password for new doctors (they can change it later)
            const defaultPassword = 'doctor123'; // You might want to generate a random password
            const bcrypt = require('bcryptjs');
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);
            
            // Check if image was uploaded
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Profile image is required'
                });
            }
            
            // Create doctor data object
            const doctorData = {
                name: name.trim(),
                specialization: specialization.trim(),
                phone: phone.trim(),
                experience: parseInt(experience),
                available: available === 'true' || available === true,
                password: hashedPassword,
                profilePicture: req.file.path, // Store the file path
                isActive: false, // New doctors are inactive by default
         
            };
            
            // Add optional fields if provided
            if (email) doctorData.email = email.trim().toLowerCase();
            if (age) doctorData.age = parseInt(age);
            if (gender) doctorData.gender = gender;
            if (address) doctorData.address = address.trim();
            if (bio) doctorData.bio = bio.trim();     
            // Create new doctor
            const newDoctor = new Doctor(doctorData);
            const savedDoctor = await newDoctor.save();
            
            return res.status(201).json({
                success: true,
                message: 'Doctor created successfully',
                doctor: savedDoctor
            });
            
        } catch (error) {
            console.error('[createDoctor] Error:', error);
            
            // Handle validation errors
            if (error.name === 'ValidationError') {
                const validationErrors = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: validationErrors
                });
            }
            
            // Handle duplicate key errors
            if (error.code === 11000) {
                const field = Object.keys(error.keyValue)[0];
                return res.status(400).json({
                    success: false,
                    message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
                });
            }
            
            return res.status(500).json({
                success: false,
                message: 'Error creating doctor',
                error: error.message
            });
        }
    },

    // Doctor login
    loginDoctor: async (req, res) => {
        try {
            const { email, password } = req.body;
            

            // Validate required fields
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and phone number (password) are required'
                });
            }
            
            // Find doctor by email
            const doctor = await Doctor.findOne({ email: email.toLowerCase() });
            if (!doctor) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or phone number. Please check your credentials.'
                });
            }
            
            // Check if doctor is approved
            if (!doctor.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Please contact administration to approve your account before logging in.'
                });
            }
            
            // Verify phone number (password) - direct comparison since phone is the password
            if (doctor.phone !== password) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or phone number. Please check your credentials.'
                });
            }
            
            // Create response object (exclude password)
            const doctorResponse = {
                _id: doctor._id,
                name: doctor.name,
                email: doctor.email,
                specialization: doctor.specialization,
                phone: doctor.phone,
                experience: doctor.experience,
                patients: doctor.patients,
                rating: doctor.rating,
                available: doctor.available,
                profilePicture: doctor.profilePicture,
                qualification: doctor.qualification,
                designation: doctor.designation,
                department: doctor.department,
                age: doctor.age,
                gender: doctor.gender,
                address: doctor.address,
                bio: doctor.bio,
                consultationFee: doctor.consultationFee,
                availableSlots: doctor.availableSlots,
                isActive: doctor.isActive,
                createdAt: doctor.createdAt,
                updatedAt: doctor.updatedAt
            };
            
            return res.status(200).json({
                success: true,
                message: 'Login successful',
                doctor: doctorResponse
            });
            
        } catch (error) {
            console.error('[loginDoctor] Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error during login',
                error: error.message
            });
        }
    },

    // Update doctor
    updateDoctor: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, email, specialization, phone, experience, patients, rating, available } = req.body;
            
            // Build update object with only provided fields
            const updateData = { updatedAt: Date.now() };
            
            if (name) updateData.name = name;
            if (email !== undefined) updateData.email = email; // Allow setting email to null
            if (specialization) updateData.specialization = specialization;
            if (phone) updateData.phone = phone;
            if (experience) updateData.experience = parseInt(experience);
            if (patients !== undefined) updateData.patients = parseInt(patients);
            if (rating !== undefined) updateData.rating = parseFloat(rating);
            if (available !== undefined) updateData.available = available;
            
            // Check if phone number already exists for another doctor
            if (phone) {
                const existingDoctor = await Doctor.findOne({ phone: phone, _id: { $ne: id } });
                if (existingDoctor) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Phone number already exists for another doctor' 
                    });
                }
            }
            
            // Check if email already exists for another doctor (only if email is provided and not null)
            if (email) {
                const existingEmailDoctor = await Doctor.findOne({ email: email, _id: { $ne: id } });
                if (existingEmailDoctor) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Email already exists for another doctor' 
                    });
                }
            }
            
            const updatedDoctor = await Doctor.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true, runValidators: true }
            );
            
            if (!updatedDoctor) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Doctor not found' 
                });
            }
            
            return res.status(200).json({ 
                success: true, 
                message: 'Doctor updated successfully', 
                doctor: updatedDoctor 
            });
        } catch (error) {
            console.error('[updateDoctor] Error:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Error updating doctor', 
                error: error.message 
            });
        }
    },

    // Delete doctor (soft delete)
    deleteDoctor: async (req, res) => {
        try {
            const { id } = req.params;
            
            const deletedDoctor = await Doctor.findByIdAndUpdate(
                id,
                { $set: { isActive: false, available: false, updatedAt: Date.now() } },
                { new: true }
            );
            
            if (!deletedDoctor) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Doctor not found' 
                });
            }
            
            return res.status(200).json({ 
                success: true, 
                message: 'Doctor deleted successfully' 
            });
        } catch (error) {
            console.error('[deleteDoctor] Error:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Error deleting doctor', 
                error: error.message 
            });
        }
    },

    // Get doctors by specialization
    getDoctorsBySpecialization: async (req, res) => {
        try {
            const { specialization } = req.params;
            
            const doctors = await Doctor.find({ 
                specialization: new RegExp(specialization, 'i'), 
                isActive: true,
                available: true 
            });
            
            return res.status(200).json({ 
                success: true, 
                count: doctors.length, 
                doctors 
            });
        } catch (error) {
            console.error('[getDoctorsBySpecialization] Error:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Error fetching doctors by specialization', 
                error: error.message 
            });
        }
    },

    // Get all doctors for admin (including unavailable and pending approval)
    getAllDoctorsAdmin: async (req, res) => {
        try {
            const doctors = await Doctor.find({}); // Get all doctors regardless of status
            return res.status(200).json({ 
                success: true, 
                count: doctors.length, 
                doctors 
            });
        } catch (error) {
            console.error('[getAllDoctorsAdmin] Error:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Error fetching doctors for admin', 
                error: error.message 
            });
        }
    },

    // Get all doctors for registration form (all-docters endpoint)
    getAllDoctorsForForm: async (req, res) => {
        try {
            const doctors = await Doctor.find({ isActive: true, available: true })
                .select('name specialization experience rating')
                .sort({ name: 1 });
            
            return res.status(200).json({ 
                success: true, 
                count: doctors.length, 
                data: doctors 
            });
        } catch (error) {
            console.error('[getAllDoctorsForForm] Error:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Error fetching doctors for form', 
                error: error.message 
            });
        }
    },

    // Approve doctor
    approveDoctor: async (req, res) => {
        try {
            const { id } = req.params;
            
            const updatedDoctor = await Doctor.findByIdAndUpdate(
                id,
                { $set: { isActive:true, updatedAt: Date.now() } },
                { new: true }
            );
            
            if (!updatedDoctor) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Doctor not found' 
                });
            }
            
            // Send approval email to the doctor
            try {
                await sendDoctorApprovalEmail(updatedDoctor.email, updatedDoctor.name);
                console.log('Doctor approval email sent successfully');
            } catch (emailError) {
                console.error('Error sending approval email:', emailError);
                // Don't fail the approval if email fails
            }
            
            return res.status(200).json({ 
                success: true, 
                message: 'Doctor approved successfully',
                doctor: updatedDoctor
            });
        } catch (error) {
            console.error('[approveDoctor] Error:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Error approving doctor', 
                error: error.message 
            });
        }
    },

    // Get doctor income
    getDoctorIncome: async (req, res) => {
        try {
            const { id } = req.params;
            
            // Verify doctor exists
            const doctor = await Doctor.findById(id);
            if (!doctor || !doctor.isActive) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Doctor not found' 
                });
            }

            // Get current date ranges
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfYear = new Date(now.getFullYear(), 0, 1);

            // Previous periods for growth calculation
            const previousDay = new Date(startOfDay);
            previousDay.setDate(previousDay.getDate() - 1);
            
            const previousWeek = new Date(startOfWeek);
            previousWeek.setDate(previousWeek.getDate() - 7);
            
            const previousMonth = new Date(startOfMonth);
            previousMonth.setMonth(previousMonth.getMonth() - 1);
            
            const previousYear = new Date(startOfYear);
            previousYear.setFullYear(previousYear.getFullYear() - 1);

            // Helper function to calculate income for a date range
            const calculateIncome = async (startDate, endDate) => {
                const appointments = await Appointment.find({
                    doctor: id,
                    paymentStatus: 'completed',
                    paymentCompletedAt: {
                        $gte: startDate,
                        $lt: endDate
                    }
                });
                
                return appointments.reduce((total, appointment) => total + (appointment.amount || 0), 0);
            };

            // Calculate current period incomes
            const dailyIncome = await calculateIncome(startOfDay, new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000));
            const weeklyIncome = await calculateIncome(startOfWeek, new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000));
            const monthlyIncome = await calculateIncome(startOfMonth, new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 1));
            const yearlyIncome = await calculateIncome(startOfYear, new Date(startOfYear.getFullYear() + 1, 0, 1));

            // Calculate previous period incomes for growth
            const previousDailyIncome = await calculateIncome(previousDay, startOfDay);
            const previousWeeklyIncome = await calculateIncome(previousWeek, startOfWeek);
            const previousMonthlyIncome = await calculateIncome(previousMonth, startOfMonth);
            const previousYearlyIncome = await calculateIncome(previousYear, startOfYear);

            // Calculate growth percentages
            const calculateGrowth = (current, previous) => {
                if (previous === 0) return current > 0 ? 100 : 0;
                return Math.round(((current - previous) / previous) * 100);
            };

            const dailyGrowth = calculateGrowth(dailyIncome, previousDailyIncome);
            const weeklyGrowth = calculateGrowth(weeklyIncome, previousWeeklyIncome);
            const monthlyGrowth = calculateGrowth(monthlyIncome, previousMonthlyIncome);
            const yearlyGrowth = calculateGrowth(yearlyIncome, previousYearlyIncome);

            // Generate weekly chart data (last 7 days)
            const weeklyChart = [];
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            
            for (let i = 6; i >= 0; i--) {
                const dayStart = new Date(now);
                dayStart.setDate(dayStart.getDate() - i);
                dayStart.setHours(0, 0, 0, 0);
                
                const dayEnd = new Date(dayStart);
                dayEnd.setHours(23, 59, 59, 999);
                
                const dayIncome = await calculateIncome(dayStart, dayEnd);
                weeklyChart.push({
                    name: dayNames[dayStart.getDay()],
                    income: dayIncome
                });
            }

            // Generate monthly chart data (last 12 months)
            const monthlyChart = [];
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            for (let i = 11; i >= 0; i--) {
                const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
                
                const monthIncome = await calculateIncome(monthStart, monthEnd);
                monthlyChart.push({
                    name: monthNames[monthStart.getMonth()],
                    income: monthIncome
                });
            }

            const incomeData = {
                daily: dailyIncome,
                dailyGrowth: dailyGrowth,
                weekly: weeklyIncome,
                weeklyGrowth: weeklyGrowth,
                monthly: monthlyIncome,
                monthlyGrowth: monthlyGrowth,
                yearly: yearlyIncome,
                yearlyGrowth: yearlyGrowth,
                weeklyChart: weeklyChart,
                monthlyChart: monthlyChart
            };
            
            return res.status(200).json({ 
                success: true, 
                incomeData 
            });
        } catch (error) {
            console.error('[getDoctorIncome] Error:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Error fetching doctor income', 
                error: error.message 
            });
        }
    }, 

    // Available Slots Management
    createAvailableSlots: async (req, res) => {
        try {
        
            const { doctorId, date, slots } = req.body;
            
            // Debug logging
            console.log('[createAvailableSlots] Received data:', {
                doctorId,
                date,
                slots,
                timestamp: new Date().toISOString()
            });
            
            if (!doctorId || !date || !slots || !Array.isArray(slots)) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: doctorId, date, and slots array'
                });
            }

            // Validate doctor exists
            const doctor = await Doctor.findById(doctorId);
            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor not found'
                });
            }

            // Normalize slots payload to expected shape
            const normalizedSlots = Array.isArray(slots)
                ? slots.map(s => ({
                    startTime: s.startTime,
                    endTime: s.endTime,
                    isAvailable: s.isAvailable !== false
                }))
                : [];

            // Update Map field via dynamic path to ensure persistence
            await Doctor.findByIdAndUpdate(
                doctorId,
                { $set: { [`availableSlots.${date}`]: normalizedSlots } },
                { new: true }
            );

            // Debug logging after save
            console.log('[createAvailableSlots] Data saved successfully:', {
                doctorId,
                date,
                slotsCount: normalizedSlots.length,
                timestamp: new Date().toISOString()
            });

			// Optional webhook notification (non-blocking)
			try {
				const webhookUrl = process.env.SLOTS_UPDATED_WEBHOOK_URL;
				if (webhookUrl) {
					await axios.post(webhookUrl, {
						event: 'doctor.slots.created',
						payload: { doctorId, date, slots }
					}, { timeout: 3000 });
				}
			} catch (notifyErr) {
				console.warn('[createAvailableSlots] Webhook notify failed:', notifyErr.message);
			}

            console.log('data saved')
            return res.status(201).json({
                success: true,
                message: 'Available slots created successfully',
                data: { date, slots }
            });
        } catch (error) {
            console.error('[createAvailableSlots] Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error creating available slots',
                error: error.message
            });
        }
    },

    getAvailableSlots: async (req, res) => {
        try {
            const { id, date } = req.params;
            
            // Debug logging
            console.log('[getAvailableSlots] Request params:', {
                doctorId: id,
                date,
                timestamp: new Date().toISOString()
            });
            
            const doctor = await Doctor.findById(id);
            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor not found'
                });
            }

            const availableSlots = doctor.availableSlots;
            let slots = [];
            if (availableSlots && typeof availableSlots.get === 'function') {
                // Mongoose Map
                slots = availableSlots.get(date) || [];
            } else if (availableSlots && typeof availableSlots === 'object') {
                // Plain object fallback
                slots = availableSlots[date] || [];
            }

            // Debug logging
            console.log('[getAvailableSlots] Retrieved data:', {
                doctorId: id,
                requestedDate: date,
                foundSlots: slots.length,
                allAvailableDates: availableSlots ? Object.keys(availableSlots) : [],
                timestamp: new Date().toISOString()
            });

            return res.status(200).json({
                success: true,
                slots: slots,
                date: date
            });
        } catch (error) {
            console.error('[getAvailableSlots] Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching available slots',
                error: error.message
            });
        }
    },

    updateAvailableSlots: async (req, res) => {
        try {
            const { id, date } = req.params;
            const { slots } = req.body;
            
            if (!slots || !Array.isArray(slots)) {
                return res.status(400).json({
                    success: false,
                    message: 'Slots array is required'
                });
            }

            const doctor = await Doctor.findById(id);
            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor not found'
                });
            }

            const existingSlots = doctor.availableSlots || {};
            existingSlots[date] = slots;

            await Doctor.findByIdAndUpdate(id, {
                availableSlots: existingSlots
            });

            return res.status(200).json({
                success: true,
                message: 'Available slots updated successfully',
                data: { date, slots }
            });
        } catch (error) {
            console.error('[updateAvailableSlots] Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error updating available slots',
                error: error.message
            });
        }
    },

    deleteAvailableSlots: async (req, res) => {
        try {
            const { id, date } = req.params;
            
            const doctor = await Doctor.findById(id);
            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor not found'
                });
            }

            const existingSlots = doctor.availableSlots || {};
            delete existingSlots[date];

            await Doctor.findByIdAndUpdate(id, {
                availableSlots: existingSlots
            });

            return res.status(200).json({
                success: true,
                message: 'Available slots deleted successfully'
            });
        } catch (error) {
            console.error('[deleteAvailableSlots] Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error deleting available slots',
                error: error.message
            });
        }
    }
}; 

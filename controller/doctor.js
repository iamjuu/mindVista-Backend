const Doctor = require('../models/doctor');

module.exports = {
    
    // Test function
    test: async (req, res) => {
        try {
            console.log('[test] Test endpoint called');
            return res.status(200).json({ 
                success: true, 
                message: 'Doctor controller is working!',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('[test] Error:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Error in test endpoint', 
                error: error.message 
            });
        }
    },
    
    // Get all doctors
    getAllDoctors: async (req, res) => {
        try {
            console.log('[getAllDoctors] Fetching all doctors');
            const doctors = await Doctor.find({ isActive: true, available: true });
            console.log('[getAllDoctors] Found active and available doctors:', doctors.length);
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
            console.log('[getDoctorById] Fetching doctor with ID:', id);
            
            const doctor = await Doctor.findById(id);
            if (!doctor || !doctor.isActive) {
                console.log('[getDoctorById] Doctor not found or inactive:', id);
                return res.status(404).json({ 
                    success: false, 
                    message: 'Doctor not found' 
                });
            }
            
            console.log('[getDoctorById] Doctor found:', doctor.name);
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

    // Create new doctor
    createDoctor: async (req, res) => {
        try {
            console.log('[createDoctor] ===== START =====');
            console.log('[createDoctor] Request body:', req.body);
            console.log('[createDoctor] Request file:', req.file);
            console.log('[createDoctor] Request headers:', req.headers);
            console.log('[createDoctor] Content-Type:', req.headers['content-type']);
            
            const { name, email, specialization, phone, experience, patients, rating, available } = req.body;
            
            console.log('[createDoctor] Extracted fields:');
            console.log('  - name:', name, typeof name);
            console.log('  - email:', email, typeof email);
            console.log('  - specialization:', specialization, typeof specialization);
            console.log('  - phone:', phone, typeof phone);
            console.log('  - experience:', experience, typeof experience);
            console.log('  - patients:', patients, typeof patients);
            console.log('  - rating:', rating, typeof rating);
            console.log('  - available:', available, typeof available);
            
            // Validate required fields
            if (!name || !specialization || !phone || !experience) {
                console.log('[createDoctor] Missing required fields');
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: name, specialization, phone, and experience are required'
                });
            }
            
            // Validate phone number format
            if (!/^\d{10}$/.test(phone)) {
                console.log('[createDoctor] Invalid phone number format:', phone);
                return res.status(400).json({
                    success: false,
                    message: 'Phone number must be exactly 10 digits'
                });
            }
            
            // Validate experience
            if (isNaN(experience) || parseInt(experience) < 0) {
                console.log('[createDoctor] Invalid experience:', experience);
                return res.status(400).json({
                    success: false,
                    message: 'Experience must be a positive number'
                });
            }
            
            // Check if phone number already exists
            const existingPhone = await Doctor.findOne({ phone: phone });
            if (existingPhone) {
                console.log('[createDoctor] Phone number already exists:', phone);
                return res.status(400).json({
                    success: false,
                    message: 'Phone number already exists for another doctor'
                });
            }
            
            // Check if email already exists (only if email is provided)
            if (email) {
                const existingEmail = await Doctor.findOne({ email: email });
                if (existingEmail) {
                    console.log('[createDoctor] Email already exists:', email);
                    return res.status(400).json({
                        success: false,
                        message: 'Email already exists for another doctor'
                    });
                }
            }
            
            // Check if image was uploaded
            if (!req.file) {
                console.log('[createDoctor] No image file received');
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
                profilePicture: req.file.path // Store the file path
            };
            
            // Add optional fields if provided
            if (email) doctorData.email = email.trim().toLowerCase();
            if (patients !== undefined && patients !== '') doctorData.patients = parseInt(patients);
            if (rating !== undefined && rating !== '') doctorData.rating = parseFloat(rating);
            
            console.log('[createDoctor] Final doctor data to save:', doctorData);
            
            // Create new doctor
            const newDoctor = new Doctor(doctorData);
            const savedDoctor = await newDoctor.save();
            
            console.log('[createDoctor] Doctor created successfully:', savedDoctor.name);
            console.log('[createDoctor] ===== END =====');
            
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

    // Update doctor
    updateDoctor: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, email, specialization, phone, experience, patients, rating, available } = req.body;
            console.log('[updateDoctor] Updating doctor with ID:', id);
            console.log('[updateDoctor] Update data:', { 
                name, email, specialization, phone, experience, patients, rating, available 
            });
            
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
                console.log('[updateDoctor] Checking for duplicate phone number:', phone);
                const existingDoctor = await Doctor.findOne({ phone: phone, _id: { $ne: id } });
                if (existingDoctor) {
                    console.log('[updateDoctor] Phone number already exists for another doctor:', phone);
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Phone number already exists for another doctor' 
                    });
                }
            }
            
            // Check if email already exists for another doctor (only if email is provided and not null)
            if (email) {
                console.log('[updateDoctor] Checking for duplicate email:', email);
                const existingEmailDoctor = await Doctor.findOne({ email: email, _id: { $ne: id } });
                if (existingEmailDoctor) {
                    console.log('[updateDoctor] Email already exists for another doctor:', email);
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
                console.log('[updateDoctor] Doctor not found:', id);
                return res.status(404).json({ 
                    success: false, 
                    message: 'Doctor not found' 
                });
            }
            
            console.log('[updateDoctor] Doctor updated successfully:', updatedDoctor.name);
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
            console.log('[deleteDoctor] Deleting doctor with ID:', id);
            
            const deletedDoctor = await Doctor.findByIdAndUpdate(
                id,
                { $set: { isActive: false, available: false, updatedAt: Date.now() } },
                { new: true }
            );
            
            if (!deletedDoctor) {
                console.log('[deleteDoctor] Doctor not found:', id);
                return res.status(404).json({ 
                    success: false, 
                    message: 'Doctor not found' 
                });
            }
            
            console.log('[deleteDoctor] Doctor deleted successfully:', deletedDoctor.name);
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
            console.log('[getDoctorsBySpecialization] Fetching doctors for specialization:', specialization);
            
            const doctors = await Doctor.find({ 
                specialization: new RegExp(specialization, 'i'), 
                isActive: true,
                available: true 
            });
            
            console.log('[getDoctorsBySpecialization] Found available doctors:', doctors.length);
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

    // Get all doctors for admin (including unavailable)
    getAllDoctorsAdmin: async (req, res) => {
        try {
            console.log('[getAllDoctorsAdmin] Fetching all doctors for admin');
            const doctors = await Doctor.find({ isActive: true });
            console.log('[getAllDoctorsAdmin] Found doctors:', doctors.length);
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
    }
}; 

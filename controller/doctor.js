const Doctor = require('../models/doctor');

module.exports = {
    
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
            console.log('[createDoctor] Function called - Starting doctor creation process');
            const { name, email, specialization, phone, experience, patients, rating, available } = req.body;
            console.log('[createDoctor] Creating new doctor with data:', { 
                name, email, specialization, phone, experience, patients, rating, available 
            });
            
            // Validate required fields
            console.log('[createDoctor] Validating required fields');
            if (!name || !specialization || !phone || !experience) {
                console.log('[createDoctor] Validation failed - Missing required fields');
                return res.status(400).json({ 
                    success: false, 
                    message: 'Missing required fields: name, specialization, phone, experience' 
                });
            }
            console.log('[createDoctor] Required fields validation passed');
            
            // Check if doctor with same phone already exists
            console.log('[createDoctor] Checking for duplicate phone number:', phone);
            const existingDoctor = await Doctor.findOne({ phone: phone });
            if (existingDoctor) {
                console.log('[createDoctor] Duplicate check failed - Doctor with phone already exists:', phone);
                return res.status(400).json({ 
                    success: false, 
                    message: 'Doctor with this phone number already exists' 
                });
            }
            console.log('[createDoctor] Duplicate check passed - Phone number is unique');
            
            // Check if email is provided and if it already exists
            if (email) {
                console.log('[createDoctor] Checking for duplicate email:', email);
                const existingEmailDoctor = await Doctor.findOne({ email: email });
                if (existingEmailDoctor) {
                    console.log('[createDoctor] Duplicate check failed - Doctor with email already exists:', email);
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Doctor with this email already exists' 
                    });
                }
                console.log('[createDoctor] Email duplicate check passed - Email is unique');
            }
            
            // Create doctor data object
            console.log('[createDoctor] Building doctor data object');
            const doctorData = {
                name,
                specialization,
                phone,
                experience: parseInt(experience),
                patients: patients ? parseInt(patients) : 0,
                rating: rating ? parseFloat(rating) : 0,
                available: available !== undefined ? available : true
            };
            
            // Add email to doctorData only if it's provided
            if (email) {
                doctorData.email = email;
            }
            
            console.log('[createDoctor] Doctor data object created:', doctorData);
            
            console.log('[createDoctor] Saving doctor to database');
            const newDoctor = new Doctor(doctorData);
            await newDoctor.save();
            
            console.log('[createDoctor] Doctor created successfully with ID:', newDoctor._id);
            console.log('[createDoctor] Returning success response');
            return res.status(201).json({ 
                success: true, 
                message: 'Doctor created successfully', 
                doctor: newDoctor 
            });
        } catch (error) {
            console.error('[createDoctor] Error occurred during doctor creation:', error);
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
const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Ensure uploads/doctors directory exists
const uploadsDir = path.join(__dirname, '../uploads/doctors');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for doctor image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'doctor-' + uniqueSuffix + '.' + file.originalname.split('.').pop())
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'File upload error: ' + error.message
    });
  } else if (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  next();
};

const DoctorController = require('../controller/doctor');

// Test route to verify router is working
router.get('/test', (req, res) => {
  res.json({ message: 'Doctor router is working!' });
});

// Test route to verify controller is working
router.get('/test-controller', DoctorController.test);

// Logging middleware for debugging
const logRequest = (req, res, next) => {
  console.log('[Doctor Router] Request received:', {
    method: req.method,
    url: req.url,
    contentType: req.headers['content-type'],
    body: req.body,
    file: req.file
  });
  next();
};

// Create a new doctor
router.post('/add-doctor', logRequest, upload.single('image'), handleMulterError, DoctorController.createDoctor);
// Get all doctors
router.get('/doctors', DoctorController.getAllDoctors);

// Get doctor by ID
router.get('/doctors/:id', DoctorController.getDoctorById);



// Update a doctor
router.put('/doctor-update/:id', DoctorController.updateDoctor);

// Delete a doctor (soft delete)
router.delete('/doctor-delete/:id', DoctorController.deleteDoctor);

// Get doctors by specialization
router.get('/doctors/specialization/:specialization', DoctorController.getDoctorsBySpecialization);

// Get all doctors for admin (including unavailable)
router.get('/doctors/admin/all', DoctorController.getAllDoctorsAdmin);

module.exports = router; 
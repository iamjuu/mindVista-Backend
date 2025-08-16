const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Base uploads directory
const baseUploadsDir = path.join(__dirname, '../uploads');

// Ensure base uploads directory exists
if (!fs.existsSync(baseUploadsDir)) {
  fs.mkdirSync(baseUploadsDir, { recursive: true });
}

// Multer configuration for different upload types
const multerConfig = {
  // Doctor image upload configuration
  doctor: {
    destination: path.join(baseUploadsDir, 'doctors'),
    filename: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `doctor-${uniqueSuffix}${path.extname(file.originalname)}`;
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
      files: 1
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for doctor profiles!'), false);
      }
    }
  },

  // Profile image upload configuration
  profile: {
    destination: path.join(baseUploadsDir, 'profiles'),
    filename: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `profile-${uniqueSuffix}${path.extname(file.originalname)}`;
    },
    limits: {
      fileSize: 3 * 1024 * 1024, // 3MB
      files: 1
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for profile pictures!'), false);
      }
    }
  },

  // Document upload configuration
  document: {
    destination: path.join(baseUploadsDir, 'documents'),
    filename: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `doc-${uniqueSuffix}${path.extname(file.originalname)}`;
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 5
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/jpg'
      ];
      
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only PDF, Word, and image files are allowed!'), false);
      }
    }
  }
};

// Create multer instances for different upload types
const createMulterInstance = (type) => {
  const config = multerConfig[type];
  
  if (!config) {
    throw new Error(`Unknown upload type: ${type}`);
  }

  // Ensure destination directory exists
  if (!fs.existsSync(config.destination)) {
    fs.mkdirSync(config.destination, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, config.destination);
    },
    filename: (req, file, cb) => {
      cb(null, config.filename(req, file));
    }
  });

  return multer({
    storage: storage,
    limits: config.limits,
    fileFilter: config.fileFilter
  });
};

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `File size too large. Maximum size is ${Math.round(error.limit / (1024 * 1024))}MB.`
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: `Too many files. Maximum allowed is ${error.limit}.`
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

// Export specific upload instances
module.exports = {
  // Doctor upload (single image)
  doctorUpload: createMulterInstance('doctor').single('image'),
  
  // Profile upload (single image)
  profileUpload: createMulterInstance('profile').single('image'),
  
  // Document upload (multiple files)
  documentUpload: createMulterInstance('document').array('documents', 5),
  
  // Error handling middleware
  handleMulterError,
  
  // Configuration for custom usage
  createMulterInstance,
  
  // Get upload paths
  getUploadPaths: () => ({
    doctors: multerConfig.doctor.destination,
    profiles: multerConfig.profile.destination,
    documents: multerConfig.document.destination
  })
};

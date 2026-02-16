const multer = require('multer');
const fs = require('fs');
const path = require('path');
const os = require('os');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Vercel serverless: filesystem is read-only except /tmp — use /tmp for any disk uploads
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';

// Cloudinary config from env (never put API secret in code)
const useCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Base uploads directory (used when Cloudinary is not configured)
// On Vercel use /tmp so mkdirSync doesn't fail (read-only filesystem elsewhere)
const baseUploadsDir = isVercel
  ? path.join(os.tmpdir(), 'mindvista-uploads')
  : path.join(__dirname, '../uploads');

// Ensure base uploads directory exists (only create if writable; on Vercel /tmp is writable)
if (!fs.existsSync(baseUploadsDir)) {
  try {
    fs.mkdirSync(baseUploadsDir, { recursive: true });
  } catch (err) {
    if (!isVercel) throw err;
    // On Vercel we should have used /tmp; if still failing, avoid crashing
    console.warn('multer: could not create baseUploadsDir:', err.message);
  }
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

// Cloudinary folder names per upload type
const cloudinaryFolders = {
  doctor: 'mindvista/doctors',
  profile: 'mindvista/profiles',
  document: 'mindvista/documents'
};

function getStorage(type) {
  const config = multerConfig[type];
  const folder = cloudinaryFolders[type];

  if (useCloudinary) {
    const allowedFormats = type === 'document'
      ? ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx']
      : ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    return new CloudinaryStorage({
      cloudinary,
      params: {
        folder,
        allowed_formats: allowedFormats,
        resource_type: 'auto'
      }
    });
  }

  // Fallback: disk storage
  if (!fs.existsSync(config.destination)) {
    fs.mkdirSync(config.destination, { recursive: true });
  }
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, config.destination),
    filename: (req, file, cb) => cb(null, config.filename(req, file))
  });
}

// Create multer instances for different upload types
const createMulterInstance = (type) => {
  const config = multerConfig[type];
  
  if (!config) {
    throw new Error(`Unknown upload type: ${type}`);
  }

  const storage = getStorage(type);

  return multer({
    storage,
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
// When Cloudinary is used, req.file.path is the image URL; when not, it's the local file path.
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
  
  // True when uploads go to Cloudinary (credentials in .env)
  useCloudinary,
  
  // Get upload paths (local paths when not using Cloudinary)
  getUploadPaths: () => ({
    doctors: multerConfig.doctor.destination,
    profiles: multerConfig.profile.destination,
    documents: multerConfig.document.destination
  })
};

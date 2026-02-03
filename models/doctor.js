const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  // Basic doctor information
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // This allows multiple null values while maintaining uniqueness for non-null values
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  specialization: {
    type: String,
    required: true,
    trim: true
  },
  
  // Professional details
  experience: {
    type: Number,
    required: true,
    min: 0
  }, 
  available: {
    type: Boolean,
    default: true
  }, // availability status
  
  // Personal details
  age: Number,
  gender: String,
  address: String,
  profilePicture: {
    type: String,
    default: null
  }, // Store the image file path
  bio: String,
  
  availableSlots: {
    type: Map,
    of: [{
      startTime: String,
      endTime: String,
      isAvailable: {
        type: Boolean,
        default: true
      }
    }],
    default: {}
  },
  
  // Authentication
  password: {
    type: String,
    required: true,
    trim: true
  },
  selary:{
    type:Number,
    default:0
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: false,
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
DoctorSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
DoctorSchema.index({ specialization: 1, available: 1 });
DoctorSchema.index({ phone: 1 });
DoctorSchema.index({ email: 1 });

const Doctor = mongoose.model('Doctor', DoctorSchema);

module.exports = Doctor; 
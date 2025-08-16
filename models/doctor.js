const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  // Basic doctor information
  name: {
    type: String,
    required: true,
    trim: true
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
  qualification: String,
  experience: {
    type: Number,
    required: true,
    min: 0
  }, // years of experience
  designation: String,
  department: String,
  
  // Frontend specific fields
  patients: {
    type: Number,
    default: 0,
    min: 0
  }, // number of patients treated
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  }, // doctor rating
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
  
  // Professional settings
  consultationFee: Number,
  availableSlots: [{
    day: String,
    startTime: String,
    endTime: String,
  }],
  
  // Authentication
  password: {
    type: String,
    required: true,
    trim: true
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
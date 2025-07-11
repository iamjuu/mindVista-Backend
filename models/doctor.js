const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  // Basic doctor information
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // This allows multiple null values while maintaining uniqueness for non-null values
  },
  phone: {
    type: String,
    required: true,
  },
  specialization: {
    type: String,
    required: true,
  },
  
  // Professional details
  qualification: String,
  experience: {
    type: Number,
    required: true,
  }, // years of experience
  designation: String,
  department: String,
  
  // Frontend specific fields
  patients: {
    type: Number,
    default: 0,
  }, // number of patients treated
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  }, // doctor rating
  available: {
    type: Boolean,
    default: true,
  }, // availability status
  
  // Personal details
  age: Number,
  gender: String,
  address: String,
  profilePicture: String,
  bio: String,
  
  // Professional settings
  consultationFee: Number,
  availableSlots: [{
    day: String,
    startTime: String,
    endTime: String,
  }],
  
  // Status
  isActive: {
    type: Boolean,
    default: true,
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

const Doctor = mongoose.model('Doctor', DoctorSchema);

module.exports = Doctor; 
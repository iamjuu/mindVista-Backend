const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  // Reference to the user registration
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor', // Temporarily reference Doctor until Signup model is created
    required: true,
  },
  
  // Basic profile fields
  firstName: String,
  lastName: String,
  phoneNumber: String,
  dateOfBirth: Date,
  gender: String,
  address: String,
  profilePicture: String,
  bio: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Profile = mongoose.model('Profile', ProfileSchema);

module.exports = Profile;

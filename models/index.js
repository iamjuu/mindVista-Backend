// Import all models to ensure they are registered with Mongoose
const Doctor = require('./doctor');
const Appointment = require('./appoiment');
const Profile = require('./profile');
const Notification = require('./notification');
const Review = require('./review');
const Note = require('./note');
const PatientUser = require('./patientUser');
const PatientLoginOtp = require('./patientLoginOtp');

module.exports = {
  Doctor,
  Appointment,
  Profile,
  Notification,
  Review,
  Note,
  PatientUser,
  PatientLoginOtp,
};











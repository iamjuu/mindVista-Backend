// Import all models to ensure they are registered with Mongoose
const Doctor = require('./doctor');
const Appointment = require('./appoiment');
const Profile = require('./profile');
const Notification = require('./notification');

module.exports = {
  Doctor,
  Appointment,
  Profile,
  Notification
};











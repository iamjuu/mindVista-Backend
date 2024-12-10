const mongoose = require('mongoose');

const RegisterScheme = new mongoose.Schema({
  name: String,
  email: String,
  number: String,
  location: String,
  age: Number,
  time: String,
  date: String,
});
const Register = mongoose.model('register', RegisterScheme);
module.exports = Register;

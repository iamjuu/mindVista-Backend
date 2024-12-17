const FormData = require('../models/register'); // Ensure this is the correct model
const jwt = require('jsonwebtoken');
const Signup = require('../models/signup'); 
const secretKey = process.env.JWT_SECRET;
const mongoose = require('mongoose');

module.exports = {
  Register: async (req, res) => {
    const formData = req.body;
  if (
    !formData.name || 
    !formData.email || 
    !formData.number || 
    !formData.location || 
    !formData.age || 
    !formData.date || 
    !formData.slot
  ) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const existingUser = await Signup.findOne({ email: formData.email });
    if (!existingUser) {
      return res.status(403).json({
        message: 'This email is not registered. Please use a signed-up email.',
      });
    }
    const newFormData = new FormData(formData); 
    await newFormData.save();
    console.log('Data saved successfully.');

    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

    return res.status(200).json({ 
      message: 'Form submitted successfully.', 
      data: formData,
      otp: otp, 
    });
  } catch (dbError) {
    console.error('Error saving form data to MongoDB:', dbError);
    return res.status(500).json({ message: 'Internal server error while processing the form.' });
  }
},
  formData : async (req, res) => { 
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: 'Invalid ID format',
          success: false,
        });
      }

      const objectId = new mongoose.Types.ObjectId(id);
      const user = await Signup.findById(objectId).select("email")  
      const formData = await FormData.findOne({email: user.email});
      res.status(200).json({
        message: 'Data processed successfully',
        success: true,
        formData,
      });
    } 
    catch (error) {
      console.error('Error processing data:', error);
      res.status(500).json({
        message: 'An unexpected error occurred while processing data',
        success: false,
        error: error.message,
      });
    }
  }
  
}

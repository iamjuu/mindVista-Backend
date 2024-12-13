const FormData = require('../models/register'); // Ensure this is the correct model
const jwt = require('jsonwebtoken');
const Signup = require('../models/signup'); 
const secretKey = process.env.JWT_SECRET;

module.exports = {
  Register: async (req, res) => {
    const formData = req.body;
    console.log(formData, 'form data');
    if (
      !formData.name || 
      !formData.email || 
      !formData.number || 
      !formData.location || 
      !formData.age || 
      !formData.time || 
      !formData.date || 
      !formData.slot
    ) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
  
    try {
      const newFormData = new FormData(formData);
      await newFormData.save();
      const otp = Math.floor(1000 + Math.random() * 9000);
      console.log(`Generated OTP for ${formData.email}: ${otp}`);
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
  formData: async (req, res) => {
    try {
      // Extract the ID from the request parameters
      const { id } = req.params;
      
  console.log(id)
      // Find the user/data by ID in your database
      // This example assumes you're using Mongoose with MongoDB
      const userData = await FormData.findById(id)
      console.log(userData,'adfdfg')
  
      // If no user is found, return a 404 error
      if (!userData) {
        return res.status(404).json({ 
          message: 'User not found',
          success: false 
        });
      }
  
      res.status(200).json({
        message: 'User data retrieved successfully',
        success: true,
        data: userData
      });
  
    } catch (error) {
      console.error('Error retrieving user data:', error);
      res.status(500).json({ 
        message: 'Error retrieving user data',
        success: false,
        error: error.message 
      });
  }

}}
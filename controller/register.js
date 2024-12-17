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
      console.log('ID received:', id);
  
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: 'Invalid ID format',
          success: false,
        });
      }
  
      const objectId = new mongoose.Types.ObjectId(id); 
        const result = await Signup.aggregate([
        {
          $match: { _id: objectId }, // Match the user by ID in Signup collection
        },
        {
          $lookup: {
            from: 'formdatas', // Ensure this is the actual collection name
            localField: '_id',
            foreignField: '_id',
            as: 'formData',
          },
        },
        {
          $unwind: {
            path: '$formData',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            emailsMatch: { $eq: ['$email', '$formData.email'] },
          },
        },
      ]);
  
      if (!result || result.length === 0) {
        return res.status(404).json({
          message: 'User not found in Signup or FormData',
          success: false,
        });
      }
  
      const userData = result[0];
      console.log('Aggregation Result:', userData);
  
      const datagotted = userData.emailsMatch
        ? {
            message: 'Emails match',
            formData: userData.formData,
          }
        : null;
  
      res.status(200).json({
        message: 'Data processed successfully',
        success: true,
        userData: {
          _id: userData._id,
          name: userData.name,
          email: userData.email,
        },
        formData: userData.formData || null,
        
        datagotted,
      });
      console.log(userData,'assfs');
      
    } catch (error) {
      console.error('Error processing data:', error);
      res.status(500).json({
        message: 'An unexpected error occurred while processing data',
        success: false,
        error: error.message,
      });
    }
  }
  
}

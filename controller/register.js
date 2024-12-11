const FormData = require('../models/register'); // Ensure this is the correct model
const { sendEmail } = require('../utils/otp');  // Ensure the sendEmail function is correctly implemented

module.exports = {
  Register: async (req, res) => {
    const formData = req.body;
    console.log(formData, 'form data');
  
    // Validate the required fields
    if (!formData.name || !formData.email || !formData.number || !formData.location || !formData.age || !formData.time || !formData.date) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
  
    try {
      // Save form data to MongoDB
      const newFormData = new FormData(formData);
      await newFormData.save();
  
      // Generate OTP
      const otp = Math.floor(1000 + Math.random() * 9000); 
  
      // Send OTP email
      try {
        await sendEmail(formData.email, otp);
        return res.status(200).json({ message: 'Form submitted successfully. OTP sent to the provided email.', data: formData });
      } catch (emailError) {
        console.error('Error occurred while sending email:', emailError);
        return res.status(500).json({ message: 'Form submitted successfully, but failed to send OTP email. Please try again.' });
      }
  
    } catch (error) {
      console.error('Error saving form data to MongoDB:', error);
      return res.status(500).json({ message: 'Internal server error while processing the form.' });
    }
  }
};

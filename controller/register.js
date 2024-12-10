const FormData = require('../models/register');  // Assuming you have a model file
exports.submitForm = async (req, res) => {
  const formData = req.body;
  console.log(formData,'form data');
  
  if (!formData.name || !formData.email || !formData.number || !formData.location || !formData.age || !formData.time || !formData.date) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const newFormData = new FormData(formData);
    await newFormData.save();
    res.status(200).json({ message: 'Form submitted successfully', data: formData });
  } catch (error) {
    console.error('Error saving form data to MongoDB:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

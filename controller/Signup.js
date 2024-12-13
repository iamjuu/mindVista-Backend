const Signup = require('../models/signup');
const { generateToken } = require('../utils/jwt');

module.exports = {
  Signup: async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required!' });
    }

    try {
      // Check if the user already exists
      const existingUser = await Signup.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: 'Email already exists!' });
      }

      // Save new user to the database
      const newUser = new Signup({ username, email, password });
      await newUser.save();

      // Generate a JWT
      const token = generateToken({ id: newUser._id });

      // Respond with the token and success message
      res.status(201).json({
        message: 'Signup successful!',
        token,
        userId: newUser._id,
      });
    } catch (error) {
      console.error('Error saving user:', error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};

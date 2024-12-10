const Signup = require('../models/signup');

module.exports = {
  Signup: async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required!' });
    }

    try {
      // Check if email already exists
      const existingUser = await Signup.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: 'Email already exists!' });
      }

      // Create new user
      const newUser = new Signup({ username, email, password });
      await newUser.save();

      console.log('User registered:', { username, email });
      res.status(201).json({ message: 'Signup successful!' });
      console.log('Data saved');
    } catch (error) {
      console.error('Error saving user:', error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};

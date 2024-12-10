const Signup = require('../models/signup'); // Import the Signup schema

module.exports = {
  Login: async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and Password are required!' });
    }

    try {
      // Check if the email exists in the Signup collection
      const existingUser = await Signup.findOne({ email });

      if (!existingUser) {
        // Email not found, redirect to registration form
        return res.status(404).json({ message: 'Email not registered. Redirecting to signup...' });
      }

      // Optional: Add password validation logic here if required.
      // For now, we're only checking if the email exists.
      return res.status(200).json({ message: 'Login successful!' });

    } catch (error) {
      console.error('Error during login:', error.message);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
};

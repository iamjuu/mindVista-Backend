const Signup = require('../models/signup'); // Import the Signup schema

module.exports = {
  Login: async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and Password are required!' });
    }

    try {      
      const existingUser = await Signup.findOne({ email });

      if (!existingUser) {
        return res.status(404).json({ message: 'Email not registered. Redirecting to signup...' });
        console.log('fail');
        
      }
      return res.status(200).json({ message: 'Login successful!' });
      console.log('success');
      

    } catch (error) {
      console.error('Error during login:', error.message);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
};


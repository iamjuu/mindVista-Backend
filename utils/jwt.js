const jwt = require('jsonwebtoken');
const SECRET_KEY = 'muhammedajmal64240694'; 

const generateToken = (payload, expiresIn = '1h') => {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
};

// Verify a token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

module.exports = {
  generateToken,
  verifyToken,
};

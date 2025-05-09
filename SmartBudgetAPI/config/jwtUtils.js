const jwt = require('jsonwebtoken');
require('dotenv').config();

// Function to generate JWT
const generateJWT = (userId) => {
  const payload = { userId };
  const secretKey = process.env.JWT_SECRET;
  const options = { expiresIn: '1h' }; // You can adjust the expiration time here

  const token = jwt.sign(payload, secretKey, options);
  return token;
};

// Function to verify JWT
const verifyJWT = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
};

module.exports = { generateJWT, verifyJWT };
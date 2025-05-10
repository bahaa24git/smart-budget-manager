const jwt = require('jsonwebtoken');

// Function to generate a JWT token with user ID
exports.generateJWT = (userId) => {
  return jwt.sign(
    { UserID:userId },                           // Payload
    process.env.JWT_SECRET,              // Secret key from .env
    { expiresIn: '1h' }                  // Token valid for 1 hour
  );
};
const jwt = require('jsonwebtoken');
const authMiddleware = (req, res, next) => {
  // Read token from cookie
  const token = req.cookies?.jwt;

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify token and decode it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data (e.g., { UserID }) to the request
console.log("Decoded user from token:", req.user);
    next();
  } catch (err) {
    // Handle specific error if the token has expired
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token has expired. Please log in again.' });
    }

    console.error('Token verification failed:', err);
    return res.status(403).json({ message: 'Invalid token.' });
  }
};
module.exports = authMiddleware;
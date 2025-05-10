const jwt = require('jsonwebtoken');

function getUserFromToken(req) {
  const token = req.cookies?.jwt;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Return only the user ID in a consistent format
    return { UserID: decoded.UserID || decoded.userId || decoded.id };
  } catch (err) {
    console.error('JWT verification failed:', err);
    return null;
  }
}

module.exports = getUserFromToken;
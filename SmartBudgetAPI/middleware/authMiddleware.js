const jwt = require('jsonwebtoken'); // Import jsonwebtoken

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', ''); // Extract token from Authorization header

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // Verify the token using the secret key from .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach the decoded user data to the request object
        next(); // Proceed to the next middleware/route handler
    } catch (error) {
        console.error('Invalid or expired token:', error);
        res.status(400).json({ message: 'Invalid or expired token.' });
    }
};

module.exports = authMiddleware; // Export the middleware
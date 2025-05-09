const express = require('express');
const router = express.Router();
const { updateUser } = require('../controllers/usersController'); // Path to your controller
const authMiddleware = require('../middleware/authMiddleware'); // Import the auth middleware

// Update user details (protected route)
router.put('/users/:id', authMiddleware, updateUser);  // Added authMiddleware to protect the route

module.exports = router;
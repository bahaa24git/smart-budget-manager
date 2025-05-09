const express = require('express');
const router = express.Router();
const { updateUser } = require('../controllers/usersController'); // Path to your controller

// Update user details
router.put('/users/:id', updateUser);  // Ensure this matches the URL you're sending the PUT request to

module.exports = router;
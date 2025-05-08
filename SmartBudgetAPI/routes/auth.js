const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Import controller

// POST: Register a new user
router.post('/register', authController.register);

// POST: Login a user
router.post('/login', authController.login);

module.exports = router;
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Import controller
const authMiddleware = require('../middleware/authMiddleware'); // Import middleware
const { sql } = require('../config/db'); // Import the database connection

// POST: Register a new user
router.post('/register', authController.register);

// POST: Login a user
router.post('/login', authController.login);

// POST: Logout a user
router.post('/logout', authController.logout); // Use logout function from authController

// Example protected route (optional)
// router.get('/profile', authMiddleware, async (req, res) => {
//     try {
//         // You can access user data from the decoded JWT in req.user
//         const user = req.user;  // User info from JWT token
//         const pool = await sql.connect();
//         const result = await pool.request()
//             .input('userId', sql.Int, user.UserID)
//             .query('SELECT * FROM Users WHERE UserID = @userId');
        
//         if (result.recordset.length === 0) {
//             return res.status(404).json({ message: 'User not found' });
//         }
        
//         res.status(200).json(result.recordset[0]); // Return user profile data
//     } catch (error) {
//         console.error('Error fetching profile:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

module.exports = router;
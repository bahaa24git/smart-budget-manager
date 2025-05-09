const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactionsController');
const authMiddleware = require('../middleware/authMiddleware'); // Import the auth middleware

// GET: Fetch all transactions (protected route)
router.get('/', authMiddleware, transactionsController.getAllTransactions); // Added authMiddleware

// POST: Create a new transaction (protected route)
router.post('/add', authMiddleware, transactionsController.createTransaction); // Added authMiddleware

// DELETE: Delete a transaction by ID (protected route)
router.delete('/delete/:id', authMiddleware, transactionsController.deleteTransaction); // Added authMiddleware

module.exports = router;
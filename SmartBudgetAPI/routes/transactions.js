const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactionsController'); // Import controller

// GET: Fetch all transactions
router.get('/', transactionsController.getAllTransactions);

// POST: Create a new transaction
router.post('/add', transactionsController.createTransaction);

// DELETE: Delete a transaction by ID
router.delete('/delete/:id', transactionsController.deleteTransaction);

module.exports = router;
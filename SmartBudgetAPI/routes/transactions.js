const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactionsController'); // Import controller

// GET: Fetch all transactions
router.get('/', transactionsController.getAllTransactions);

// POST: Create a new transaction
router.post('/', transactionsController.createTransaction);

module.exports = router;
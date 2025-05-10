const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const {
  getAllTransactions,
  createTransaction,
  deleteTransaction
} = require('../controllers/transactionsController');


//  GET /api/transactions
//  Get all transactions for authenticated user
router.get('/', authMiddleware, getAllTransactions);

//  POST /api/transactions
//  Create new transaction
router.post('/add', authMiddleware, createTransaction);

//  DELETE /api/transactions/:id
//  Delete transaction by ID
router.delete('/:id', authMiddleware, deleteTransaction);

module.exports = router;
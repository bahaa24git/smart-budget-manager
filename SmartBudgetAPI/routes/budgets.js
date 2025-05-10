const express = require('express');
const router = express.Router();
const budgetsController = require('../controllers/budgetsController'); // Import controller
const authMiddleware = require('../middleware/authMiddleware'); // Import the auth middleware

const {
  getAllBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget
} = require('../controllers/budgetsController');

//  GET /api/budgets
//  Get all budgets for authenticated user
router.get('/', authMiddleware, getAllBudgets);

//  GET /api/budgets/:id
//  Get budget by ID
router.get('/:id', authMiddleware, getBudgetById);

//  POST /api/budgets
//  Create new budget
router.post('/', authMiddleware, createBudget);

//  PUT /api/budgets/:id
//  Update existing budget
router.put('/:id', authMiddleware, updateBudget);

//  DELETE /api/budgets/:id
//  Delete budget by ID
router.delete('/:id', authMiddleware, deleteBudget);

module.exports = router;
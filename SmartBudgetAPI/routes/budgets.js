const express = require('express');
const router = express.Router();
const budgetsController = require('../controllers/budgetsController');

// GET all budgets
router.get('/', async (req, res) => {
  try {
    await budgetsController.getAllBudgets(req, res);
  } catch (err) {
    console.error("Error in GET /budgets:", err);
    res.status(500).json({ message: 'Error retrieving budgets' });
  }
});

// GET a single budget by id
router.get('/:id', async (req, res) => {
  try {
    await budgetsController.getBudgetById(req, res);
  } catch (err) {
    console.error(`Error in GET /budgets/${req.params.id}:`, err);
    res.status(500).json({ message: 'Error retrieving budget' });
  }
});

// POST: create a new budget
router.post('/', async (req, res) => {
  try {
    await budgetsController.createBudget(req, res);
  } catch (err) {
    console.error("Error in POST /budgets:", err);
    res.status(500).json({ message: 'Error creating budget' });
  }
});

// PUT: update an existing budget
router.put('/:id', async (req, res) => {
  try {
    await budgetsController.updateBudget(req, res);
  } catch (err) {
    console.error(`Error in PUT /budgets/${req.params.id}:`, err);
    res.status(500).json({ message: 'Error updating budget' });
  }
});

// DELETE a budget by id
router.delete('/:id', async (req, res) => {
  try {
    await budgetsController.deleteBudget(req, res);
  } catch (err) {
    console.error(`Error in DELETE /budgets/${req.params.id}:`, err);
    res.status(500).json({ message: 'Error deleting budget' });
  }
});

module.exports = router;
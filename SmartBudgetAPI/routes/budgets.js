const express = require('express');
const router = express.Router();
const budgetsController = require('../controllers/budgetsController');
const authMiddleware = require('../middleware/authMiddleware'); // Import authMiddleware

// GET all budgets (public or protected depending on your needs)
router.get('/', authMiddleware, async (req, res) => { // Protected
  try {
    await budgetsController.getAllBudgets(req, res);
  } catch (err) {
    console.error("Error in GET /budgets:", err);
    res.status(500).json({ message: 'Error retrieving budgets' });
  }
});

// GET a single budget by id (protected)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    await budgetsController.getBudgetById(req, res);
  } catch (err) {
    console.error(`Error in GET /budgets/${req.params.id}:`, err);
    res.status(500).json({ message: 'Error retrieving budget' });
  }
});

// POST: create a new budget (protected)
router.post('/', authMiddleware, async (req, res) => { // Protected
  try {
    await budgetsController.createBudget(req, res);
  } catch (err) {
    console.error("Error in POST /budgets:", err);
    res.status(500).json({ message: 'Error creating budget' });
  }
});

// PUT: update an existing budget (protected)
router.put('/:id', authMiddleware, async (req, res) => { // Protected
  try {
    await budgetsController.updateBudget(req, res);
  } catch (err) {
    console.error(`Error in PUT /budgets/${req.params.id}:`, err);
    res.status(500).json({ message: 'Error updating budget' });
  }
});

// DELETE a budget by id (protected)
router.delete('/:id', authMiddleware, async (req, res) => { // Protected
  try {
    await budgetsController.deleteBudget(req, res);
  } catch (err) {
    console.error(`Error in DELETE /budgets/${req.params.id}:`, err);
    res.status(500).json({ message: 'Error deleting budget' });
  }
});

module.exports = router;
const { getAllBudgets, addBudget, updateBudgetBalance } = require('../config/budgetsModel');
const { sql, connectToDatabase } = require('../config/db'); 

// GET all budgets
exports.getAllBudgets = async (req, res) => {
  try {
    const budgets = await getAllBudgets();
    res.json(budgets);
  } catch (err) {
    console.error("Error fetching budgets:", err);
    res.status(500).json({ message: 'Error fetching budgets', error: err.message });
  }
};

// GET a single budget by id
exports.getBudgetById = async (req, res) => {
  const budgetId = req.params.id;
  try {
    const pool = await connectToDatabase();
    const result = await pool.request()
      .input('id', sql.Int, budgetId)
      .query('SELECT * FROM Budgets WHERE BudgetID = @id');
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Error fetching budget:", err);
    res.status(500).json({ message: 'Error fetching budget', error: err.message });
  }
};

// POST: Create a new budget
exports.createBudget = async (req, res) => {
  const { userId, walletId, totalAmount, month, year } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: 'You must be logged in to create a budget.' });
  }

  try {
    // Use the addBudget function from budgetsModel
    const budgetId = await addBudget(userId, walletId, totalAmount, month, year);
    res.status(201).json({ message: 'Budget created successfully', budgetId });
  } catch (err) {
    console.error('Error creating budget:', err);
    res.status(500).json({ message: 'Error creating budget', error: err.message });
  }
};

// DELETE a budget by id
exports.deleteBudget = async (req, res) => {
  const budgetId = req.params.id;
  try {
    const pool = await connectToDatabase();
    const result = await pool.request()
      .input('budgetId', sql.Int, budgetId)
      .query('DELETE FROM Budgets WHERE BudgetID = @budgetId');
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    res.json({ message: 'Budget deleted successfully' });
  } catch (err) {
    console.error('Error deleting budget:', err);
    res.status(500).json({ message: 'Error deleting budget', error: err.message });
  }
};
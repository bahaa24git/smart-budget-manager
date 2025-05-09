const { getAllBudgets, addBudget, updateBudgetBalance } = require('../config/budgetsModel');
const { connectToDatabase } = require('../config/db'); 
const { sql } = require('../config/db'); // Import the database connection

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

exports.createBudget = async (req, res) => {
  console.log(req.body);  // Add this to see the body being sent

  const { userId, walletId, totalAmount, month, year } = req.body;

  if (!userId || !walletId || totalAmount === undefined || !month || !year) {
    return res.status(400).json({ message: 'Please provide userId, walletId, totalAmount, month, and year' });
  }

  try {
    // Start a transaction
    const pool = await connectToDatabase();
    const transaction = pool.transaction();

    await transaction.begin();

    // Add the budget
    const budgetId = await addBudget(userId, walletId, totalAmount, month, year);

    // Commit the transaction
    await transaction.commit();

    
    res.status(201).json({
      id: budgetId,
      userId,
      walletId,
      totalAmount,
      remainingAmount: totalAmount, // Set RemainingAmount to TotalAmount at creation
      month,
      year
    });

  } catch (err) {
    // If an error occurs, rollback the transaction
    console.error("Error creating budget:", err);
    res.status(500).json({ message: 'Error creating budget', error: err.message });
  }
};

// PUT: Update an existing budget by id
exports.updateBudget = async (req, res) => {
  const budgetId = req.params.id;
  const { totalAmount, remainingAmount, month, year } = req.body;

  if (
    totalAmount === undefined ||
    remainingAmount === undefined ||
    month === undefined ||
    year === undefined
  ) {
    return res.status(400).json({ message: 'Please provide totalAmount, remainingAmount, month, and year' });
  }

  try {
    const pool = await connectToDatabase();
    const now = new Date();

    await pool.request()
      .input('id', sql.Int, budgetId)
      .input('totalAmount', sql.Float, totalAmount)
      .input('remainingAmount', sql.Float, remainingAmount)
      .input('month', sql.Int, month)
      .input('year', sql.Int, year)
      .input('updatedAt', sql.DateTime, now)
      .query(`
        UPDATE Budgets
        SET TotalAmount = @totalAmount,
            RemainingAmount = @remainingAmount,
            Month = @month,
            Year = @year,
            UpdatedAt = @updatedAt
        WHERE BudgetID = @id
      `);

    res.json({ message: 'Budget updated successfully' });
  } catch (err) {
    console.error("Error updating budget:", err);
    res.status(500).json({ message: 'Error updating budget', error: err.message });
  }
};

// DELETE a budget by id
exports.deleteBudget = async (req, res) => {
  const budgetId = req.params.id;

  try {
    const pool = await connectToDatabase();
    const result = await pool
      .request()
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
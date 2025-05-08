const sql = require('mssql');
const { connectToDatabase } = require('./db'); 

// Fetch all budgets
const getAllBudgets = async () => {
  const pool = await connectToDatabase();
  const result = await pool.request().query('SELECT * FROM Budgets');
  return result.recordset;
};

// Add a new budget
const addBudget = async (userId, walletId, totalAmount, month, year) => {
  const pool = await connectToDatabase();
  const remainingAmount = totalAmount; // Set RemainingAmount to totalAmount
  const now = new Date();

  const result = await pool.request()
    .input('userId', sql.Int, userId)
    .input('walletId', sql.Int, walletId)
    .input('totalAmount', sql.Float, totalAmount)
    .input('remainingAmount', sql.Float, remainingAmount) // Use remainingAmount
    .input('month', sql.Int, month)
    .input('year', sql.Int, year)
    .input('createdAt', sql.DateTime, now)
    .input('updatedAt', sql.DateTime, now)
    .query(`
      INSERT INTO Budgets (UserID, WalletID, TotalAmount, RemainingAmount, Month, Year, CreatedAt, UpdatedAt)
      VALUES (@userId, @walletId, @totalAmount, @remainingAmount, @month, @year, @createdAt, @updatedAt);
      SELECT SCOPE_IDENTITY() AS id
    `);

  return result.recordset[0].id;
};

// Function to update budget balance after a transaction
const updateBudgetBalance = async (budgetId, amount) => {
  const pool = await connectToDatabase();
  try {
    await pool.request()
      .input('budgetId', sql.Int, budgetId)
      .input('amount', sql.Float, amount)
      .query(`
        UPDATE Budgets
        SET RemainingAmount = RemainingAmount - @amount
        WHERE BudgetID = @budgetId
      `);
  } catch (error) {
    console.error('Error updating budget balance:', error);
    throw error;
  }
};

module.exports = { getAllBudgets, addBudget, updateBudgetBalance };
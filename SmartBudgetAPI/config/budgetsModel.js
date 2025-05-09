const sql = require('mssql');
const { connectToDatabase } = require('./db'); 

// Fetch all budgets
const getAllBudgets = async () => {
  const pool = await connectToDatabase();
  const result = await pool.request().query('SELECT * FROM Budgets');
  return result.recordset;
};

// Add a new budget and update wallet balance
const addBudget = async (userId, walletId, totalAmount, month, year) => {
  const pool = await connectToDatabase();
  const remainingAmount = totalAmount; // Set RemainingAmount to totalAmount
  const now = new Date();

  try {
    // Start a transaction to ensure atomicity
    const transaction = pool.transaction();
    await transaction.begin();

    // Insert the budget into the Budgets table
    const result = await transaction.request()
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

    const budgetId = result.recordset[0].id;

    // Update the wallet's balance and remaining balance
    await transaction.request()
      .input('walletId', sql.Int, walletId)
      .input('totalAmount', sql.Float, totalAmount)
      .query(`
        UPDATE UserWallets
        SET 
          Balance = ISNULL(Balance, 0) + @totalAmount,
          RemainingBalance = ISNULL(RemainingBalance, 0) + @totalAmount
        WHERE WalletID = @walletId
      `);

    // Commit the transaction
    await transaction.commit();

    return budgetId; // Return the new budget ID after the transaction

  } catch (error) {
    // If an error occurs, rollback the transaction
    console.error('Error adding budget and updating wallet balance:', error);
    await transaction.rollback();
    throw error;
  }
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
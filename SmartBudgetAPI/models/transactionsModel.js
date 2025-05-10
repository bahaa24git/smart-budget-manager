const sql = require('mssql');
const { connectToDatabase } = require('./db');

// Fetch all transactions
const getAllTransactions = async () => {
  const pool = await connectToDatabase();
  const result = await pool.request().query('SELECT * FROM Transactions');
  return result.recordset; 
};

// Add a new transaction
const addTransaction = async (userId, amount, category, description, date, walletId, budgetId) => {
  const pool = await connectToDatabase();
  try {
    const transaction = await pool.transaction();
    await transaction.begin();

    const result = await transaction.request()
      .input('userId', sql.Int, userId)
      .input('amount', sql.Float, amount)
      .input('category', sql.NVarChar, category)
      .input('description', sql.NVarChar, description)
      .input('date', sql.Date, date)
      .input('walletId', sql.Int, walletId)
      .input('budgetId', sql.Int, budgetId)
      .query(`
        INSERT INTO Transactions (UserID, Amount, Category, Description, Date, WalletID, BudgetID)
        VALUES (@userId, @amount, @category, @description, @date, @walletId, @budgetId);
        SELECT SCOPE_IDENTITY() AS id
      `);
      
    const transactionId = result.recordset[0].id;

    if (budgetId) {
      await transaction.request()
        .input('budgetId', sql.Int, budgetId)
        .input('amount', sql.Float, amount)
        .query(`
          UPDATE Budgets
          SET Balance = Balance - @amount
          WHERE BudgetID = @budgetId
        `);
    }

    if (walletId) {
      await transaction.request()
        .input('walletId', sql.Int, walletId)
        .input('amount', sql.Float, amount)
        .query(`
          UPDATE Wallets
          SET Balance = Balance - @amount
          WHERE WalletID = @walletId
        `);
    }

    await transaction.commit();

    return transactionId;
  } catch (error) {
    console.error('Error during transaction:', error);
    throw error;
  }
};


// Delete a transaction by ID
const deleteTransaction = async (transactionId) => {
  const pool = await connectToDatabase();
  const result = await pool.request()
    .input('transactionId', sql.Int, transactionId)
    .query('DELETE FROM Transactions WHERE TransactionID = @transactionId;');
  return result.rowsAffected > 0;
};

module.exports = { getAllTransactions, addTransaction, deleteTransaction };
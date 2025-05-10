const sql = require('mssql');
const { connectToDatabase } = require('../models/db');

const getUserBudgets = async (userId) => {
  const pool = await connectToDatabase();
  const result = await pool.request()
    .input('userId', sql.Int, userId)
    .query('SELECT * FROM Budgets WHERE UserID = @userId');
  return result.recordset;
};

const getBudgetById = async (budgetId) => {
  const pool = await connectToDatabase();
  const result = await pool.request()
    .input('budgetId', sql.Int, budgetId)
    .query('SELECT * FROM Budgets WHERE BudgetID = @budgetId');
  return result.recordset[0];
};

const addBudget = async (userId, walletId, totalAmount, month, year) => {
  const pool = await connectToDatabase();
  const remainingAmount = totalAmount;
  const now = new Date();

  let transaction;

  try {
    transaction = pool.transaction();
    await transaction.begin();

    const result = await transaction.request()
      .input('userId', sql.Int, userId)
      .input('walletId', sql.Int, walletId)
      .input('totalAmount', sql.Float, totalAmount)
      .input('remainingAmount', sql.Float, remainingAmount)
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


    return budgetId;

  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Error adding budget and updating wallet balance:', error);
    throw error;
  }
};

const updateBudget = async (budgetId, totalAmount, month, year) => {
  const pool = await connectToDatabase();
  const now = new Date();

  const result = await pool.request()
    .input('budgetId', sql.Int, budgetId)
    .input('totalAmount', sql.Float, totalAmount)
    .input('month', sql.Int, month)
    .input('year', sql.Int, year)
    .input('updatedAt', sql.DateTime, now)
    .query(`
      UPDATE Budgets
      SET TotalAmount = @totalAmount,
          Month = @month,
          Year = @year,
          UpdatedAt = @updatedAt
      WHERE BudgetID = @budgetId
    `);

  return result.rowsAffected[0] > 0;
};

const deleteBudget = async (budgetId) => {
  const pool = await connectToDatabase();

  const result = await pool.request()
    .input('budgetId', sql.Int, budgetId)
    .query('DELETE FROM Budgets WHERE BudgetID = @budgetId');

  return result.rowsAffected[0] > 0;
};

module.exports = {
  getUserBudgets,
  getBudgetById,
  addBudget,
  updateBudget,
  deleteBudget,
};
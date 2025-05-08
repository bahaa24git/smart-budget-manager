const sql = require('mssql');
const connectToDatabase = require('./db');

// Function to fetch all budgets from the database
const getAllBudgets = async () => {
  const pool = await connectToDatabase();
  const result = await pool.request().query('SELECT * FROM Budgets'); 
  return result.recordset;
};

// Function to add a new budget
const addBudget = async (name, amount, walletId) => {
  const pool = await connectToDatabase();
  const result = await pool.request()
    .input('name', sql.NVarChar, name)
    .input('amount', sql.Float, amount)
    .input('walletId', sql.Int, walletId)
    .query('INSERT INTO Budgets (name, amount, walletId) VALUES (@name, @amount, @walletId) SELECT SCOPE_IDENTITY() AS id');  
  return result.recordset[0].id;
};

module.exports = { getAllBudgets, addBudget };
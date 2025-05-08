const sql = require('mssql');
const connectToDatabase = require('./db');

// Function to fetch all transactions from the database
const getAllTransactions = async () => {
  const pool = await connectToDatabase();
  const result = await pool.request().query('SELECT * FROM Transactions');  
  return result.recordset;
};

// Function to add a new transaction
const addTransaction = async (description, amount, walletId, date) => {
  const pool = await connectToDatabase();
  const result = await pool.request()
    .input('description', sql.NVarChar, description)
    .input('amount', sql.Float, amount)
    .input('walletId', sql.Int, walletId)
    .input('date', sql.Date, date)
    .query('INSERT INTO Transactions (description, amount, walletId, date) VALUES (@description, @amount, @walletId, @date) SELECT SCOPE_IDENTITY() AS id');  
};

module.exports = { getAllTransactions, addTransaction };
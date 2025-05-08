const sql = require('mssql');
const connectToDatabase = require('./db');

// Function to fetch all wallets from the database
const getAllWallets = async () => {
  const pool = await connectToDatabase();
  const result = await pool.request().query('SELECT * FROM Wallets');  // Adjust table name if needed
  return result.recordset;
};

// Function to add a new wallet
const addWallet = async (name, balance) => {
  const pool = await connectToDatabase();
  const result = await pool.request()
    .input('name', sql.NVarChar, name)
    .input('balance', sql.Float, balance)
    .query('INSERT INTO Wallets (name, balance) VALUES (@name, @balance) SELECT SCOPE_IDENTITY() AS id');  // Adjust column names if needed
  return result.recordset[0].id;
};

module.exports = { getAllWallets, addWallet };
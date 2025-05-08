const { sql } = require('../config/db');
const { connectToDatabase } = require('./db');

// Function to fetch all wallets for a specific user
const getAllWallets = async (userId) => {
  const pool = await connectToDatabase();
  const result = await pool.request()
    .input('userId', sql.Int, userId)  // Filtering by UserID
    .query('SELECT * FROM UserWallets WHERE UserID = @userId');
  return result.recordset;
};

// Function to add a new wallet
const addWallet = async (userId, name, balance) => {
  const pool = await connectToDatabase();
  try {
    const result = await pool.request()
      .input('userId', sql.Int, userId) // Adding the userId parameter
      .input('name', sql.NVarChar, name)
      .input('balance', sql.Float, balance)
      .query('INSERT INTO UserWallets (UserID, WalletName, Balance) VALUES (@userId, @name, @balance); SELECT SCOPE_IDENTITY() AS id');
    return result.recordset[0].id;
  } catch (error) {
    console.error("Error creating wallet:", error);
    throw error;
  }
};

module.exports = { getAllWallets, addWallet };
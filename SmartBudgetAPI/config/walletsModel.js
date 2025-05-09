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
      .input('userId', sql.Int, userId) 
      .input('name', sql.NVarChar, name)
      // .input('balance', sql.Float, balance)
      .query('INSERT INTO UserWallets (UserID, WalletName) VALUES (@userId, @name); SELECT SCOPE_IDENTITY() AS id');
    return result.recordset[0].id;
  } catch (error) {
    console.error("Error creating wallet:", error);
    throw error;
  }
};

// Function to update wallet balance based on transactions
const updateWalletBalance = async (walletId) => {
  const pool = await connectToDatabase();

  try {
    // Fetch all transactions associated with this wallet
    const result = await pool.request()
      .input('walletId', sql.Int, walletId)
      .query('SELECT SUM(amount) AS totalAmount FROM Transactions WHERE walletId = @walletId');

    const newBalance = result.recordset[0].totalAmount || 0; // If no transactions, default balance to 0

    // Update the wallet balance in the UserWallets table
    await pool.request()
      .input('walletId', sql.Int, walletId)
      .input('newBalance', sql.Float, newBalance)
      .query('UPDATE UserWallets SET Balance = @newBalance WHERE WalletId = @walletId');

    console.log(`Wallet ${walletId} balance updated to ${newBalance}`);
  } catch (error) {
    console.error("Error updating wallet balance:", error);
    throw error;
  }
};

module.exports = { getAllWallets, addWallet, updateWalletBalance };
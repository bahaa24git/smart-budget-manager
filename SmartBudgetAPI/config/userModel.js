const sql = require('mssql');
const connectToDatabase = require('./db');

// Function to find a user by username
const getUserByUsername = async (username) => {
  const pool = await connectToDatabase();
  const result = await pool.request()
    .input('username', sql.NVarChar, username)
    .query('SELECT * FROM Users WHERE username = @username');
  return result.recordset[0];
};

// Function to add a new user
const addUser = async (username, password) => {
  const pool = await connectToDatabase();
  const result = await pool.request()
    .input('username', sql.NVarChar, username)
    .input('password', sql.NVarChar, password) 
    .query('INSERT INTO Users (username, password) VALUES (@username, @password) SELECT SCOPE_IDENTITY() AS id');
  return result.recordset[0].id;
};

module.exports = { getUserByUsername, addUser };
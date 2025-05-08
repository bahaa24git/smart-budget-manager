const sql = require('mssql');
const { connectToDatabase } = require('./db');

// Function to find a user by username
const getUserByUsername = async (username) => {
  const pool = await connectToDatabase();
  const result = await pool.request()
    .input('username', sql.NVarChar, username)
    .query('SELECT * FROM Users WHERE Username = @username');
  return result.recordset[0];
};

// Function to add a new user (registration)
const addUser = async (username, passwordHash) => {
  const pool = await connectToDatabase();
  const result = await pool.request()
    .input('username', sql.NVarChar, username)
    .input('passwordHash', sql.NVarChar, passwordHash) // Store hashed password
    .query(`
      INSERT INTO Users (Username, PasswordHash, CreatedAt, UpdatedAt)
      VALUES (@username, @passwordHash, GETDATE(), GETDATE()) 
      SELECT SCOPE_IDENTITY() AS id
    `);
  return result.recordset[0].id;
};

// Function to update user data (for update operation)
const updateUser = async (userId, username, passwordHash, email) => {
  const pool = await connectToDatabase();
  const result = await pool.request()
    .input('userId', sql.Int, userId)
    .input('username', sql.NVarChar(100), username)
    .input('email', sql.NVarChar(100), email)
    .input('passwordHash', sql.NVarChar(100), passwordHash) // Store hashed password
    .query(`
      UPDATE Users
      SET Username = @username,
          Email = @email,
          PasswordHash = @passwordHash,  -- Hashing passwords when updating
          UpdatedAt = GETDATE()
      WHERE UserID = @userId
    `);
  return result.rowsAffected[0]; // Number of rows affected (should be 1 if successful)
};

module.exports = { getUserByUsername, addUser, updateUser };
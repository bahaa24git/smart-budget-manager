const { sql } = require('../models/db'); // DB connection
const bcrypt = require('bcryptjs');      // Password hashing
const jwt = require('jsonwebtoken');     // JWT creation
const { generateJWT } = require('../utils/jwtUtils'); // Custom token util

// Register a new user
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please provide username, email, and password' });
  }

  try {
    const pool = await sql.connect();

    // Check if email or username already exists
    const checkUser = await pool.request()
      .input('email', sql.NVarChar, email)
      .input('username', sql.NVarChar, username)
      .query('SELECT * FROM Users WHERE Email = @email OR Username = @username');

    if (checkUser.recordset.length > 0) {
      return res.status(409).json({ message: 'User with this email or username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.request()
      .input('username', sql.NVarChar, username)
      .input('email', sql.NVarChar, email)
      .input('passwordHash', sql.NVarChar, hashedPassword)
      .query(`
        INSERT INTO Users (Username, Email, PasswordHash, CreatedAt, UpdatedAt)
        VALUES (@username, @email, @passwordHash, GETDATE(), GETDATE())
      `);

    res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Login user
exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide both username and password' });
  }

  try {
    const pool = await sql.connect();

    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .query('SELECT * FROM Users WHERE Username = @username');

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.recordset[0];

    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateJWT(user.UserID); // Create JWT


    
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000, // 1 hour
      sameSite: 'Strict',
    });

    res.status(200).json({ message: 'Login successful', token });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Error logging in' });
    console.log("req.user:", req.user);
  }
};

// Logout user
// controllers/authController.js

exports.logout = (req, res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 0
  });
  res.status(200).json({ message: 'Logged out successfully' });
};
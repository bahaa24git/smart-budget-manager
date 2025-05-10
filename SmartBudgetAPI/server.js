const express = require('express');
require('dotenv').config();
const { connectToDatabase } = require('./models/db');
const app = express();
const PORT = process.env.PORT || 5000;
const cookieParser = require('cookie-parser');
const authMiddleware = require('./middleware/authMiddleware');

// Middleware
app.use(express.json());  // This will parse incoming JSON requests
app.use(cookieParser()); // Middleware to parse cookies
// Routes
const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallets');
const budgetRoutes = require('./routes/budgets');
const transactionsRoutes = require('./routes/transactions');
const usersRoutes = require('./routes/users');

// Test endpoint to check server status
app.get('/status', (req, res) => {
  res.json({ message: 'Server is up and running' });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/wallets', authMiddleware, walletRoutes);
app.use('/budgets', authMiddleware, budgetRoutes); // المفروض يكون كدهapp.use('/transactions', transactionRoutes);
app.use('/users', authMiddleware, usersRoutes);
app.use('/transactions', authMiddleware, transactionsRoutes); // Use auth middleware for transactions

// Connect to DB and start server
connectToDatabase()
  .then(() => {
    app.get('/', (req, res) => {
      res.send('Smart Budget Manager API');
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to DB:', err);
  });

// Export the app for testing purposes
module.exports = app;
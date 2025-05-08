const express = require('express');
require('dotenv').config();
const { connectToDatabase } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());  // This will parse incoming JSON requests

// Routes
const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallets');
const budgetRoutes = require('./routes/budgets');
const transactionRoutes = require('./routes/transactions');
const usersRoutes = require('./routes/users');

// Test endpoint to check server status
app.get('/status', (req, res) => {
  res.json({ message: 'Server is up and running' });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/wallets', walletRoutes);
app.use('/budgets', budgetRoutes);
app.use('/transactions', transactionRoutes);
app.use('/users', usersRoutes);

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
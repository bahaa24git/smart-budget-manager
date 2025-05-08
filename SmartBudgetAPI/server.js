
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const { connectToDatabase } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallets');
const budgetRoutes = require('./routes/budgets');
const transactionRoutes = require('./routes/transactions');

  
// Add the /status route first, before other API routes
app.get('/status', (req, res) => {
  res.json({ message: 'Server is up and running' });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/wallets', walletRoutes);
app.use('/budgets', budgetRoutes);
app.use('/transactions', transactionRoutes);

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
const {
  getAllTransactions: getAllTransactionsModel,
  addTransaction,
  deleteTransaction: deleteTransactionModel
} = require('../config/transactionsModel');
const { UserWallets, Transactions } = require('../config/db');  // You don't need this import, it's being used incorrectly
const { connectToDatabase } = require('../config/db');

// GET: Fetch all transactions
const getAllTransactions = async (req, res) => {
  try {
      const transactions = await getAllTransactionsModel();
      res.status(200).json(transactions);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
};

// POST: Create a new transaction
const createTransaction = async (req, res) => {
  const { userID, amount, category, date, description, budgetID, walletID } = req.body;

  try {
      const pool = await connectToDatabase();

      // 1. Get remaining amount from the budget
      const budgetResult = await pool
          .request()
          .input('BudgetID', budgetID)
          .query(`SELECT RemainingAmount FROM Budgets WHERE BudgetID = @BudgetID`);

      if (budgetResult.recordset.length === 0) {
          return res.status(404).json({ error: 'Budget not found' });
      }

      const remaining = budgetResult.recordset[0].RemainingAmount;

      // 2. Check if the remaining budget is enough
      if (remaining < amount) {
          return res.status(400).json({ error: 'Not enough remaining budget for this transaction' });
      }

      // 3. Insert transaction into the database
      await pool
          .request()
          .input('UserID', userID)
          .input('Amount', amount)
          .input('Category', category)
          .input('Date', date)
          .input('Description', description)
          .input('BudgetID', budgetID)
          .input('WalletID', walletID)
          .query(`
              INSERT INTO Transactions (UserID, Amount, Category, Date, Description, BudgetID, WalletID)
              VALUES (@UserID, @Amount, @Category, @Date, @Description, @BudgetID, @WalletID)
          `);

      // 4. Update the remaining budget amount
      await pool
          .request()
          .input('Amount', amount)
          .input('BudgetID', budgetID)
          .query(`
              UPDATE Budgets 
              SET RemainingAmount = RemainingAmount - @Amount 
              WHERE BudgetID = @BudgetID
          `);

      // 5. Update the wallet balance after the transaction
      await pool
          .request()
          .input('walletID', walletID)
          .input('amount', amount)
          .query(`
              UPDATE UserWallets
              SET Balance = Balance - @amount  -- Subtract amount for withdrawal
              WHERE WalletID = @walletID
          `);

      // If amount is a deposit, add it instead of subtracting
      if (amount > 0) {
          await pool
              .request()
              .input('walletID', walletID)
              .input('amount', amount)
              .query(`
                  UPDATE UserWallets
                  SET Balance = Balance + @amount  -- Add amount for deposit
                  WHERE WalletID = @walletID
              `);
      }

      res.status(201).json({ message: 'Transaction created and budget updated successfully' });
  } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE: Delete a transaction
const deleteTransaction = async (req, res) => {
  const { id } = req.params;

  try {
      const deleted = await deleteTransactionModel(id);
      if (deleted) {
          res.status(200).json({ message: 'Transaction deleted successfully' });
      } else {
          res.status(404).json({ message: 'Transaction not found' });
      }
  } catch (error) {
      res.status(500).json({ message: 'Error deleting transaction', error: error.message });
  }
};

module.exports = {
  getAllTransactions,
  createTransaction,
  deleteTransaction
};
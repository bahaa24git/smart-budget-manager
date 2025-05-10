const {
  getAllTransactions: getAllTransactionsModel,
  addTransaction,
  deleteTransaction: deleteTransactionModel
} = require('../models/transactionsModel');
const { UserWallets, Transactions } = require('../models/db');
const { connectToDatabase } = require('../models/db');

const getAllTransactions = async (req, res) => {
  try {
      const transactions = await getAllTransactionsModel();
      res.status(200).json(transactions);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
};

const createTransaction = async (req, res) => {
  const { userID, amount, category, date, description, budgetId, walletId } = req.body;

  try {
      const pool = await connectToDatabase();

      if (budgetId) {
          const budgetResult = await pool
              .request()
              .input('BudgetID', budgetId)
              .query(`SELECT RemainingAmount FROM Budgets WHERE BudgetID = @BudgetID`);

        //   if (budgetResult.recordset.length === 0) {
        //       return res.status(404).json({ error: 'Budget not found' });
        //   }

          const remaining = budgetResult.recordset[0].RemainingAmount;

          if (amount < 0 && remaining < Math.abs(amount)) {
              return res.status(400).json({ error: 'Not enough remaining budget for this transaction' });
          }

          if (amount < 0) {
              await pool
                  .request()
                  .input('Amount', Math.abs(amount))
                  .input('BudgetID', budgetId)
                  .query(`UPDATE Budgets SET RemainingAmount = RemainingAmount - @Amount WHERE BudgetID = @BudgetID`);
          }
      }

      await pool
          .request()
          .input('UserID', userID)
          .input('Amount', amount)
          .input('Category', category)
          .input('Date', date)
          .input('Description', description)
          .input('BudgetID', budgetId )
          .input('WalletID', walletId)
          .query(`INSERT INTO Transactions (UserID, Amount, Category, Date, Description, BudgetID, WalletID)
                  VALUES (@UserID, @Amount, @Category, @Date, @Description, @BudgetId, @walletId)`);

      // 4. Update the remaining budget amount
      await pool
          .request()
          .input('Amount', amount)
          .input('BudgetID', budgetId)
          .query(`
              UPDATE Budgets 
              SET RemainingAmount = RemainingAmount - @Amount 
              WHERE BudgetID = @BudgetID
          `);

      // 5. Update the wallet balance after the transaction
      await pool
          .request()
          .input('walletID', walletId)
          .input('amount', amount)
          .query(`
              UPDATE UserWallets
              SET RemainingBalance = RemainingBalance - @amount  
              WHERE WalletID = @walletId
          `);

      res.status(201).json({ message: 'Transaction created successfully' });
  } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
};

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
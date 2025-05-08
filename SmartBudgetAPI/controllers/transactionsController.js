const {
    getAllTransactions: getAllTransactionsModel,
    addTransaction,
    deleteTransaction: deleteTransactionModel
  } = require('../config/transactionsModel');
  
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
  
      // 3. Insert transaction
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
  
      // 4. Update the remaining amount
      await pool
        .request()
        .input('Amount', amount)
        .input('BudgetID', budgetID)
        .query(`
          UPDATE Budgets 
          SET RemainingAmount = RemainingAmount - @Amount 
          WHERE BudgetID = @BudgetID
        `);
  
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
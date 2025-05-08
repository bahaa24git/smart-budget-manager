const { sql } = require('../config/db');
const { getAllTransactions, addTransaction } = require('../config/transactionsModel');

// Get all transactions
exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await getAllTransactions();
        res.json(transactions);
    } catch (err) {
        console.error("Error fetching transactions:", err);
        res.status(500).json({ message: 'Error fetching transactions' });
    }
};

// Create new transaction
exports.createTransaction = async (req, res) => {
    const { description, amount, walletId, date } = req.body;
    if (!description || amount === undefined || !walletId || !date) {
        return res.status(400).json({ message: 'Please provide description, amount, walletId, and date' });
    }

    try {
        const transactionId = await addTransaction(description, amount, walletId, date);
        res.status(201).json({ id: transactionId, description, amount, walletId, date });
    } catch (err) {
        console.error("Error creating transaction:", err);
        res.status(500).json({ message: 'Error creating transaction' });
    }
};

// Optional: Add methods for update, delete, etc.
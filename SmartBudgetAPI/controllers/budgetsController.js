const { sql } = require('../config/db');
const { getAllBudgets, addBudget } = require('../config/budgetsModel');

// Get all budgets
exports.getAllBudgets = async (req, res) => {
    try {
        const budgets = await getAllBudgets();
        res.json(budgets);
    } catch (err) {
        console.error("Error fetching budgets:", err);
        res.status(500).json({ message: 'Error fetching budgets' });
    }
};

// Create new budget
exports.createBudget = async (req, res) => {
    const { name, amount, walletId } = req.body;
    if (!name || amount === undefined || !walletId) {
        return res.status(400).json({ message: 'Please provide name, amount, and walletId' });
    }

    try {
        const budgetId = await addBudget(name, amount, walletId);
        res.status(201).json({ id: budgetId, name, amount, walletId });
    } catch (err) {
        console.error("Error creating budget:", err);
        res.status(500).json({ message: 'Error creating budget' });
    }
};

// Optional: Add methods for update, delete, etc.
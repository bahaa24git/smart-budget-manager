const { sql } = require('../models/db');
const { getAllWallets, addWallet, updateWalletBalance } = require('../models/walletsModel');
const { createTransaction } = require('../models/transactionsModel'); // Assuming this exists in your model

// Get all wallets for a specific usern
exports.getAllWallets = async (req, res) => {
    const userId = req.params.userId;  // Assuming the userId is passed as a parameter in the URL

    if (!userId) {
        return res.status(400).json({ message: 'Please provide a userId' });
    }

    try {
        const wallets = await getAllWallets(userId); // Passing userId to filter wallets
        res.json(wallets);
    } catch (err) {
        console.error("Error fetching wallets:", err);
        res.status(500).json({ message: 'Error fetching wallets' });
    }
};

// Create a new wallet for a specific user
exports.createWallet = async (req, res) => {
    const { userId, name } = req.body;


// console.log("req.user:", req.user);
// console.log("userId from body:", userId);


    // Ensure only the logged-in user can create a wallet for themselves
    if (parseInt(userId) !== req.user.UserID) {
        return res.status(403).json({ message: 'You are not authorized to create a wallet for another user.' });
    }

    if (!userId || !name ) {
        return res.status(400).json({ message: 'Please provide userId and name' });
    }

    try {
        const walletId = await addWallet(userId, name);
        res.status(201).json({ id: walletId, userId, name });
    }catch (err) {
    console.error("Error creating wallet:", err.message || err);
    res.status(500).json({ message: 'Error creating wallet', error: err.message || err });
    console.log("Wallet insert result:", result);
}
};

// Function to update wallet balance
// Function to update wallet balance
exports.updateWalletBalance = async (walletId) => {
    try {
        // Fetch all budgets associated with this wallet
        const budgetsResult = await sql`
            SELECT TotalAmount FROM Budgets WHERE WalletID = ${walletId}
        `;

        // Calculate new balance as the sum of all budgets' TotalAmount
        const newBalance = budgetsResult.reduce((total, budget) => total + budget.TotalAmount, 0);

        // Fetch all budgets' RemainingAmount for the RemainingBalance
        const remainingResult = await sql`
            SELECT RemainingAmount FROM Budgets WHERE WalletID = ${walletId}
        `;
        
        // Calculate remaining balance
        const newRemainingBalance = remainingResult.reduce((total, budget) => total + budget.RemainingAmount, 0);

        // Update the wallet's balance and remaining balance
        await sql`
            UPDATE UserWallets 
            SET Balance = ${newBalance},
                RemainingBalance = ${newRemainingBalance}
            WHERE WalletID = ${walletId}
        `;
    } catch (err) {
        console.error("Error updating wallet balance:", err);
        throw new Error("Error updating wallet balance");
    }
};
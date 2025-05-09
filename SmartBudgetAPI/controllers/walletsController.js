const { sql } = require('../config/db');
const { getAllWallets, addWallet, updateWalletBalance } = require('../config/walletsModel');
const { createTransaction } = require('../config/transactionsModel'); // Assuming this exists in your model

// Get all wallets for a specific user
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
    const { userId, name, balance } = req.body;

    if (!userId || !name ) {
        return res.status(400).json({ message: 'Please provide userId, name'});
    }

    try {
        const walletId = await addWallet(userId, name); // Passing userId to associate with the wallet
        res.status(201).json({ id: walletId, userId, name});
    } catch (err) {
        console.error("Error creating wallet:", err);
        res.status(500).json({ message: 'Error creating wallet' });
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

// // Assuming a route that will create a transaction, we can update the wallet balance
// exports.createTransaction = async (req, res) => {
//     const { walletId, amount, description } = req.body;

//     if (!walletId || amount === undefined || !description) {
//         return res.status(400).json({ message: 'Please provide walletId, amount, and description' });
//     }

//     try {
//         // Assuming createTransaction adds a new record to the Transactions table
//         const transactionId = await createTransaction(walletId, amount, description);

//         // Now update the wallet balance after transaction creation
//         await this.updateWalletBalance(walletId);

//         res.status(201).json({ id: transactionId, walletId, amount, description });
//     } catch (err) {
//         console.error("Error creating transaction:", err);
//         res.status(500).json({ message: 'Error creating transaction' });
//     }
// };
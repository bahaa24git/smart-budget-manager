const { sql } = require('../config/db');
const { getAllWallets, addWallet } = require('../config/walletsModel');

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

    if (!userId || !name || balance === undefined) {
        return res.status(400).json({ message: 'Please provide userId, name, and balance' });
    }

    try {
        const walletId = await addWallet(userId, name, balance); // Passing userId to associate with the wallet
        res.status(201).json({ id: walletId, userId, name, balance });
    } catch (err) {
        console.error("Error creating wallet:", err);
        res.status(500).json({ message: 'Error creating wallet' });
    }
};
const { sql } = require('../config/db');
const { getAllWallets, addWallet } = require('../config/walletsModel');

// Get all wallets
exports.getAllWallets = async (req, res) => {
    try {
        const wallets = await getAllWallets();
        res.json(wallets);
    } catch (err) {
        console.error("Error fetching wallets:", err);
        res.status(500).json({ message: 'Error fetching wallets' });
    }
};

// Create new wallet
exports.createWallet = async (req, res) => {
    const { name, balance } = req.body;
    if (!name || balance === undefined) {
        return res.status(400).json({ message: 'Please provide name and balance' });
    }

    try {
        const walletId = await addWallet(name, balance);
        res.status(201).json({ id: walletId, name, balance });
    } catch (err) {
        console.error("Error creating wallet:", err);
        res.status(500).json({ message: 'Error creating wallet' });
    }
};

// Optional: You can add methods for updating, deleting, and getting by ID if required.
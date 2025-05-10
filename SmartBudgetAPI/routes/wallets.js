const express = require('express');
const router = express.Router();
const walletsController = require('../controllers/walletsController'); // Import controller
const authMiddleware = require('../middleware/authMiddleware'); // Import the auth middleware

// GET: Fetch all wallets (public route or protected depending on your needs)
router.get('/', walletsController.getAllWallets);

// POST: Create a new wallet (protected route)
router.post('/', authMiddleware, async (req, res) => {
    try {
        await walletsController.createWallet(req, res);
    } catch (err) {
        console.error("Error in POST /wallets:", err);
        res.status(500).json({ message: 'Error creating wallet' });
    }
});

module.exports = router;
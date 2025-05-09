const express = require('express');
const router = express.Router();
const walletsController = require('../controllers/walletsController'); // Import controller
const authMiddleware = require('../middleware/authMiddleware'); // Import the auth middleware

// GET: Fetch all wallets (public route or protected depending on your needs)
router.get('/', walletsController.getAllWallets);

// POST: Create a new wallet (protected route)
router.post('/', authMiddleware, async (req, res) => {
    const userIdFromToken = req.user.UserID; // Get user ID from JWT token

    // Ensure the wallet is being created by the correct user
    if (req.body.userId !== userIdFromToken) {
        return res.status(403).json({ message: "You are not authorized to create a wallet for another user." });
    }

    try {
        // Proceed with creating the wallet if the user is authorized
        await walletsController.createWallet(req, res);
    } catch (err) {
        console.error("Error in POST /wallets:", err);
        res.status(500).json({ message: 'Error creating wallet' });
    }
});

module.exports = router;
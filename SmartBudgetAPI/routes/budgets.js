const express = require('express');
const router = express.Router();
const walletsController = require('../controllers/walletsController'); // Import controller

// GET: Fetch all wallets
router.get('/', walletsController.getAllWallets);

// POST: Create a new wallet
router.post('/', walletsController.createWallet);

module.exports = router;
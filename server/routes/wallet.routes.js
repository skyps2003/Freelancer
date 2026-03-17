const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const walletController = require('../controllers/walletController');

router.get('/balance', auth, walletController.getBalance);
router.get('/transactions', auth, walletController.getTransactions);
router.get('/cards', auth, walletController.getTestCards);
router.post('/deposit', auth, walletController.deposit);
router.post('/withdraw', auth, walletController.withdraw);

module.exports = router;

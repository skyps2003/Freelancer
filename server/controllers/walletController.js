const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');

// Tarjetas de prueba ficticias
const TEST_CARDS = {
    '4242424242424242': { brand: 'Visa', name: 'Visa Test', approved: true },
    '5555555555554444': { brand: 'Mastercard', name: 'Mastercard Test', approved: true },
    '3782822463100050': { brand: 'Amex', name: 'Amex Test', approved: true },
    '4000000000000002': { brand: 'Visa', name: 'Visa Declined', approved: false },
};

// GET /wallet/balance
exports.getBalance = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({ balance: user.wallet || 0 });
    } catch (error) {
        console.error('Error getting balance:', error);
        res.status(500).json({ message: 'Error al obtener saldo' });
    }
};

// GET /wallet/transactions
exports.getTransactions = async (req, res) => {
    try {
        const transactions = await WalletTransaction.find({ user: req.user.id })
            .populate('relatedContract', 'title')
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(transactions);
    } catch (error) {
        console.error('Error getting transactions:', error);
        res.status(500).json({ message: 'Error al obtener transacciones' });
    }
};

// GET /wallet/cards
exports.getTestCards = async (req, res) => {
    const cards = Object.entries(TEST_CARDS).map(([number, info]) => ({
        number: number.replace(/(.{4})/g, '$1 ').trim(),
        brand: info.brand,
        name: info.name,
        last4: number.slice(-4),
        approved: info.approved,
    }));
    res.json(cards);
};

// POST /wallet/deposit
exports.deposit = async (req, res) => {
    try {
        const { cardNumber, amount } = req.body;
        const cleanCard = cardNumber.replace(/\s/g, '');

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'El monto debe ser mayor a 0' });
        }

        const cardInfo = TEST_CARDS[cleanCard];
        if (!cardInfo) {
            return res.status(400).json({ message: 'Tarjeta no reconocida. Usa una tarjeta de prueba.' });
        }

        if (!cardInfo.approved) {
            return res.status(400).json({ message: 'Tarjeta rechazada. Intenta con otra tarjeta.' });
        }

        const user = await User.findById(req.user.id);
        const balanceBefore = user.wallet || 0;
        const balanceAfter = balanceBefore + amount;

        user.wallet = balanceAfter;
        await user.save();

        const transaction = await new WalletTransaction({
            user: req.user.id,
            type: 'DEPOSIT',
            amount,
            description: `Depósito con ${cardInfo.brand} terminada en ${cleanCard.slice(-4)}`,
            cardLast4: cleanCard.slice(-4),
            balanceBefore,
            balanceAfter,
        }).save();

        res.json({ 
            message: 'Depósito exitoso',
            balance: balanceAfter,
            transaction 
        });
    } catch (error) {
        console.error('Error depositing:', error);
        res.status(500).json({ message: 'Error al procesar depósito' });
    }
};

// POST /wallet/withdraw
exports.withdraw = async (req, res) => {
    try {
        const { amount, method, account } = req.body; // method: 'YAPE' or 'BANK'

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'El monto debe ser mayor a 0' });
        }

        if (!method || !['YAPE', 'BANK'].includes(method)) {
            return res.status(400).json({ message: 'Método de retiro inválido' });
        }

        if (!account) {
            return res.status(400).json({ message: 'Debes ingresar el número de cuenta o teléfono' });
        }

        const user = await User.findById(req.user.id);
        const balanceBefore = user.wallet || 0;

        if (balanceBefore < amount) {
            return res.status(400).json({ message: 'Saldo insuficiente' });
        }

        const balanceAfter = balanceBefore - amount;
        user.wallet = balanceAfter;
        await user.save();

        const methodLabel = method === 'YAPE' ? 'Yape' : 'Cuenta Bancaria';

        const transaction = await new WalletTransaction({
            user: req.user.id,
            type: 'WITHDRAWAL',
            amount: -amount,
            description: `Retiro a ${methodLabel} (${account})`,
            withdrawMethod: method,
            withdrawAccount: account,
            balanceBefore,
            balanceAfter,
        }).save();

        res.json({
            message: `Retiro de S/ ${amount} procesado a ${methodLabel}`,
            balance: balanceAfter,
            transaction
        });
    } catch (error) {
        console.error('Error withdrawing:', error);
        res.status(500).json({ message: 'Error al procesar retiro' });
    }
};

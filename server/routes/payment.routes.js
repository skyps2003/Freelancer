const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const Project = require('../models/Project');

// Get My Purchases
router.get('/my-purchases', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ buyer_id: req.user.id, status: 'APPROVED' })
            .populate({
                path: 'product_id',
                populate: { path: 'seller', select: 'name avatar' }
            })
            .sort({ timestamp: -1 });
        res.json(transactions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get My Sales Count
router.get('/my-sales-count', auth, async (req, res) => {
    try {
        const count = await Transaction.countDocuments({ seller_id: req.user.id, status: 'APPROVED' });
        res.json({ count });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get Transaction by Product ID (for Seller View)
router.get('/transaction/product/:productId', auth, async (req, res) => {
    try {
        const transaction = await Transaction.findOne({
            product_id: req.params.productId,
            status: 'APPROVED'
        }).populate('buyer_id', 'name avatar email'); // Get basic buyer info

        if (!transaction) {
            return res.status(404).json({ msg: 'Transacción no encontrada' });
        }

        // Verify that the requester is the seller (or maybe the buyer, but here we focus on seller)
        if (transaction.seller_id.toString() !== req.user.id && transaction.buyer_id._id.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'No autorizado' });
        }

        res.json(transaction);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Checkout (Project/General - kept for backward compatibility or direct calls)
router.post('/checkout', auth, async (req, res) => {
    const { projectId, amount, cardNumber } = req.body;

    // Mock Logic
    let status = 'ERROR';

    if (cardNumber.endsWith('4242')) {
        status = 'APPROVED';
    } else if (cardNumber.endsWith('0000')) {
        status = 'DECLINED';
    }

    try {
        const transaction = new Transaction({
            buyer_id: req.user.id,
            project_id: projectId,
            amount,
            card_last4: cardNumber.slice(-4),
            status
        });

        await transaction.save();

        if (status === 'APPROVED') {
            if (projectId) await Project.findByIdAndUpdate(projectId, { status: 'FINALIZADO' });
            return res.status(200).json({ status: 'APPROVED', transaction });
        } else if (status === 'DECLINED') {
            return res.status(402).json({ status: 'DECLINED', msg: 'Fondos insuficientes', transaction });
        } else {
            return res.status(400).json({ status: 'ERROR', msg: 'Error processing card', transaction });
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Product Purchase
router.post('/checkout/product', auth, async (req, res) => {
    const { productId, amount, cardNumber } = req.body;

    try {
        const Product = require('../models/Product');
        const User = require('../models/User');

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ msg: 'Producto no encontrado' });
        if (product.status === 'SOLD') return res.status(400).json({ msg: 'Este producto ya ha sido vendido' });

        // Payment Simulation
        let status = 'APPROVED';
        if (cardNumber.endsWith('0000')) status = 'DECLINED';
        else if (!cardNumber.endsWith('4242')) status = 'ERROR';

        const transaction = new Transaction({
            buyer_id: req.user.id,
            seller_id: product.seller,
            product_id: productId,
            amount: product.price + (product.shippingCost || 0),
            card_last4: cardNumber.slice(-4),
            status
        });

        await transaction.save();

        if (status === 'APPROVED') {
            // Update Product Status
            product.status = 'SOLD';
            await product.save();

            // Add to Seller Wallet
            const seller = await User.findById(product.seller);
            if (seller) {
                seller.wallet = (seller.wallet || 0) + product.price;
                await seller.save();
            }

            return res.json({ status: 'APPROVED', transaction });
        } else {
            return res.status(400).json({ status, msg: 'Error de pago', transaction });
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

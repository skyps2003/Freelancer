const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    buyer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    amount: { type: Number, required: true },
    card_last4: { type: String, required: true },
    status: { type: String, enum: ['APPROVED', 'DECLINED', 'ERROR'], required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);

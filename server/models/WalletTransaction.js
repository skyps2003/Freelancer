const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: ['DEPOSIT', 'ESCROW_LOCK', 'ESCROW_RELEASE', 'WITHDRAWAL', 'MILESTONE_PAYMENT'],
        required: true
    },
    amount: { type: Number, required: true },
    description: { type: String, default: '' },
    relatedContract: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract' },
    relatedMilestone: { type: mongoose.Schema.Types.ObjectId, ref: 'Milestone' },
    cardLast4: { type: String },
    withdrawMethod: { type: String, enum: ['YAPE', 'BANK', null], default: null },
    withdrawAccount: { type: String },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);

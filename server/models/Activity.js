const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    contract: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contract',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true
        // e.g. "CREATED_CONTRACT", "SUBMITTED_DELIVERABLE", "APPROVED_MILESTONE"
    },
    description: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);

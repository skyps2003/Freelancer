const mongoose = require('mongoose');

const deliverableSchema = new mongoose.Schema({
    milestone: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Milestone',
        required: true
    },
    freelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fileUrl: {
        type: String,
        required: false
    },
    link: {
        type: String,
        required: false
    },
    comment: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Deliverable', deliverableSchema);

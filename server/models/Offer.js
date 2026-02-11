const mongoose = require('mongoose');

const offerSchema = mongoose.Schema({
    employer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    budget: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    deadline: {
        type: Date,
        required: false
    },
    duration: {
        type: String,
        enum: ['1-2 semanas', '2-4 semanas', '1-3 meses', '3-6 meses', 'Más de 6 meses'],
        required: false
    },
    projectType: {
        type: String,
        enum: ['Proyecto Único', 'Trabajo Continuo', 'Contrato Temporal'],
        required: false
    },
    status: {
        type: String,
        enum: ['OPEN', 'CLOSED'],
        default: 'OPEN'
    },
    applicants: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        message: String,
        cvUrl: String,
        date: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);

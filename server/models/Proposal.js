const mongoose = require('mongoose');

const proposalSchema = mongoose.Schema({
    project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    freelancer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    price: { type: Number, required: true },
    cover_letter: { type: String, required: true },
    status: { type: String, enum: ['ESPERA', 'ACEPTADA', 'RECHAZADA'], default: 'ESPERA' }
}, { timestamps: true });

module.exports = mongoose.model('Proposal', proposalSchema);

const mongoose = require('mongoose');

const projectSchema = mongoose.Schema({
    company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    budget_max: { type: Number, required: true },
    deadline: { type: Date, required: true },
    status: {
        type: String,
        enum: ['PENDIENTE', 'EN_LICITACION', 'ASIGNADO', 'FINALIZADO'],
        default: 'PENDIENTE'
    }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);

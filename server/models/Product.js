const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    price: { type: Number, required: true },
    category: {
        type: String,
        required: true,
        enum: ['Naturaleza', 'Tecnología', 'Abstracto', 'Servicios', 'Negocios', 'Arte']
    },
    tags: [String],
    status: {
        type: String,
        enum: ['AVAILABLE', 'SOLD'],
        default: 'AVAILABLE'
    },
    type: {
        type: String,
        enum: ['Virtual', 'Fisico'],
        default: 'Virtual'
    },
    shippingCost: { type: Number, default: 0 },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);

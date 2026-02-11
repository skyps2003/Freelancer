const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    googleId: { type: String },
    role: { type: String, enum: ['USER', 'ADMIN', 'EMPRESA', 'FREELANCER'], default: 'USER' },
    wallet: { type: Number, default: 0 },
    skills: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

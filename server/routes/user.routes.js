const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [auth, upload.single('avatar')], async (req, res) => {
    const { name, bio, skills } = req.body;

    // Build user object
    const profileFields = {};
    if (name) profileFields.name = name;
    if (bio) profileFields.bio = bio;
    if (skills) {
        // Parse skills if it's a stringified array
        profileFields.skills = typeof skills === 'string' ? JSON.parse(skills) : skills;
    }
    if (req.file) {
        profileFields.avatar = `/uploads/${req.file.filename}`;
    } else if (req.body.avatar) {
        // Allow updating avatar via URL if no file is uploaded (optional, but good for flexibility)
        profileFields.avatar = req.body.avatar;
    }

    try {
        let user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ msg: 'User not found' });

        console.log('📝 Updating profile for user:', req.user.id);
        console.log('📦 Profile fields to update:', profileFields);

        user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: profileFields },
            { new: true }
        ).select('-password');

        console.log('✅ Profile updated successfully. New data:', {
            name: user.name,
            bio: user.bio,
            skills: user.skills,
            avatar: user.avatar
        });

        res.json(user);
    } catch (err) {
        console.error('❌ Error updating profile:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/users/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

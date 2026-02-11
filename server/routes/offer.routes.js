const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const uploadCV = require('../middleware/uploadCV');
const Offer = require('../models/Offer');
const User = require('../models/User');

// @route   POST api/offers
// @desc    Create an offer (Employer only)
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'EMPRESA') {
            return res.status(403).json({ msg: 'Access denied. Only companies can post offers.' });
        }

        const { title, description, budget, category, deadline, duration, projectType } = req.body;

        const newOffer = new Offer({
            employer: req.user.id,
            title,
            description,
            budget,
            category,
            deadline,
            duration,
            projectType
        });

        const offer = await newOffer.save();
        res.json(offer);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/offers
// @desc    Get all offers
// @access  Public
router.get('/', async (req, res) => {
    try {
        const offers = await Offer.find().sort({ createdAt: -1 }).populate('employer', 'name avatar');
        res.json(offers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/offers/my-offers
// @desc    Get current user's offers
// @access  Private
router.get('/my-offers', auth, async (req, res) => {
    try {
        const offers = await Offer.find({ employer: req.user.id }).sort({ createdAt: -1 }).populate('applicants.user', 'name avatar email');
        res.json(offers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/offers/:id/apply
// @desc    Apply to an offer (Freelancer only)
// @access  Private
router.post('/:id/apply', auth, uploadCV.single('cv'), async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'FREELANCER') {
            return res.status(403).json({ msg: 'Access denied. Only freelancers can apply.' });
        }

        const offer = await Offer.findById(req.params.id);
        if (!offer) return res.status(404).json({ msg: 'Offer not found' });

        // Check if already applied
        if (offer.applicants.some(app => app.user.toString() === req.user.id)) {
            return res.status(400).json({ msg: 'You have already applied to this offer' });
        }

        const newApplication = {
            user: req.user.id,
            message: req.body.message || 'I am interested in this job.'
        };

        // Add CV URL if file was uploaded
        if (req.file) {
            newApplication.cvUrl = `/uploads/cvs/${req.file.filename}`;
        }

        offer.applicants.unshift(newApplication);
        await offer.save();

        res.json(offer.applicants);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

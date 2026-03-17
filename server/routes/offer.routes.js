const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const uploadCV = require('../middleware/uploadCV');
const Offer = require('../models/Offer');
const User = require('../models/User');
const Contract = require('../models/Contract');
const Milestone = require('../models/Milestone');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const Message = require('../models/Message');

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

// @route   POST api/offers/:id/accept/:applicantId
// @desc    Accept an applicant and generate contract
// @access  Private
router.post('/:id/accept/:applicantId', auth, async (req, res) => {
    try {
        const { milestones, deadline } = req.body;
        
        const offer = await Offer.findById(req.params.id).populate('employer');
        if (!offer) return res.status(404).json({ msg: 'Oferta no encontrada' });

        // Verify employer
        if (offer.employer._id.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Usuario no autorizado' });
        }

        const applicant = offer.applicants.find(app => app.user.toString() === req.params.applicantId);
        if (!applicant) return res.status(404).json({ msg: 'Postulante no encontrado' });

        // Validate Milestones
        if (!milestones || milestones.length === 0) {
            return res.status(400).json({ msg: 'Debe haber al menos un hito.' });
        }

        const totalPercentage = milestones.reduce((sum, m) => sum + Number(m.percentage), 0);
        if (totalPercentage !== 100) {
            return res.status(400).json({ msg: `El total de porcentajes debe ser exactamente 100%. Suma actual: ${totalPercentage}%` });
        }

        // Close offer (Optional, you could optionally keep it OPEN until Freelancer accepts, but this ensures no one else applies)
        offer.status = 'CLOSED';
        
        // Let's also attach a flag to the applicant so the frontend knows they won
        applicant.status = 'ACCEPTED';
        await offer.save();

        // 1. Create Contract Auto
        const newContract = new Contract({
            company: offer.employer._id,
            freelancer: applicant.user,
            project: null, // As it is an Offer, we leave project null for now or associate later
            title: offer.title,
            description: `Contrato propuesto para la oferta: ${offer.title}\n\nDescripción original: ${offer.description}`,
            totalAmount: offer.budget,
            deadline: deadline ? new Date(deadline) : (offer.deadline || new Date(new Date().setMonth(new Date().getMonth() + 1))),
            status: 'PENDING'
        });
        const savedContract = await newContract.save();

        // 2. Create Dynamic Milestones
        const milestoneDocs = milestones.map((m, index) => {
            // Convert percentage to actual amount based on offer budget
            const amount = Math.round((m.percentage / 100) * offer.budget);
            return {
                contract: savedContract._id,
                title: m.title || `Hito ${index + 1}`,
                description: m.description || `Pago del ${m.percentage}%`,
                amount: amount,
                // Assign a proportional due date if missing, or default to contract deadline
                dueDate: savedContract.deadline
            }
        });
        
        // Ensure total amount matches budget exactly due to rounding
        const totalCalculated = milestoneDocs.reduce((sum, m) => sum + m.amount, 0);
        if (totalCalculated !== offer.budget && milestoneDocs.length > 0) {
            // Add/Subtract the difference from the last milestone to fix rounding errors
            milestoneDocs[milestoneDocs.length - 1].amount += (offer.budget - totalCalculated);
        }

        await Milestone.insertMany(milestoneDocs);

        // 3. Register Activity
        await new Activity({
            contract: savedContract._id,
            user: req.user.id,
            action: 'CREATED_CONTRACT',
            description: `Contrato propuesto desde la oferta "${offer.title}". Esperando aprobación del freelancer.`
        }).save();

        // 4. Send Notification to Freelancer
        await new Notification({
            recipient: applicant.user,
            sender: req.user.id,
            type: 'SYSTEM',
            message: `¡${offer.employer.name || 'Una empresa'} te ha enviado un contrato para el proyecto "${offer.title}"! Por favor, revisalo y acéptalo.`,
            relatedId: savedContract._id
        }).save();

        // 5. Send Chat Message to Freelancer
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
        const offerMessage = new Message({
            sender: req.user.id,
            receiver: applicant.user,
            content: `¡Felicidades! Has sido aceptado por la empresa para el proyecto "${offer.title}". Tienes 24 horas para revisar y aceptar el contrato.`,
            isOffer: true,
            expiresAt: expiresAt,
            contract: savedContract._id
        });
        await offerMessage.save();

        res.json({ msg: 'Contrato propuesto exitosamente', contractId: savedContract._id });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

module.exports = router;

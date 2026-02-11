const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Proposal = require('../models/Proposal');
const Project = require('../models/Project');

// Submit Proposal
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'FREELANCER') {
        return res.status(403).json({ msg: 'Only freelancers can submit proposals' });
    }

    const { project_id, price, cover_letter } = req.body;

    try {
        // Check if project exists
        const project = await Project.findById(project_id);
        if (!project) return res.status(404).json({ msg: 'Project not found' });

        // Check if duplicate proposal
        const existingProposal = await Proposal.findOne({ project_id, freelancer_id: req.user.id });
        if (existingProposal) {
            return res.status(400).json({ msg: 'Proposal already submitted for this project' });
        }

        const newProposal = new Proposal({
            project_id,
            freelancer_id: req.user.id,
            price,
            cover_letter
        });

        const proposal = await newProposal.save();

        // Update project status to EN_LICITACION if it was PENDIENTE
        if (project.status === 'PENDIENTE') {
            project.status = 'EN_LICITACION';
            await project.save();
        }

        res.json(proposal);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

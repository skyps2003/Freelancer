const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const Proposal = require('../models/Proposal');
const User = require('../models/User');

// Create Project (Company Only)
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'EMPRESA') {
        return res.status(403).json({ msg: 'Only companies can post projects' });
    }

    try {
        const { title, description, budget_max, deadline } = req.body;
        const newProject = new Project({
            company_id: req.user.id,
            title,
            description,
            budget_max,
            deadline
        });

        const project = await newProject.save();
        res.json(project);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get My Projects (Company Only) - Includes Proposals
router.get('/my-projects', auth, async (req, res) => {
    if (req.user.role !== 'EMPRESA') {
        return res.status(403).json({ msg: 'Access denied' });
    }

    try {
        const projects = await Project.find({ company_id: req.user.id }).sort({ createdAt: -1 });

        // Enrich with proposal count or data? Let's fetch proposals for each project
        // This is N+1 but fine for small scale demo
        const projectsWithProposals = await Promise.all(projects.map(async (project) => {
            const proposals = await Proposal.find({ project_id: project._id }).populate('freelancer_id', 'name email');
            return { ...project._doc, proposals };
        }));

        res.json(projectsWithProposals);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get Project Feed (Freelancer Only - PENDIENTE or EN_LICITACION)
router.get('/feed', auth, async (req, res) => {
    // Freelancers see pending projects
    try {
        const projects = await Project.find({
            status: { $in: ['PENDIENTE', 'EN_LICITACION'] }
        }).populate('company_id', 'name').sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Assign Project (Accept Proposal)
router.patch('/:id/assign', auth, async (req, res) => {
    if (req.user.role !== 'EMPRESA') {
        return res.status(403).json({ msg: 'Access denied' });
    }

    const { proposalId } = req.body;

    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ msg: 'Project not found' });
        if (project.company_id.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        // Update Project Status
        project.status = 'ASIGNADO';
        await project.save();

        // Update Proposal Status
        const proposal = await Proposal.findById(proposalId);
        if (!proposal) return res.status(404).json({ msg: 'Proposal not found' });

        proposal.status = 'ACEPTADA';
        await proposal.save();

        // Reject other proposals? Maybe later.

        res.json(project);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

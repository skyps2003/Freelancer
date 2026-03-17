const express = require('express');
const router = express.Router();
const { 
    createContract, 
    getContracts, 
    getContractDetails, 
    submitDeliverable, 
    reviewDeliverable,
    acceptContract,
    rejectContract
} = require('../controllers/contractController');
const protect = require('../middleware/auth');

// Rutas base: /api/contracts
router.post('/', protect, createContract);
router.get('/', protect, getContracts);
router.get('/:id', protect, getContractDetails);

// Freelancer Aceptación de contrato
router.put('/:id/accept', protect, acceptContract);
router.put('/:id/reject', protect, rejectContract);

// Entregables e hitos
router.post('/milestone/:milestoneId/deliver', protect, submitDeliverable);
router.put('/milestone/:milestoneId/review', protect, reviewDeliverable);

module.exports = router;

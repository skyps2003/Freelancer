const Contract = require('../models/Contract');
const Milestone = require('../models/Milestone');
const Deliverable = require('../models/Deliverable');
const Activity = require('../models/Activity');

// Crear un nuevo contrato
exports.createContract = async (req, res) => {
    try {
        const { company, freelancer, title, description, totalAmount, deadline, milestones } = req.body;

        // 1. Crear contrato
        const newContract = new Contract({
            company,
            freelancer,
            title,
            description,
            totalAmount,
            deadline
        });
        const savedContract = await newContract.save();

        // 2. Crear los hitos asociados
        if (milestones && milestones.length > 0) {
            const milestoneDocs = milestones.map(m => ({
                contract: savedContract._id,
                title: m.title,
                description: m.description,
                amount: m.amount,
                dueDate: m.dueDate
            }));
            await Milestone.insertMany(milestoneDocs);
        }

        // 3. Registrar actividad
        await new Activity({
            contract: savedContract._id,
            user: company,
            action: 'CREATED_CONTRACT',
            description: 'Contrato creado exitosamente.'
        }).save();

        res.status(201).json(savedContract);
    } catch (error) {
        console.error('Error creating contract:', error);
        res.status(500).json({ message: 'Error al crear el contrato' });
    }
};

// Obtener contratos de un usuario (empresa o freelancer)
exports.getContracts = async (req, res) => {
    try {
        const userId = req.user.id; // Asumiendo que usas auth middleware
        
        // Buscar contratos donde el usuario sea empresa o freelancer
        const contracts = await Contract.find({
            $or: [{ company: userId }, { freelancer: userId }]
        }).populate('company', 'name email').populate('freelancer', 'name email');

        // Auto-sync: mark contracts as COMPLETED if all milestones are approved
        for (const contract of contracts) {
            if (contract.status === 'ACTIVE') {
                const milestones = await Milestone.find({ contract: contract._id });
                if (milestones.length > 0 && milestones.every(m => m.status === 'APPROVED')) {
                    contract.status = 'COMPLETED';
                    await contract.save();
                }
            }
        }

        res.json(contracts);
    } catch (error) {
        console.error('Error getting contracts:', error);
        res.status(500).json({ message: 'Error al obtener contratos' });
    }
};

// Obtener detalles de un contrato específico
exports.getContractDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const contract = await Contract.findById(id)
            .populate('company', 'name email')
            .populate('freelancer', 'name email');
        
        if (!contract) return res.status(404).json({ message: 'Contrato no encontrado' });

        const milestones = await Milestone.find({ contract: id });
        const deliverables = await Deliverable.find({ milestone: { $in: milestones.map(m => m._id) } });
        const activities = await Activity.find({ contract: id }).sort({ createdAt: -1 });

        // Auto-sync: if all milestones are approved but contract is still ACTIVE, mark as COMPLETED
        if (contract.status === 'ACTIVE' && milestones.length > 0 && milestones.every(m => m.status === 'APPROVED')) {
            contract.status = 'COMPLETED';
            await contract.save();
        }

        res.json({
            contract,
            milestones,
            deliverables,
            activities
        });
    } catch (error) {
        console.error('Error getting contract details:', error);
        res.status(500).json({ message: 'Error al obtener detalles del contrato' });
    }
};

// Subir un entregable para un hito
exports.submitDeliverable = async (req, res) => {
    try {
        const { milestoneId } = req.params;
        const { fileUrl, link, comment } = req.body;
        const userId = req.user.id;

        const milestone = await Milestone.findById(milestoneId);
        if (!milestone) return res.status(404).json({ message: 'Hito no encontrado' });

        // 1. Crear entregable
        const newDeliverable = new Deliverable({
            milestone: milestoneId,
            freelancer: userId,
            fileUrl,
            link,
            comment
        });
        await newDeliverable.save();

        // 2. Actualizar estado del hito
        milestone.status = 'REVIEW';
        await milestone.save();

        // Verificamos si el contrato está activo
        const contract = await Contract.findById(milestone.contract);
        if(contract.status === 'PENDING') {
            return res.status(400).json({ message: 'No puedes subir entregables hasta aceptar el contrato.' });
        }

        // 3. Registrar actividad
        const Message = require('../models/Message');
        await new Message({
            sender: userId,
            receiver: contract.company,
            content: `🚀 He enviado el entregable para el hito "${milestone.title}". Puedes revisarlo en los detalles del contrato.`
        }).save();

        await new Activity({
            contract: milestone.contract,
            user: userId,
            action: 'SUBMITTED_DELIVERABLE',
            description: `Entregable subido para el hito: ${milestone.title}`
        }).save();

        res.status(201).json(newDeliverable);
    } catch (error) {
        console.error('Error submitting deliverable:', error);
        res.status(500).json({ message: 'Error al subir el entregable' });
    }
};

// Revisar (Aprobar/Rechazar) un entregable
exports.reviewDeliverable = async (req, res) => {
    try {
        const { milestoneId } = req.params;
        const { status, comment } = req.body; // status: 'APPROVED' o 'REJECTED'
        const userId = req.user.id;

        const milestone = await Milestone.findById(milestoneId);
        if (!milestone) return res.status(404).json({ message: 'Hito no encontrado' });

        milestone.status = status;
        await milestone.save();

        const actionText = status === 'APPROVED' ? 'aprobado' : 'rechazado';

        const contract = await Contract.findById(milestone.contract);
        const Message = require('../models/Message');
        const actionMsg = status === 'APPROVED' ? '✅ He aprobado' : '❌ He solicitado cambios para';
        await new Message({
            sender: userId,
            receiver: contract.freelancer,
            content: `${actionMsg} tu entregable del hito "${milestone.title}".${comment ? ' Comentarios: ' + comment : ''}`
        }).save();

        // Registrar actividad
        await new Activity({
            contract: milestone.contract,
            user: userId,
            action: `MILESTONE_${status}`,
            description: `El hito ${milestone.title} fue ${actionText}. ${comment ? 'Comentario: ' + comment : ''}`
        }).save();

        // Aquí iría la lógica para liberar el pago en escrow si es APPROVED
        if (status === 'APPROVED') {
            const allMilestones = await Milestone.find({ contract: milestone.contract });
            const allApproved = allMilestones.every(m => m.status === 'APPROVED');
            if (allApproved) {
                contract.status = 'COMPLETED';
                await contract.save();

                const Notification = require('../models/Notification');
                await new Notification({
                    recipient: contract.freelancer,
                    sender: userId,
                    type: 'SYSTEM',
                    message: `¡Felicidades! Todos los hitos han sido aprobados y el proyecto "${contract.title}" se ha completado.`,
                    relatedId: contract._id
                }).save();

                await new Message({
                    sender: userId,
                    receiver: contract.freelancer,
                    content: `🎉 ¡Todos los hitos han sido aprobados! El proyecto "${contract.title}" se ha marcado como COMPLETADO. Gran trabajo.`
                }).save();

                await new Activity({
                    contract: contract._id,
                    user: userId,
                    action: 'CONTRACT_COMPLETED',
                    description: 'Todos los hitos fueron aprobados. Contrato completado.'
                }).save();
            }
        }

        res.json(milestone);
    } catch (error) {
        console.error('Error reviewing deliverable:', error);
        res.status(500).json({ message: 'Error al revisar el entregable' });
    }
};

// Freelancer acepta el contrato propuesto
exports.acceptContract = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const contract = await Contract.findById(id);
        if (!contract) return res.status(404).json({ message: 'Contrato no encontrado' });

        if (contract.freelancer.toString() !== userId) {
            return res.status(403).json({ message: 'No tienes permiso para aceptar este contrato' });
        }

        if (contract.status !== 'PENDING') {
            return res.status(400).json({ message: 'El contrato ya no está pendiente' });
        }

        contract.status = 'ACTIVE';
        await contract.save();

        const Notification = require('../models/Notification'); // Import local to avoid top-level issues if any
        await new Notification({
            recipient: contract.company,
            sender: userId,
            type: 'SYSTEM',
            message: `El freelancer ha aceptado tu contrato "${contract.title}". ¡El proyecto está en marcha!`,
            relatedId: contract._id
        }).save();

        const Message = require('../models/Message');
        await new Message({
            sender: userId,
            receiver: contract.company,
            content: `🎉 He aceptado el contrato "${contract.title}". ¡Empecemos a trabajar!`
        }).save();

        await new Activity({
            contract: contract._id,
            user: userId,
            action: 'CONTRACT_ACCEPTED',
            description: 'El freelancer ha aceptado el contrato y los hitos.'
        }).save();

        res.json({ message: 'Contrato aceptado exitosamente', contract });
    } catch (error) {
        console.error('Error accepting contract:', error);
        res.status(500).json({ message: 'Error interno al aceptar el contrato' });
    }
};

// Freelancer rechaza el contrato propuesto
exports.rejectContract = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { reason } = req.body;

        const contract = await Contract.findById(id);
        if (!contract) return res.status(404).json({ message: 'Contrato no encontrado' });

        if (contract.freelancer.toString() !== userId) {
            return res.status(403).json({ message: 'No tienes permiso para rechazar este contrato' });
        }

        if (contract.status !== 'PENDING') {
            return res.status(400).json({ message: 'El contrato ya no está pendiente' });
        }

        contract.status = 'CANCELLED';
        await contract.save();

        const Notification = require('../models/Notification');
        await new Notification({
            recipient: contract.company,
            sender: userId,
            type: 'SYSTEM',
            message: `El freelancer ha rechazado tu propuesta de contrato "${contract.title}". Motivo: ${reason || 'Sin especificar'}`,
            relatedId: contract._id
        }).save();

        const Message = require('../models/Message');
        await new Message({
            sender: userId,
            receiver: contract.company,
            content: `❌ He rechazado la propuesta de contrato "${contract.title}". Motivo: ${reason || 'Sin especificar'}`
        }).save();

        await new Activity({
            contract: contract._id,
            user: userId,
            action: 'CONTRACT_REJECTED',
            description: `El freelancer ha rechazado el contrato propuesto. Motivo: ${reason || 'Sin especificar'}`
        }).save();

        res.json({ message: 'Contrato rechazado exitosamente', contract });
    } catch (error) {
        console.error('Error rejecting contract:', error);
        res.status(500).json({ message: 'Error interno al rechazar el contrato' });
    }
};

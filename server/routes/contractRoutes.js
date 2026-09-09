import express from 'express';
import Contract from '../models/Contract.js';
import User from '../models/User.js';
import razorpay, { isRazorpayConfigured } from '../config/razorpay.js';
import { protect } from '../middleware/authMiddleware.js';
import { createNotification } from './notificationRoutes.js';

const PLATFORM_FEE_PERCENT = 10;
const router = express.Router();

// GET /api/contracts - Get all contracts relevant to logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const contracts = await Contract.find({
      $or: [{ client: req.user._id }, { freelancer: req.user._id }]
    })
      .populate('client', 'name email avatar')
      .populate('freelancer', 'name email avatar title rating')
      .populate('project', 'title category budget')
      .sort({ createdAt: -1 });
    res.json({ success: true, contracts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/contracts/:id - Get specific contract
router.get('/:id', protect, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('client', 'name email avatar')
      .populate('freelancer', 'name email avatar title rating')
      .populate('project', 'title category budget description');

    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    if (
      contract.client._id.toString() !== req.user._id.toString() &&
      contract.freelancer._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, contract });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 🌟 POST /api/contracts/direct-hire — QA SECTION 8: Real Direct Hire Endpoint
router.post('/direct-hire', protect, async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({ success: false, message: 'Only employers/clients can initiate direct hire' });
    }

    const { freelancerId, title, budget, description } = req.body;
    if (!freelancerId) {
      return res.status(400).json({ success: false, message: 'freelancerId is required' });
    }

    const freelancer = await User.findById(freelancerId);
    if (!freelancer || freelancer.role !== 'freelancer') {
      return res.status(404).json({ success: false, message: 'Freelancer not found' });
    }

    const amount = Number(budget) || 1500;

    const contract = await Contract.create({
      title: title || `Direct Contract with ${freelancer.name}`,
      client: req.user._id,
      freelancer: freelancer._id,
      totalAmount: amount,
      status: 'active',
      milestones: [{
        title: 'Initial Project Deliverable',
        amount: amount,
        status: 'pending',
        description: description || 'Direct hire agreed project deliverables'
      }]
    });

    await createNotification(
      freelancer._id,
      'direct_hire_offer',
      `You received a Direct Hire offer of ₹${amount} from ${req.user.name}!`,
      '/dashboard?tab=contracts'
    );

    res.status(201).json({ success: true, message: 'Direct hire contract created successfully', contract });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/contracts/:id/milestones/:milestoneId/submit - Freelancer submits work
router.post('/:id/milestones/:milestoneId/submit', protect, async (req, res) => {
  try {
    const { submissionNotes } = req.body;
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });
    
    if (contract.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only assigned freelancer can submit work' });
    }

    const milestone = contract.milestones.id(req.params.milestoneId);
    if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found' });

    if (milestone.status !== 'funded') {
      return res.status(400).json({ success: false, message: 'Milestone must be funded before submitting work' });
    }

    milestone.status = 'submitted';
    milestone.submissionNotes = submissionNotes || 'Work delivered for client review';
    await contract.save();

    await createNotification(
      contract.client,
      'milestone_submitted',
      `Work submitted for milestone "${milestone.title}" — review and release when ready.`,
      '/dashboard?tab=contracts'
    );

    res.json({ success: true, message: 'Work submitted for review', contract });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/contracts/:id/milestones/:milestoneId/release - Client releases escrow payment
router.post('/:id/milestones/:milestoneId/release', protect, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });

    if (contract.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only client can release payment' });
    }

    const milestone = contract.milestones.id(req.params.milestoneId);
    if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found' });

    if (milestone.status !== 'submitted') {
      return res.status(400).json({ success: false, message: 'Milestone cannot be released in current state' });
    }

    const platformFee = Math.round(milestone.amount * (PLATFORM_FEE_PERCENT / 100) * 100) / 100;
    const netAmount = Math.round((milestone.amount - platformFee) * 100) / 100;

    milestone.status = 'released';
    milestone.releasedAt = new Date();
    milestone.platformFee = platformFee;

    // Check if all milestones released -> mark contract completed!
    const allReleased = contract.milestones.every(m => m.status === 'released');
    if (allReleased) {
      contract.status = 'completed';
    }

    await contract.save();

    await createNotification(
      contract.freelancer,
      'milestone_released',
      `Payment of ₹${netAmount} released for milestone "${milestone.title}".`,
      '/dashboard?tab=contracts'
    );

    res.json({ success: true, message: 'Payment released to freelancer', contract });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/contracts/:id/dispute
router.post('/:id/dispute', protect, async (req, res) => {
  try {
    const { reason } = req.body;
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });

    const userId = req.user._id.toString();
    if (contract.client.toString() !== userId && contract.freelancer.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'You are not part of this contract' });
    }

    contract.status = 'disputed';
    contract.disputeReason = reason || 'No reason provided';
    contract.disputeRaisedBy = req.user._id;
    await contract.save();

    const otherParty = contract.client.toString() === userId ? contract.freelancer : contract.client;
    await createNotification(
      otherParty,
      'contract_disputed',
      `A dispute was raised on contract "${contract.title}".`,
      '/dashboard?tab=contracts'
    );

    res.json({ success: true, message: 'Dispute raised. Our team will review this contract.', contract });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
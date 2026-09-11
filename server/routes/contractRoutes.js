import express from 'express';
import Contract from '../models/Contract.js';
import User from '../models/User.js';
import razorpay, { isRazorpayConfigured } from '../config/razorpay.js';
import { protect } from '../middleware/authMiddleware.js';
import { createNotification } from './notificationRoutes.js';

const PLATFORM_FEE_PERCENT = 10; // WorkPulse's 10% platform fee
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

// POST /api/contracts/direct-hire — Client initiates direct hire contract
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
      return res.status(400).json({ success: false, message: 'Milestone must be funded in escrow before submitting work' });
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

// =========================================================================
// POST /api/contracts/:id/milestones/:milestoneId/release
// ENHANCED: GATEWAY TRANSFER RECONCILIATION & ATOMIC RECOVERY
// =========================================================================
router.post('/:id/milestones/:milestoneId/release', protect, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    // Client ownership check
    if (contract.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the client can release milestone payments.' });
    }

    const milestone = contract.milestones.id(req.params.milestoneId);
    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found in contract.' });
    }

    const contractIdStr = contract._id.toString();
    const milestoneIdStr = milestone._id.toString();

    // 1. IN-DATABASE IDEMPOTENCY CHECK
    if (milestone.status === 'released' || milestone.razorpayTransferId) {
      if (milestone.status !== 'released') {
        await Contract.updateOne(
          { _id: contract._id, 'milestones._id': milestone._id },
          {
            $set: {
              'milestones.$.status': 'released',
              'milestones.$.releasedAt': milestone.releasedAt || new Date(),
              'milestones.$.platformFee': milestone.platformFee || Math.round(Number(milestone.amount) * (PLATFORM_FEE_PERCENT / 100) * 100) / 100
            }
          }
        );
        const allReleased = contract.milestones.every(m => m.status === 'released');
        if (allReleased) {
          await Contract.updateOne({ _id: contract._id }, { $set: { status: 'completed' } });
        }
      }

      return res.status(200).json({
        success: true,
        message: 'This milestone payout has already been transferred via Razorpay Route.',
        contract,
        transferId: milestone.razorpayTransferId,
        alreadyReleased: true
      });
    }

    // 2. STATE GUARD: Milestone MUST be in 'submitted' state
    if (milestone.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: `Milestone cannot be released in '${milestone.status}' state. It must be submitted by the freelancer first.`
      });
    }

    // 3. GATEWAY CONFIGURATION CHECK
    if (!isRazorpayConfigured || !razorpay) {
      return res.status(503).json({
        success: false,
        message: 'Razorpay payment gateway is not configured on the server.'
      });
    }

    // 4. ESCROW FUNDING VALIDATION
    if (!milestone.razorpayPaymentId) {
      return res.status(400).json({
        success: false,
        message: 'No captured escrow payment ID found for this milestone. Payout cannot proceed.'
      });
    }

    // 5. LIVE CAPTURED PAYMENT STATUS CHECK WITH RAZORPAY
    let paymentDetails;
    try {
      paymentDetails = await razorpay.payments.fetch(milestone.razorpayPaymentId);
    } catch (fetchErr) {
      return res.status(400).json({
        success: false,
        message: `Unable to verify payment with Razorpay: ${fetchErr.error?.description || fetchErr.message}`
      });
    }

    if (!paymentDetails || paymentDetails.status !== 'captured') {
      return res.status(400).json({
        success: false,
        message: `Escrow payment status on Razorpay is '${paymentDetails?.status || 'unknown'}'. Only captured funds can be transferred.`
      });
    }

    // 6. FREELANCER PAYOUT ACCOUNT READINESS CHECK
    const freelancer = await User.findById(contract.freelancer);
    if (!freelancer || !freelancer.razorpayAccountId || !freelancer.razorpayOnboardingComplete) {
      return res.status(400).json({
        success: false,
        message: 'Freelancer has not completed verified Razorpay Route payout onboarding.'
      });
    }

    // 7. CALCULATION: 10% Platform Fee, Net to Freelancer in Paise
    const gross = Number(milestone.amount);
    const platformFee = Math.round(gross * (PLATFORM_FEE_PERCENT / 100) * 100) / 100;
    const netAmount = Math.round((gross - platformFee) * 100) / 100;
    const transferAmountPaise = Math.round(netAmount * 100);

    // =========================================================================
    // 🌟 GATEWAY RECONCILIATION BEFORE TRANSFER (RECOVERY CHECK):
    // Query Razorpay for transfers associated with this captured payment.
    // Inspect transfer notes for contractId and milestoneId.
    // If a matching transfer already exists on Razorpay, RECOVER it and DO NOT duplicate!
    // =========================================================================
    let existingTransfersList = [];
    try {
      let existingTransfersResponse = null;
      if (typeof razorpay.payments.fetchTransfer === 'function') {
        existingTransfersResponse = await razorpay.payments.fetchTransfer(milestone.razorpayPaymentId);
      } else if (typeof razorpay.payments.fetchAllTransfers === 'function') {
        existingTransfersResponse = await razorpay.payments.fetchAllTransfers(milestone.razorpayPaymentId);
      } else {
        const authHeader = 'Basic ' + Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
        const res = await fetch(`https://api.razorpay.com/v1/payments/${milestone.razorpayPaymentId}/transfers`, {
          headers: { Authorization: authHeader }
        });
        if (res.ok) existingTransfersResponse = await res.json();
      }

      existingTransfersList = existingTransfersResponse?.items || (Array.isArray(existingTransfersResponse) ? existingTransfersResponse : []);
    } catch (fetchTransfersErr) {
      console.warn('Notice while inspecting existing payment transfers:', fetchTransfersErr.message);
    }

    // Search for a transfer already made for this exact contract and milestone
    const existingMatchingTransfer = existingTransfersList.find(t => {
      const notes = t.notes || {};
      return String(notes.contractId) === contractIdStr && String(notes.milestoneId) === milestoneIdStr;
    });

    if (existingMatchingTransfer && existingMatchingTransfer.id) {
      const recoveredTransferId = existingMatchingTransfer.id;
      const releasedDate = new Date();

      // Atomically persist recovered transfer ID to MongoDB
      await Contract.updateOne(
        { _id: contract._id, 'milestones._id': milestone._id },
        {
          $set: {
            'milestones.$.status': 'released',
            'milestones.$.razorpayTransferId': recoveredTransferId,
            'milestones.$.releasedAt': milestone.releasedAt || releasedDate,
            'milestones.$.platformFee': platformFee
          }
        }
      );

      const updatedContract = await Contract.findById(contract._id);
      const allReleased = updatedContract?.milestones?.every(m => m.status === 'released');
      if (allReleased && updatedContract.status !== 'completed') {
        await Contract.updateOne({ _id: contract._id }, { $set: { status: 'completed' } });
        updatedContract.status = 'completed';
      }

      await createNotification(
        contract.freelancer,
        'milestone_released',
        `Payment of ₹${netAmount} released for milestone "${milestone.title}". (Transfer ID: ${recoveredTransferId})`,
        '/dashboard?tab=contracts'
      );

      return res.json({
        success: true,
        message: `Payment of ₹${netAmount} successfully transferred to freelancer via Razorpay Route.`,
        contract: updatedContract || contract,
        transferId: recoveredTransferId,
        recoveredFromGateway: true
      });
    }

    // =========================================================================
    // 8. EXECUTE NEW RAZORPAY ROUTE TRANSFER (Only when NO existing transfer exists)
    // =========================================================================
    let transferResponse;
    try {
      transferResponse = await razorpay.payments.transfer(milestone.razorpayPaymentId, {
        transfers: [{
          account: freelancer.razorpayAccountId,
          amount: transferAmountPaise,
          currency: paymentDetails.currency || 'INR',
          on_hold: 0,
          notes: {
            contractId: contractIdStr,
            milestoneId: milestoneIdStr,
            milestoneTitle: milestone.title.substring(0, 30)
          }
        }]
      });
    } catch (transferErr) {
      console.error('Razorpay Route Transfer Error:', transferErr);
      return res.status(502).json({
        success: false,
        message: `Razorpay Route payout transfer failed: ${transferErr.error?.description || transferErr.message || 'Transfer rejected by gateway'}`
      });
    }

    const transferItem = transferResponse?.items?.[0] || transferResponse;
    const transferId = transferItem?.id;

    if (!transferId || typeof transferId !== 'string' || !transferId.startsWith('trf_')) {
      return res.status(502).json({
        success: false,
        message: 'Razorpay Route transfer did not return a valid transfer ID. Milestone remains unreleased.'
      });
    }

    // 🌟 9. ATOMIC MONGODB PERSISTENCE:
    // Persist transfer ID and released status immediately using atomic updateOne
    const releasedDate = new Date();
    await Contract.updateOne(
      { _id: contract._id, 'milestones._id': milestone._id },
      {
        $set: {
          'milestones.$.status': 'released',
          'milestones.$.razorpayTransferId': transferId,
          'milestones.$.releasedAt': releasedDate,
          'milestones.$.platformFee': platformFee
        }
      }
    );

    const updatedContract = await Contract.findById(contract._id);
    const allReleased = updatedContract?.milestones?.every(m => m.status === 'released');
    if (allReleased && updatedContract.status !== 'completed') {
      await Contract.updateOne({ _id: contract._id }, { $set: { status: 'completed' } });
      updatedContract.status = 'completed';
    }

    await createNotification(
      contract.freelancer,
      'milestone_released',
      `Payment of ₹${netAmount} released for milestone "${milestone.title}". (Transfer ID: ${transferId})`,
      '/dashboard?tab=contracts'
    );

    return res.json({
      success: true,
      message: `Payment of ₹${netAmount} successfully transferred to freelancer via Razorpay Route.`,
      contract: updatedContract || contract,
      transferId
    });
  } catch (error) {
    console.error('Release Milestone Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error during milestone release.' });
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

    if (contract.status === 'completed' || contract.status === 'cancelled') {
      return res.status(400).json({ success: false, message: `Cannot dispute a ${contract.status} contract.` });
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
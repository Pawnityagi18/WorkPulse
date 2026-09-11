import express from 'express';
import crypto from 'crypto';
import razorpay, { isRazorpayConfigured } from '../config/razorpay.js';
import User from '../models/User.js';
import Contract from '../models/Contract.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import { createNotification } from './notificationRoutes.js';

const router = express.Router();

const hasWebhookSecret = () => Boolean(process.env.RAZORPAY_WEBHOOK_SECRET);

const safeEqual = (left, right) => {
  if (!left || !right) return false;
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const razorpayUnavailable = (res) => res.status(503).json({
  success: false,
  message: 'Razorpay payment gateway is not configured on the server.'
});

// =========================================================================
// FREELANCER PAYOUT ONBOARDING (RAZORPAY ROUTE LINKED ACCOUNT)
// =========================================================================
router.post('/connect/onboarding', protect, requireRole('freelancer'), async (req, res) => {
  try {
    if (!isRazorpayConfigured || !razorpay) return razorpayUnavailable(res);

    const { name, email, phone, businessName, accountNumber, ifscCode, beneficiaryName, pan } = req.body;

    if (!name || !email || !phone || !accountNumber || !ifscCode || !beneficiaryName || !pan) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, PAN, account number, IFSC code, and beneficiary name are all required.'
      });
    }

    const cleanPan = pan.trim().toUpperCase();
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PAN format. Must be a valid 10-character PAN (e.g. ABCDE1234F).'
      });
    }

    const cleanIfsc = ifscCode.trim().toUpperCase();
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIfsc)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid IFSC code format (e.g. HDFC0001234).'
      });
    }

    const cleanAccount = accountNumber.trim();
    if (!/^\d{8,20}$/.test(cleanAccount)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bank account number. Must contain 8 to 20 digits.'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // Create Linked Account via Razorpay SDK
    const accountPayload = {
      email: email.trim(),
      phone: phone.trim(),
      type: 'route',
      legal_business_name: businessName?.trim() || name.trim(),
      business_type: 'individual',
      contact_name: name.trim(),
      profile: {
        category: 'services',
        subcategory: 'professional_services',
        addresses: {
          registered: {
            street1: 'Main Street',
            city: 'Bengaluru',
            state: 'Karnataka',
            postal_code: '560001',
            country: 'IN'
          }
        }
      },
      legal_info: {
        pan: cleanPan
      }
    };

    const account = await razorpay.accounts.create(accountPayload);

    // Associate Payout Settlement Bank Account with Linked Account
    const authHeader = 'Basic ' + Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
    
    let productData = null;
    try {
      const productRes = await fetch(`https://api.razorpay.com/v2/accounts/${account.id}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({
          product_name: 'route',
          tnc_accepted: true
        })
      });

      if (productRes.ok) {
        productData = await productRes.json();
      }

      if (productData?.id) {
        const patchRes = await fetch(`https://api.razorpay.com/v2/accounts/${account.id}/products/${productData.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader
          },
          body: JSON.stringify({
            settlements: {
              account_number: cleanAccount,
              ifsc_code: cleanIfsc,
              beneficiary_name: beneficiaryName.trim()
            },
            tnc_accepted: true
          })
        });

        if (patchRes.ok) {
          const patched = await patchRes.json();
          productData = patched || productData;
        }
      }
    } catch (settlementErr) {
      console.warn('Route settlement bank association notice:', settlementErr.message);
    }

    // 🌟 STRICT PAYOUT READINESS CHECK (TEST & LIVE MODES ALIKE):
    // Under NO circumstances is Boolean(account.id) or status === 'created' accepted as ready.
    // razorpayOnboardingComplete is true ONLY when Razorpay confirms the setup is 'activated' or 'active'.
    const isConfiguredForPayouts = Boolean(
      account?.status === 'activated' ||
      account?.status === 'active' ||
      productData?.activation_status === 'activated' ||
      productData?.activation_status === 'active'
    );

    // 🔒 SENSITIVE CREDENTIAL HYGIENE: Never store raw bank details in MongoDB.
    user.razorpayAccountId = account.id;
    user.razorpayOnboardingComplete = isConfiguredForPayouts;
    user.razorpayAccountStatus = productData?.activation_status || account.status || 'created';
    await user.save();

    res.json({
      success: true,
      accountId: account.id,
      onboardingComplete: isConfiguredForPayouts,
      status: user.razorpayAccountStatus,
      message: isConfiguredForPayouts
        ? 'Payout account configured and ready to receive funds.'
        : 'Payout account registered. Activation is under review with payment gateway.'
    });
  } catch (error) {
    console.error('Razorpay Onboarding Error:', error);
    const message = error?.error?.description || error.message || 'Could not create payout account on Razorpay.';
    res.status(500).json({ success: false, message });
  }
});

// GET /api/payments/connect/status — Live Payout Readiness Check
router.get('/connect/status', protect, requireRole('freelancer'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user?.razorpayAccountId) {
      return res.json({
        success: true,
        onboardingComplete: false,
        accountId: null,
        status: 'unregistered'
      });
    }

    let isReady = false;
    let currentStatus = user.razorpayAccountStatus || 'created';

    // Verify live status directly with Razorpay SDK
    if (isRazorpayConfigured && razorpay) {
      try {
        const remoteAcc = await razorpay.accounts.fetch(user.razorpayAccountId);
        if (remoteAcc) {
          currentStatus = remoteAcc.status || currentStatus;
          
          // 🌟 STRICT READINESS RULE: Requires confirmed 'activated' or 'active' from Razorpay.
          isReady = Boolean(
            remoteAcc.status === 'activated' ||
            remoteAcc.status === 'active'
          );
          
          if (user.razorpayOnboardingComplete !== isReady || user.razorpayAccountStatus !== currentStatus) {
            user.razorpayOnboardingComplete = isReady;
            user.razorpayAccountStatus = currentStatus;
            await user.save();
          }
        }
      } catch {}
    } else {
      isReady = Boolean(
        user.razorpayAccountStatus === 'activated' ||
        user.razorpayAccountStatus === 'active'
      );
    }

    res.json({
      success: true,
      onboardingComplete: isReady,
      accountId: user.razorpayAccountId,
      status: currentStatus
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================================
// MILESTONE ESCROW CHECKOUT (UNTOUCHED)
// =========================================================================
router.post('/contracts/:contractId/milestones/:milestoneId/checkout', protect, requireRole('client'), async (req, res) => {
  try {
    if (!isRazorpayConfigured || !razorpay) return razorpayUnavailable(res);

    const contract = await Contract.findById(req.params.contractId);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found.' });

    if (contract.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You do not own this contract.' });
    }

    const milestone = contract.milestones.id(req.params.milestoneId);
    if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found.' });

    if (milestone.status === 'payment_processing' && milestone.razorpayOrderId) {
      return res.json({
        success: true,
        orderId: milestone.razorpayOrderId,
        amount: Math.round(milestone.amount * 100),
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID,
        resumed: true
      });
    }

    if (milestone.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Milestone is already in '${milestone.status}' state.` });
    }

    const attempt = (milestone.paymentAttempt || 0) + 1;
    const order = await razorpay.orders.create({
      amount: Math.round(milestone.amount * 100), // paise
      currency: 'INR',
      receipt: `ms_${milestone._id.toString().slice(-16)}_${attempt}`,
      notes: {
        contractId: contract._id.toString(),
        milestoneId: milestone._id.toString()
      }
    });

    milestone.status = 'payment_processing';
    milestone.paymentAttempt = attempt;
    milestone.paymentStartedAt = new Date();
    milestone.razorpayOrderId = order.id;
    await contract.save();

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    const message = error?.error?.description || error.message || 'Could not create payment order.';
    res.status(500).json({ success: false, message });
  }
});

// CANCEL CHECKOUT (UNTOUCHED)
router.post('/contracts/:contractId/milestones/:milestoneId/cancel-checkout', protect, requireRole('client'), async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.contractId);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found.' });

    if (contract.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You do not own this contract.' });
    }

    const milestone = contract.milestones.id(req.params.milestoneId);
    if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found.' });

    if (milestone.status !== 'payment_processing') {
      return res.status(400).json({ success: false, message: 'There is no pending payment checkout to cancel.' });
    }

    if (req.body.orderId && req.body.orderId !== milestone.razorpayOrderId) {
      return res.status(409).json({ success: false, message: 'Checkout order does not match this milestone.' });
    }

    milestone.status = 'pending';
    milestone.razorpayOrderId = undefined;
    milestone.paymentStartedAt = undefined;
    await contract.save();

    res.json({ success: true, contract });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PAYMENT VERIFICATION (UNTOUCHED)
router.post('/verify', protect, async (req, res) => {
  try {
    if (!isRazorpayConfigured || !razorpay) return razorpayUnavailable(res);

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment verification fields.' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (!safeEqual(expectedSignature, razorpay_signature)) {
      return res.status(400).json({ success: false, message: 'Payment signature verification failed.' });
    }

    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    if (payment.order_id !== razorpay_order_id || payment.status !== 'captured') {
      return res.status(409).json({ success: false, message: 'Payment has not been captured on Razorpay.' });
    }

    const funded = await markMilestoneFundedByOrderId(razorpay_order_id, razorpay_payment_id, req.user._id);
    if (!funded) {
      return res.status(409).json({
        success: false,
        funded: false,
        message: 'This payment cannot be applied to the current milestone state.'
      });
    }

    res.json({
      success: true,
      funded: true,
      contract: funded.contract,
      alreadyFunded: funded.alreadyFunded
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

async function markMilestoneFundedByOrderId(orderId, paymentId, expectedClientId = null) {
  const contract = await Contract.findOne({ 'milestones.razorpayOrderId': orderId });
  if (!contract) return false;
  if (expectedClientId && contract.client.toString() !== expectedClientId.toString()) return false;

  const milestone = contract.milestones.find(m => m.razorpayOrderId === orderId);
  if (!milestone) return false;

  if (milestone.status === 'funded' && milestone.razorpayPaymentId === paymentId) {
    return { contract, alreadyFunded: true };
  }

  if (milestone.status !== 'payment_processing') return false;

  milestone.status = 'funded';
  milestone.razorpayPaymentId = paymentId;
  milestone.fundedAt = new Date();
  await contract.save();

  await createNotification(
    contract.freelancer,
    'milestone_funded',
    `Milestone "${milestone.title}" has been funded in escrow — you can start work.`,
    '/dashboard?tab=contracts'
  );

  return { contract, alreadyFunded: false };
}

// WEBHOOK HANDLER (UNTOUCHED)
export async function handleRazorpayWebhook(req, res) {
  if (!hasWebhookSecret()) {
    return res.status(503).json({ success: false, message: 'Razorpay webhook is not configured.' });
  }

  const signature = req.headers['x-razorpay-signature'];
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(req.body)
    .digest('hex');

  if (!safeEqual(signature, expectedSignature)) {
    console.error('⚠️  Razorpay webhook signature verification failed.');
    return res.status(400).json({ success: false, message: 'Invalid signature' });
  }

  const event = JSON.parse(req.body.toString());
  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity;
    if (payment.order_id) {
      await markMilestoneFundedByOrderId(payment.order_id, payment.id);
    }
  }

  res.json({ received: true });
}

export default router;
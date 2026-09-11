import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import Contract from '../models/Contract.js';
import Project from '../models/Project.js';
import Proposal from '../models/Proposal.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'workpulse_jwt_secret_key_2026',
    { expiresIn: '30d' }
  );
};

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role, gender, profession, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: role === 'client' ? 'client' : 'freelancer',
      gender: gender || 'other',
      profession: profession?.trim() || (role === 'client' ? 'Employer' : 'Freelancer'),
      avatar: avatar || undefined
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        rating: user.rating || 5.0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Registration failed.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user || user.isDeleted) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        rating: user.rating || 5.0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Login failed.' });
  }
});

// POST /api/auth/google — Server-Verified Google OAuth
router.post('/google', async (req, res) => {
  try {
    const { credential, role } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential token is required.' });
    }

    const googleVerifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    if (!googleVerifyRes.ok) {
      const errData = await googleVerifyRes.json().catch(() => ({}));
      return res.status(401).json({
        success: false,
        message: errData.error_description || 'Invalid or expired Google credential.'
      });
    }

    const payload = await googleVerifyRes.json();

    if (!payload.email || (payload.email_verified !== 'true' && payload.email_verified !== true)) {
      return res.status(401).json({ success: false, message: 'Google email is not verified.' });
    }

    if (process.env.GOOGLE_CLIENT_ID && payload.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({ success: false, message: 'Google Client ID mismatch.' });
    }

    const email = payload.email.toLowerCase().trim();
    const name = payload.name || payload.given_name || 'Google User';
    const avatar = payload.picture || null;
    const googleId = payload.sub;

    let user = await User.findOne({ email });

    if (user) {
      if (user.isDeleted) {
        return res.status(403).json({ success: false, message: 'This account has been deleted.' });
      }
      let modified = false;
      if (!user.googleId) {
        user.googleId = googleId;
        modified = true;
      }
      if (!user.avatar && avatar) {
        user.avatar = avatar;
        modified = true;
      }
      if (modified) await user.save();
    } else {
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);
      const assignedRole = (role === 'client') ? 'client' : 'freelancer';

      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: assignedRole,
        avatar: avatar || undefined,
        googleId,
        isVerified: true
      });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        rating: user.rating || 5.0
      }
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during Google authentication.' });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user || user.isDeleted) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 🌟 DELETE /api/auth/me — Real Account Deletion & Data Anonymization Flow
router.delete('/me', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Pre-flight Safety Check: Find all contracts where user is client or freelancer
    const userContracts = await Contract.find({
      $or: [{ client: userId }, { freelancer: userId }]
    });

    const hasActiveContract = userContracts.some(c => c.status === 'active' || c.status === 'disputed');
    const hasUnfinishedMilestone = userContracts.some(c =>
      c.milestones && c.milestones.some(m =>
        ['funded', 'submitted', 'payment_processing'].includes(m.status)
      )
    );

    // BLOCK DELETION if active contracts or escrow funds exist
    if (hasActiveContract || hasUnfinishedMilestone) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete account: You have active contracts or pending escrow milestones. Please complete, release, or cancel all active obligations before deleting your account.'
      });
    }

    // 2. Safe Record Deletions (Non-audited, non-financial data)
    // Delete notifications
    await Notification.deleteMany({ recipient: userId });

    // Delete only pending/unaccepted proposals submitted by this user
    await Proposal.deleteMany({ freelancer: userId, status: 'Pending' });

    // For clients: Delete only genuinely open/uncontracted projects that have no accepted proposals or contracts
    const contractedProjectIds = userContracts.map(c => c.project).filter(Boolean);
    const openProjects = await Project.find({
      client: userId,
      status: 'Open',
      _id: { $nin: contractedProjectIds }
    });

    for (const proj of openProjects) {
      const hasAcceptedProposal = await Proposal.exists({ project: proj._id, status: 'Accepted' });
      if (!hasAcceptedProposal) {
        await Proposal.deleteMany({ project: proj._id, status: 'Pending' });
        await Project.findByIdAndDelete(proj._id);
      }
    }

    // 3. Soft-delete and Anonymize User document (Preserves historical foreign-key integrity)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.name = 'Deleted User';
    user.email = `deleted_${user._id}@anonymized.workpulse`;
    const randomPassword = crypto.randomBytes(32).toString('hex');
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(randomPassword, salt);
    user.avatar = null;
    user.bio = '';
    user.skills = [];
    user.razorpayAccountId = null;
    user.razorpayOnboardingComplete = false;
    user.isDeleted = true;
    user.deletedAt = new Date();

    await user.save();

    res.json({
      success: true,
      message: 'Account deleted and personal data anonymized successfully.'
    });
  } catch (error) {
    console.error('Account Deletion Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to delete account on server.' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || user.isDeleted) {
      return res.status(404).json({ success: false, message: 'No user with that email.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 3600000;
    await user.save();

    console.log(`[WorkPulse Password Reset Token] ${resetToken}`);
    res.json({ success: true, message: 'Password reset link generated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and new password required.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user || user.isDeleted) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'workpulse_secret_jwt_key', {
    expiresIn: '30d'
  });
};

// ==========================================
// REGISTRATION HANDLER (Step 1 + Step 2)
// Handles both POST /api/auth/register and /api/auth/signup
// ==========================================
const handleRegister = async (req, res) => {
  try {
    const { name, email, password, role, gender, profession, title, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const userRole = role === 'client' ? 'client' : 'freelancer';
    const professionTitle = (profession || title || (userRole === 'client' ? 'Hiring Client' : 'Full-Stack Developer')).trim();
    const userGender = gender === 'female' ? 'female' : 'male';
    const userAvatar = avatar || '';

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: userRole,
      gender: userGender,
      profession: professionTitle,
      title: professionTitle,
      avatar: userAvatar
    });

    if (user) {
      const token = generateToken(user._id);
      const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        gender: user.gender,
        profession: user.profession || user.title,
        title: user.title || user.profession,
        avatar: user.avatar
      };

      return res.status(201).json({
        success: true,
        token,
        user: userResponse,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data received' });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

router.post('/register', handleRegister);
router.post('/signup', handleRegister);

// ==========================================
// LOGIN HANDLER
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    let isMatch = false;
    if (typeof user.matchPassword === 'function') {
      isMatch = await user.matchPassword(password);
    } else {
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      gender: user.gender,
      profession: user.profession || user.title,
      title: user.title || user.profession,
      avatar: user.avatar
    };

    return res.json({
      success: true,
      token,
      user: userResponse,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: error.message || 'Server error during login' });
  }
});

// ==========================================
// GOOGLE AUTH
// ==========================================
router.post('/google', async (req, res) => {
  try {
    const { credential, email, name, avatar, googleId } = req.body;
    let userEmail = email;
    let userName = name;
    let userAvatar = avatar;

    if (credential && !userEmail) {
      const base64Url = credential.split('.');
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
      const decoded = JSON.parse(jsonPayload);
      userEmail = decoded.email;
      userName = decoded.name;
      userAvatar = decoded.picture;
    }

    if (!userEmail) {
      return res.status(400).json({ message: 'Google authentication failed: Email missing' });
    }

    let user = await User.findOne({ email: userEmail.toLowerCase() });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const randomPassword = Math.random().toString(36).slice(-10) + 'Aa1!';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = await User.create({
        name: userName || 'Google User',
        email: userEmail.toLowerCase(),
        password: hashedPassword,
        avatar: userAvatar || '',
        role: 'freelancer',
        googleId: googleId || ''
      });
    }

    const token = generateToken(user._id);
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      gender: user.gender,
      profession: user.profession || user.title,
      title: user.title || user.profession
    };

    return res.json({
      success: true,
      token,
      user: userResponse,
      isNewUser
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    return res.status(500).json({ message: error.message || 'Server error during Google auth' });
  }
});

// ==========================================
// GET CURRENT USER (/api/auth/me)
// ==========================================
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// ==========================================
// UPDATE CURRENT USER PROFILE (/api/auth/me)
// ==========================================
router.put('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { gender, profession, title, avatar, role } = req.body;

    if (gender) user.gender = gender;
    const professionTitle = profession || title;
    if (professionTitle) {
      user.profession = professionTitle.trim();
      user.title = professionTitle.trim();
    }
    if (avatar) user.avatar = avatar;
    if (role && (role === 'client' || role === 'freelancer')) {
      user.role = role;
    }

    await user.save();

    const updatedUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      gender: user.gender,
      profession: user.profession || user.title,
      title: user.title || user.profession,
      avatar: user.avatar
    };

    return res.json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Profile Update Error:', error);
    return res.status(500).json({ message: error.message || 'Failed to update profile' });
  }
});

// ==========================================
// DELETE CURRENT USER (/api/auth/me)
// ==========================================
router.delete('/me', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    await User.findByIdAndDelete(userId);
    return res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete Account Error:', error);
    return res.status(500).json({ message: error.message || 'Failed to delete account' });
  }
});

export default router;
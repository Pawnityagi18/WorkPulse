import express from 'express';
import User from '../models/User.js';
import Review from '../models/Review.js';

const router = express.Router();

// GET /api/freelancers — Real MongoDB registered freelancers with filters
router.get('/', async (req, res) => {
  try {
    const { search, category, minRate, maxRate, sortBy } = req.query;

    // Strict Role Match: Only registered freelancers
    const query = { role: 'freelancer' };

    // Search by Name, Profession, Skills or Bio
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { title: { $regex: search.trim(), $options: 'i' } },
        { profession: { $regex: search.trim(), $options: 'i' } },
        { skills: { $in: [new RegExp(search.trim(), 'i')] } },
        { bio: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Category Filter
    if (category && category !== 'all') {
      query.$or = query.$or || [];
      query.$or.push(
        { category: category },
        { categoryId: category },
        { categoryName: new RegExp(category, 'i') }
      );
    }

    // Hourly Rate Range Filter
    if (minRate || maxRate) {
      query.hourlyRate = {};
      if (minRate) query.hourlyRate.$gte = Number(minRate);
      if (maxRate) query.hourlyRate.$lte = Number(maxRate);
    }

    // Sorting Options
    let sortOptions = { rating: -1, createdAt: -1 }; // Default: Top Rated
    if (sortBy === 'rate-low') sortOptions = { hourlyRate: 1 };
    if (sortBy === 'rate-high') sortOptions = { hourlyRate: -1 };
    if (sortBy === 'reviews') sortOptions = { reviewsCount: -1 };
    if (sortBy === 'newest') sortOptions = { createdAt: -1 };

    // Strict Security: Strip passwords from public JSON
    const freelancers = await User.find(query)
      .select('-password')
      .sort(sortOptions);

    res.json({
      success: true,
      count: freelancers.length,
      freelancers
    });
  } catch (error) {
    console.error('Fetch Freelancers Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Could not load freelancers' });
  }
});

// GET /api/freelancers/:id — Get specific freelancer profile with verified reviews
router.get('/:id', async (req, res) => {
  try {
    const freelancer = await User.findOne({ _id: req.params.id, role: 'freelancer' }).select('-password');
    if (!freelancer) {
      return res.status(404).json({ success: false, message: 'Freelancer profile not found' });
    }

    // Fetch verified reviews received by this freelancer
    const reviews = await Review.find({ reviewee: freelancer._id })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      freelancer,
      reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
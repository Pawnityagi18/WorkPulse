import express from 'express';
import Project from '../models/Project.js';
import Proposal from '../models/Proposal.js';
import Contract from '../models/Contract.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/projects — Search and filter projects
router.get('/', async (req, res) => {
  try {
    const { search, category, maxBudget, urgency, sort, page = 1, limit = 12 } = req.query;
    const query = {};

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { skills: { $in: [new RegExp(search.trim(), 'i')] } }
      ];
    }

    if (category && category !== 'all') {
      query.$or = query.$or || [];
      query.$or.push(
        { category: category },
        { categoryId: category },
        { categoryName: new RegExp(category, 'i') }
      );
    }

    if (maxBudget) {
      query.budget = { $lte: Number(maxBudget) };
    }

    if (urgency && urgency !== 'all') {
      query.urgency = urgency;
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'budget-high') sortOptions = { budget: -1 };
    if (sort === 'budget-low') sortOptions = { budget: 1 };
    if (sort === 'proposals') sortOptions = { proposalsCount: -1 };
    if (sort === 'urgent') sortOptions = { urgency: -1, createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Project.countDocuments(query);
    const projects = await Project.find(query)
      .populate('client', 'name email avatar rating')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      projects,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/projects/:id — Get specific project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'name email avatar rating reviewsCount');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/projects — Client creates project
router.post('/', protect, requireRole('client'), async (req, res) => {
  try {
    const { title, description, category, categoryId, budget, urgency, skills, deadline } = req.body;

    if (!title || !description || !budget) {
      return res.status(400).json({ success: false, message: 'Title, description, and budget are required.' });
    }

    const project = await Project.create({
      title: title.trim(),
      description: description.trim(),
      category: category || 'development',
      categoryId: categoryId || category || 'development',
      budget: Number(budget),
      urgency: urgency || 'Medium',
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []),
      deadline: deadline || undefined,
      client: req.user._id,
      status: 'Open'
    });

    const populatedProject = await Project.findById(project._id)
      .populate('client', 'name email avatar rating');

    res.status(201).json({ success: true, project: populatedProject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/projects/:id — Client updates open project
router.put('/:id', protect, requireRole('client'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this project.' });
    }

    if (project.status !== 'Open') {
      return res.status(400).json({ success: false, message: 'Only open projects can be edited.' });
    }

    const { title, description, category, budget, urgency, skills } = req.body;
    if (title) project.title = title.trim();
    if (description) project.description = description.trim();
    if (category) project.category = category;
    if (budget) project.budget = Number(budget);
    if (urgency) project.urgency = urgency;
    if (skills) project.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());

    await project.save();
    const updated = await Project.findById(project._id).populate('client', 'name email avatar rating');

    res.json({ success: true, project: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================================
// 🌟 DELETE /api/projects/:id — STRICT OWNER-ONLY SAFE DELETION
// =========================================================================
router.delete('/:id', protect, requireRole('client'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // 1. STRICT OWNER AUTHORIZATION:
    // Only the original client who posted the project can delete it
    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized. Only the client who created this project can delete it.'
      });
    }

    // 2. PROJECT STATUS GUARD:
    // Must be in 'Open' status. In Progress or Completed cannot be deleted.
    if (project.status !== 'Open') {
      return res.status(400).json({
        success: false,
        message: `Cannot delete project in '${project.status}' status. Only open projects can be deleted.`
      });
    }

    // 3. CONTRACT & FINANCIAL OBLIGATION GUARD:
    // If ANY contract exists for this project (active, disputed, completed, cancelled, etc.)
    // BLOCK deletion. Reason: Contractual, financial, milestone, and Razorpay audit trails must never be orphaned.
    const existingContract = await Contract.findOne({ project: project._id });
    if (existingContract) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete project: A contract already exists for this project. Historical, financial, and active contract records must be preserved.'
      });
    }

    // 4. ACCEPTED PROPOSAL GUARD:
    // If an accepted proposal exists, a hiring commitment exists — BLOCK deletion.
    const hasAcceptedProposal = await Proposal.exists({
      project: project._id,
      status: 'Accepted'
    });
    if (hasAcceptedProposal) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete project: An accepted proposal exists for this project.'
      });
    }

    // 5. PRUNE PENDING PROPOSALS & DELETE PROJECT:
    // If only pending/unaccepted proposals exist and there is zero contract/escrow obligation:
    // Clean up pending proposals first, then delete the project document.
    await Proposal.deleteMany({ project: project._id, status: 'Pending' });
    await project.deleteOne();

    res.json({
      success: true,
      message: 'Project and associated pending proposals deleted successfully.'
    });
  } catch (error) {
    console.error('Delete Project Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to delete project.' });
  }
});

export default router;
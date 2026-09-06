import express from 'express';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. CLIENT: Project Description Generator
router.post('/project-description', protect, requireRole('client'), async (req, res) => {
  const { title, category, skills = [], budget, notes = '' } = req.body;

  if (!title?.trim() || !category?.trim()) {
    return res.status(400).json({ success: false, message: 'Title and category are required.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ success: false, message: 'AI is not configured. Set GEMINI_API_KEY in .env' });
  }

  try {
    const formattedSkills = Array.isArray(skills) ? skills.join(', ') : skills;

    const prompt = `You are an expert technical project manager drafting a professional freelance job posting.
Write a clean, detailed, and professional project description for:
- Project Title: ${title}
- Category: ${category}
- Required Skills: ${formattedSkills}
- Budget: ${budget || 'Negotiable'}
- Client Notes: ${notes || 'None'}

Formatting Rules:
- STRICTLY DO NOT USE any asterisks (* or **).
- Use clean uppercase headings (PROJECT OVERVIEW:, PROPOSED SOLUTION:, TECH STACK:, KEY DELIVERABLES:, CANDIDATE REQUIREMENTS:).
- Use clean numbered lists (1., 2., 3.) or hyphens (- ) for bullet points.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1200, temperature: 0.7 }
        })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return res.status(502).json({ success: false, message: data?.error?.message || 'Gemini generation failed.' });
    }

    let description = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!description) {
      return res.status(502).json({ success: false, message: 'AI returned no description.' });
    }

    description = description.replace(/\*{1,3}/g, '').trim();
    res.json({ success: true, description });
  } catch (error) {
    console.error('AI Project Description Error:', error);
    res.status(502).json({ success: false, message: 'AI service is unavailable.' });
  }
});

// 2. FREELANCER: Real AI Proposal / Cover Letter Generator
router.post('/generate-proposal', protect, requireRole('freelancer'), async (req, res) => {
  const { projectTitle, projectDescription, requiredSkills = [], proposedBudget, currentDraft = '' } = req.body;

  if (!projectTitle?.trim()) {
    return res.status(400).json({ success: false, message: 'Project title is required.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ success: false, message: 'AI is not configured. Set GEMINI_API_KEY in .env' });
  }

  try {
    const formattedSkills = Array.isArray(requiredSkills) ? requiredSkills.join(', ') : requiredSkills;

    const prompt = `You are a top-rated professional freelance developer writing a winning proposal/bid on Upwork or Freelancer.

Project Details:
- Title: ${projectTitle}
- Client Description: ${projectDescription || 'Not provided'}
- Required Skills: ${formattedSkills}
- Proposed Budget: ${proposedBudget || 'Client budget'}
${currentDraft ? `- Freelancer Draft Notes: ${currentDraft}` : ''}

Rules:
- Write a compelling, personalized, and professional cover letter (150-200 words).
- Address the client's requirements directly.
- STRICTLY DO NOT USE any asterisks (* or **). No bold syntax with asterisks.
- Format with clean paragraphs and hyphens (- ) if listing points.
- Structure:
  1. Friendly greeting and understanding of the project.
  2. How you will deliver this using the required technologies (${formattedSkills}).
  3. Clear timeline/milestone commitment.
  4. Professional closing call-to-action.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 800, temperature: 0.7 }
        })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return res.status(502).json({ success: false, message: data?.error?.message || 'Gemini generation failed.' });
    }

    let proposal = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!proposal) {
      return res.status(502).json({ success: false, message: 'AI returned no proposal.' });
    }

    proposal = proposal.replace(/\*{1,3}/g, '').trim();
    res.json({ success: true, proposal });
  } catch (error) {
    console.error('AI Proposal Generation Error:', error);
    res.status(502).json({ success: false, message: 'AI service is unavailable.' });
  }
});

export default router;
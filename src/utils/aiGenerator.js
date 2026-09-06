// WorkPulse AI Proposal & Cover Letter Generator Engine (Real Gemini 3.6 Flash)

export const generateAIProposal = async (project, freelancerName = '', currentDraft = '') => {
  try {
    // Auth token retrieve karna
    const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user') || '{}')?.token;

    // Backend Gemini API ko call karna
    const response = await fetch('/api/ai/generate-proposal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        projectTitle: project?.title || 'Freelance Project',
        projectDescription: project?.description || '',
        requiredSkills: project?.skills || [],
        proposedBudget: project?.budget || '',
        currentDraft: currentDraft || ''
      })
    });

    const data = await response.json();
    if (response.ok && data.success && data.proposal) {
      return data.proposal;
    }

    console.warn('Backend AI returned message, using fallback:', data.message);
  } catch (error) {
    console.warn('AI API call failed, using fallback template:', error);
  }

  // Graceful Fallback Template (Offline ya Error aane par)
  const skillsList = project?.skills && project.skills.length > 0 
    ? project.skills.join(', ') 
    : 'modern tech stack';

  const name = freelancerName || 'Professional Freelancer';
  const clientName = project?.clientCompany || project?.clientName || 'Hiring Manager';

  return `Dear ${clientName},

I am excited to submit my proposal for "${project?.title || 'your project'}". As a specialist experienced in ${skillsList}, I am confident in delivering exceptional, production-grade results within your target timeframe.

Why I am the best fit for your project:
1. Technical Expertise: Hands-on mastery of ${skillsList} matching your exact requirements.
2. High Performance & Security: Clean, scalable architecture adhering to modern industry best practices.
3. Transparent Workflow: Clear communication with regular milestone updates.

I am available to start immediately and look forward to discussing the project details with you.

Best regards,
${name}`;
};
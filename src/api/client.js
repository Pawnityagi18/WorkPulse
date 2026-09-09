// WorkPulse Production API Client
// STRICT PRODUCTION RULES: Zero Fake Fallbacks · Zero Mock Generations · Strict Error Propagation

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : '/api');

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('workpulse_token') || localStorage.getItem('token');
  }
  return null;
};

export const setAuthToken = (token) => {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('workpulse_token', token);
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('workpulse_token');
      localStorage.removeItem('token');
    }
  }
};

const getHeaders = (isJson = true) => {
  const headers = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const safeFetchJson = async (url, options = {}) => {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers ? res.headers.get('content-type') : '';
    if (contentType && contentType.includes('application/json')) {
      const data = await res.json().catch(() => ({}));
      return { ok: res.ok, status: res.status, data };
    }
    return { ok: false, status: res.status, data: null, isHtmlResponse: true };
  } catch (err) {
    return { ok: false, status: 500, data: null, isNetworkError: true, error: err.message };
  }
};

export const checkServerHealth = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/health`).catch(() => null);
    if (!res || !res.ok) return false;
    const contentType = res.headers ? res.headers.get('content-type') : '';
    if (!contentType || !contentType.includes('application/json')) return false;
    const data = await res.json().catch(() => ({}));
    return data.status === 'OK';
  } catch {
    return false;
  }
};

// ================= AUTHENTICATION (STRICT REAL MONGODB) =================
export const apiLogin = async (credentials) => {
  const result = await safeFetchJson(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(credentials)
  });

  if (result.ok && result.data && result.data.success) {
    if (result.data.token) setAuthToken(result.data.token);
    return result.data;
  }

  throw new Error(result.data?.message || 'Invalid email or password');
};

export const apiSignup = async (userData) => {
  const result = await safeFetchJson(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(userData)
  });

  if (result.ok && result.data && result.data.success) {
    if (result.data.token) setAuthToken(result.data.token);
    return result.data;
  }

  throw new Error(result.data?.message || 'Registration failed. Check your details.');
};

export const apiFetchMe = async () => {
  const token = getAuthToken();
  if (!token) return null;

  const result = await safeFetchJson(`${API_BASE_URL}/auth/me`, {
    headers: getHeaders(false)
  });

  if (result.ok && result.data && result.data.user) {
    return result.data.user;
  }
  return null;
};

// ================= PROJECTS (REAL DATABASE DRIVEN) =================
export const apiFetchProjects = async () => {
  const result = await safeFetchJson(`${API_BASE_URL}/projects`);
  if (result.ok && result.data) {
    if (Array.isArray(result.data.projects)) return result.data.projects;
    if (Array.isArray(result.data)) return result.data;
  }
  return [];
};

export const apiCreateProject = async (projectData) => {
  const result = await safeFetchJson(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(projectData)
  });

  if (result.ok && result.data && result.data.project) {
    return result.data.project;
  }

  throw new Error(result.data?.message || 'Failed to create project on server');
};

export const apiSearchProjects = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      params.set(key, value);
    }
  });

  const result = await safeFetchJson(`${API_BASE_URL}/projects?${params.toString()}`);
  if (result.ok && result.data?.projects) {
    return result.data;
  }
  throw new Error(result.data?.message || 'Could not load projects from server');
};

// ================= FREELANCERS (REAL MONGODB USERS) =================
export const apiFetchFreelancers = async () => {
  const result = await safeFetchJson(`${API_BASE_URL}/freelancers`);
  if (result.ok && result.data) {
    if (Array.isArray(result.data.freelancers)) return result.data.freelancers;
    if (Array.isArray(result.data)) return result.data;
  }
  return [];
};

// ================= PROPOSALS (REAL DATABASE DRIVEN) =================
export const apiFetchProposals = async () => {
  const result = await safeFetchJson(`${API_BASE_URL}/proposals`, {
    headers: getHeaders(false)
  });

  if (result.ok && result.data) {
    if (Array.isArray(result.data.proposals)) return result.data.proposals;
    if (Array.isArray(result.data)) return result.data;
  }
  return [];
};

export const apiSubmitProposal = async (proposalData) => {
  const result = await safeFetchJson(`${API_BASE_URL}/proposals`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(proposalData)
  });

  if (result.ok && result.data && result.data.proposal) {
    return result.data.proposal;
  }

  throw new Error(result.data?.message || 'Failed to submit proposal');
};

export const apiAcceptProposal = async (proposalId) => {
  const result = await safeFetchJson(`${API_BASE_URL}/proposals/${proposalId}/accept`, {
    method: 'POST',
    headers: getHeaders()
  });

  if (result.ok && result.data && (result.data.success || result.data.contract)) {
    return result.data;
  }

  throw new Error(result.data?.message || 'Could not accept proposal on server');
};

export const apiRejectProposal = async (proposalId) => {
  const result = await safeFetchJson(`${API_BASE_URL}/proposals/${proposalId}/reject`, {
    method: 'POST',
    headers: getHeaders()
  });

  if (result.ok && result.data?.success) {
    return result.data;
  }

  throw new Error(result.data?.message || 'Could not reject proposal');
};

// ================= CONTRACTS & DIRECT HIRE =================
export const apiFetchContracts = async () => {
  const result = await safeFetchJson(`${API_BASE_URL}/contracts`, {
    headers: getHeaders(false)
  });

  if (result.ok && result.data && Array.isArray(result.data.contracts)) {
    return result.data.contracts;
  }
  if (result.ok && Array.isArray(result.data)) {
    return result.data;
  }
  return [];
};

export const apiDirectHire = async (freelancerId, offerDetails) => {
  const result = await safeFetchJson(`${API_BASE_URL}/contracts/direct-hire`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ freelancerId, ...offerDetails })
  });

  if (result.ok && result.data && (result.data.contract || result.data.success)) {
    return result.data;
  }

  throw new Error(result.data?.message || 'Could not create direct hire contract');
};

export const apiSubmitMilestone = async (contractId, milestoneId, submissionNotes) => {
  const result = await safeFetchJson(`${API_BASE_URL}/contracts/${contractId}/milestones/${milestoneId}/submit`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ submissionNotes })
  });

  if (result.ok && result.data && result.data.contract) {
    return result.data.contract;
  }

  throw new Error(result.data?.message || 'Submitting work failed');
};

export const apiReleaseMilestone = async (contractId, milestoneId) => {
  const result = await safeFetchJson(`${API_BASE_URL}/contracts/${contractId}/milestones/${milestoneId}/release`, {
    method: 'POST',
    headers: getHeaders()
  });

  if (result.ok && result.data && result.data.contract) {
    return result.data.contract;
  }

  throw new Error(result.data?.message || 'Releasing payment failed');
};

// ================= PAYMENTS (RAZORPAY) =================
export const apiFundMilestone = async (contractId, milestoneId) => {
  const result = await safeFetchJson(`${API_BASE_URL}/payments/contracts/${contractId}/milestones/${milestoneId}/checkout`, {
    method: 'POST',
    headers: getHeaders()
  });

  if (result.ok && result.data && result.data.orderId) {
    return result.data;
  }

  throw new Error(result.data?.message || 'Starting checkout failed');
};

export const apiVerifyPayment = async (payload) => {
  const result = await safeFetchJson(`${API_BASE_URL}/payments/verify`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });

  if (result.ok && result.data?.success) {
    return result.data;
  }

  throw new Error(result.data?.message || 'Payment verification failed on server');
};

export const apiCancelMilestoneCheckout = async (contractId, milestoneId, orderId) => {
  const result = await safeFetchJson(`${API_BASE_URL}/payments/contracts/${contractId}/milestones/${milestoneId}/cancel-checkout`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ orderId })
  });

  if (result.ok && result.data?.contract) return result.data.contract;
  throw new Error(result.data?.message || 'Could not cancel payment checkout');
};

export const apiStartPayoutOnboarding = async (details) => {
  const result = await safeFetchJson(`${API_BASE_URL}/payments/connect/onboarding`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(details)
  });

  if (result.ok) return result.data;
  throw new Error(result.data?.message || 'Could not create payout account');
};

export const apiGetPayoutStatus = async () => {
  const result = await safeFetchJson(`${API_BASE_URL}/payments/connect/status`, {
    headers: getHeaders(false)
  });

  return result.ok ? result.data : { onboardingComplete: false };
};

// ================= REAL AI ENDPOINTS (GEMINI 3.6 FLASH) =================
export const apiGenerateProjectDescription = async (details) => {
  const result = await safeFetchJson(`${API_BASE_URL}/ai/project-description`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(details)
  });

  if (result.ok && result.data?.description) return result.data.description;
  throw new Error(result.data?.message || 'AI service failed to generate description');
};

// ================= MESSAGES & WORKROOM =================
export const apiFetchMessages = async (contractId) => {
  const result = await safeFetchJson(`${API_BASE_URL}/messages/${contractId}`, {
    headers: getHeaders(false)
  });

  if (result.ok && result.data && result.data.messages) {
    return result.data.messages;
  }
  return [];
};

export const apiSendMessage = async (contractId, content) => {
  const result = await safeFetchJson(`${API_BASE_URL}/messages/${contractId}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ content })
  });

  if (result.ok && result.data && result.data.message) {
    return result.data.message;
  }

  throw new Error(result.data?.message || 'Failed to deliver message');
};

// ================= NOTIFICATIONS =================
export const apiFetchNotifications = async () => {
  const result = await safeFetchJson(`${API_BASE_URL}/notifications`, {
    headers: getHeaders(false)
  });
  return result.ok && result.data ? result.data : { notifications: [], unreadCount: 0 };
};

export const apiMarkNotificationRead = async (id) => {
  const result = await safeFetchJson(`${API_BASE_URL}/notifications/${id}/read`, {
    method: 'PATCH',
    headers: getHeaders(false)
  });
  return result.ok;
};

export const apiMarkAllNotificationsRead = async () => {
  const result = await safeFetchJson(`${API_BASE_URL}/notifications/read-all`, {
    method: 'PATCH',
    headers: getHeaders(false)
  });
  return result.ok;
};

// ================= AVATAR UPLOAD =================
export const apiUploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  const token = getAuthToken();
  const result = await safeFetchJson(`${API_BASE_URL}/uploads/avatar`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData
  });

  if (result.ok && result.data) return result.data;
  throw new Error(result.data?.message || 'Avatar upload failed');
};

// ================= REVIEWS =================
export const apiSubmitReview = async (contractId, rating, comment) => {
  const result = await safeFetchJson(`${API_BASE_URL}/reviews`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ contractId, rating, comment })
  });

  if (result.ok && result.data) return result.data;
  throw new Error(result.data?.message || 'Could not submit review');
};

export const apiFetchUserReviews = async (userId) => {
  const result = await safeFetchJson(`${API_BASE_URL}/reviews/user/${userId}`, {
    headers: getHeaders(false)
  });
  return result.ok ? (result.data.reviews || []) : [];
};

export const apiCheckAlreadyReviewed = async (contractId) => {
  const result = await safeFetchJson(`${API_BASE_URL}/reviews/contract/${contractId}`, {
    headers: getHeaders(false)
  });
  return result.ok ? result.data.alreadyReviewed : false;
};

// ================= PASSWORD RESET =================
export const apiForgotPassword = async (email) => {
  const result = await safeFetchJson(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email })
  });
  return result.ok ? result.data : { success: false, message: result.data?.message || 'Something went wrong.' };
};

export const apiResetPassword = async (token, password) => {
  const result = await safeFetchJson(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ token, password })
  });
  return result.ok ? result.data : { success: false, message: result.data?.message || 'Reset failed.' };
};

// ================= DISPUTES =================
export const apiRaiseDispute = async (contractId, reason) => {
  const result = await safeFetchJson(`${API_BASE_URL}/contracts/${contractId}/dispute`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ reason })
  });
  if (result.ok && result.data) return result.data;
  throw new Error(result.data?.message || 'Could not raise dispute');
};
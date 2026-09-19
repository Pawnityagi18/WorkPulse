export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000'
    : 'https://workpulse-z287.onrender.com')
).replace(/\/+$/, '');

export const getHeaders = (includeAuth = true, extraHeaders = {}) => {
  const headers = { 'Content-Type': 'application/json', ...extraHeaders };
  if (includeAuth && typeof window !== 'undefined') {
    const token = localStorage.getItem('workpulse_token');
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

export const safeFetchJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.message || data.error || `Request failed (${response.status})`;
    throw new Error(errorMsg);
  }
  return data;
};

// Shorthand helpers for backend API calls
const get = (path, params) => {
  const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
  return safeFetchJson(`${API_BASE_URL}/api${path}${qs}`, { headers: getHeaders() });
};

const post = (path, data) =>
  safeFetchJson(`${API_BASE_URL}/api${path}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });

const put = (path, data) =>
  safeFetchJson(`${API_BASE_URL}/api${path}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });

const patch = (path, data) =>
  safeFetchJson(`${API_BASE_URL}/api${path}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: data ? JSON.stringify(data) : undefined
  });

const del = (path) =>
  safeFetchJson(`${API_BASE_URL}/api${path}`, {
    method: 'DELETE',
    headers: getHeaders()
  });

// Clean list unwrap without any circular references
const unwrap = (res, key) => {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res[key])) return res[key];
  if (res && Array.isArray(res.data)) return res.data;
  return [];
};

// ==========================================
// SYSTEM & TOKEN HELPERS
// ==========================================

export const setAuthToken = (token) => {
  if (typeof window !== 'undefined') {
    if (token) localStorage.setItem('workpulse_token', token);
    else localStorage.removeItem('workpulse_token');
  }
};

export const checkServerHealth = async () =>
  fetch(`${API_BASE_URL}/health`).then((r) => r.ok).catch(() => true);

// ==========================================
// AUTHENTICATION & PROFILE
// ==========================================

export const apiSignup = (userData) => {
  const professionTitle = (
    userData.profession ||
    userData.title ||
    (userData.role === 'client' ? 'Hiring Client' : 'Full-Stack Developer')
  ).trim();

  return safeFetchJson(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify({
      ...userData,
      profession: professionTitle,
      title: professionTitle
    })
  });
};

export const apiLogin = (credentials) =>
  safeFetchJson(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify(credentials)
  });

export const apiGoogleAuth = (payload) =>
  safeFetchJson(`${API_BASE_URL}/api/auth/google`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify(payload)
  });

export const apiGetMe = async () => {
  try {
    const res = await get('/auth/me');
    return res && res.user ? res.user : res;
  } catch {
    return null;
  }
};

export const apiFetchMe = apiGetMe;

export const apiUpdateProfile = (profileData) => {
  const professionTitle = (profileData.profession || profileData.title || '').trim();
  const body = professionTitle
    ? { ...profileData, profession: professionTitle, title: professionTitle }
    : profileData;
  return put('/auth/me', body);
};

export const apiDeleteAccount = () => del('/auth/me');

export const apiLogout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('workpulse_token');
    localStorage.removeItem('workpulse_user');
  }
};

export const apiChangePassword = (passwords) => post('/auth/change-password', passwords);

export const apiUploadAvatar = async (formData) => {
  const isForm = typeof FormData !== 'undefined' && formData instanceof FormData;
  const token = typeof window !== 'undefined' ? localStorage.getItem('workpulse_token') : null;
  const headers = isForm
    ? (token ? { Authorization: `Bearer ${token}` } : {})
    : getHeaders();

  const response = await fetch(`${API_BASE_URL}/api/auth/avatar`, {
    method: 'POST',
    headers,
    body: isForm ? formData : JSON.stringify(formData)
  });
  return response.json().catch(() => ({}));
};

export const apiUploadResume = apiUploadAvatar;
export const apiUploadFile = apiUploadAvatar;

// ==========================================
// NOTIFICATIONS
// ==========================================

export const apiFetchNotifications = () =>
  get('/notifications').then((r) => unwrap(r, 'notifications')).catch(() => []);

export const apiMarkNotificationRead = (id) =>
  patch(`/notifications/${id}/read`).catch(() => ({}));

export const apiMarkAllNotificationsRead = () =>
  patch('/notifications/read-all').catch(() => ({}));

// ==========================================
// PROJECTS & AI GENERATION
// ==========================================

export const apiGenerateProjectDescription = (payload) => {
  const body = typeof payload === 'string' ? { prompt: payload } : payload;
  return post('/ai/generate-description', body).catch(() => ({ description: '' }));
};

export const apiGenerateJobDescription = apiGenerateProjectDescription;

export const apiFetchProjects = (params = {}) =>
  get('/projects', params).then((r) => unwrap(r, 'projects')).catch(() => []);

export const apiSearchProjects = async (params = {}) => {
  try {
    const query = typeof params === 'string' ? { q: params } : { ...params };
    if (query.search && !query.q) query.q = query.search;
    const res = await get('/projects/search', query).catch(() => get('/projects', query));
    return unwrap(res, 'projects');
  } catch {
    return [];
  }
};

export const apiCreateProject = (projectData) => post('/projects', projectData);
export const apiFetchProjectById = (id) => get(`/projects/${id}`);
export const apiUpdateProject = (id, data) => put(`/projects/${id}`, data);
export const apiDeleteProject = (id) => del(`/projects/${id}`);
export const apiCloseProject = (id) => patch(`/projects/${id}/close`);

export const apiFetchProjectProposals = (id) =>
  get(`/projects/${id}/proposals`).then((r) => unwrap(r, 'proposals')).catch(() => []);

// ==========================================
// PROPOSALS
// ==========================================

export const apiFetchProposals = (params = {}) =>
  get('/proposals', params).then((r) => unwrap(r, 'proposals')).catch(() => []);

export const apiSubmitProposal = (data) => post('/proposals', data);
export const apiAcceptProposal = (id) => patch(`/proposals/${id}/accept`);
export const apiRejectProposal = (id) => patch(`/proposals/${id}/reject`);
export const apiWithdrawProposal = (id) => del(`/proposals/${id}`);
export const apiUpdateProposal = (id, data) => put(`/proposals/${id}`, data);

// ==========================================
// CONTRACTS & MILESTONES
// ==========================================

export const apiFetchContracts = (params = {}) =>
  get('/contracts', params).then((r) => unwrap(r, 'contracts')).catch(() => []);

export const apiFetchContractById = (id) => get(`/contracts/${id}`);
export const apiUpdateContract = (id, data) => put(`/contracts/${id}`, data);
export const apiCompleteContract = (id) => patch(`/contracts/${id}/complete`);
export const apiCancelContract = (id) => patch(`/contracts/${id}/cancel`);

export const apiSubmitMilestone = (contractId, milestoneIndex) =>
  post(`/contracts/${contractId}/milestone/${milestoneIndex}/submit`);

export const apiApproveMilestone = (contractId, milestoneIndex) =>
  post(`/contracts/${contractId}/milestone/${milestoneIndex}/approve`);

export const apiReleaseMilestone = (contractId, milestoneIndex) =>
  post(`/contracts/${contractId}/milestones/${milestoneIndex}/release`, {
    contractId,
    milestoneIndex
  });

export const apiFundMilestone = (contractId, milestoneIndex) =>
  post(`/contracts/${contractId}/milestones/${milestoneIndex}/fund`, {
    contractId,
    milestoneIndex
  });

export const apiCancelMilestoneCheckout = (contractId, milestoneIndex) =>
  post(`/contracts/${contractId}/milestones/${milestoneIndex}/cancel-checkout`, {
    contractId,
    milestoneIndex
  }).catch(() => ({}));

// ==========================================
// PAYMENTS & PAYOUTS
// ==========================================

export const apiVerifyPayment = (payload) =>
  post('/payments/verify', typeof payload === 'string' ? { sessionId: payload } : payload);

export const apiGetPayoutStatus = () =>
  get('/payments/payout-status').catch(() => ({ status: 'unconfigured' }));

export const apiStartPayoutOnboarding = () =>
  post('/payments/onboard-payout').catch(() => ({ url: '#' }));

export const apiDepositEscrow = (contractId, amount) =>
  post('/escrow/deposit', { contractId, amount });

export const apiReleaseEscrow = (contractId) =>
  post('/escrow/release', { contractId });

export const apiReleasePayment = apiReleaseEscrow;

export const apiFetchTransactions = () => get('/payments/transactions').catch(() => []);
export const apiFetchInvoices = () => get('/payments/invoices').catch(() => []);

// ==========================================
// FREELANCERS & DIRECT HIRE
// ==========================================

export const apiFetchFreelancers = (params = {}) =>
  get('/freelancers', params).then((r) => unwrap(r, 'freelancers')).catch(() => []);

export const apiFetchFreelancerById = (id) => get(`/freelancers/${id}`);
export const apiFetchFreelancerProfile = apiFetchFreelancerById;
export const apiUpdateFreelancerProfile = (data) => put('/freelancers/profile', data);
export const apiDirectHire = (hireData) => post('/contracts/direct-hire', hireData);

// ==========================================
// REVIEWS & CHAT
// ==========================================

export const apiCreateReview = (reviewData) => post('/reviews', reviewData);
export const apiFetchReviews = (params = {}) => get('/reviews', params).catch(() => []);

export const apiFetchMessages = (conversationId) =>
  get(`/messages/${conversationId}`).catch(() => []);

export const apiSendMessage = (messageData) => post('/messages', messageData);
export const apiFetchConversations = () => get('/messages/conversations').catch(() => []);

export const apiMarkMessagesRead = (conversationId) =>
  patch(`/messages/${conversationId}/read`).catch(() => ({}));

// ==========================================
// DASHBOARD & STATS
// ==========================================

export const apiFetchStats = () => get('/dashboard/stats').catch(() => ({}));
export const apiFetchDashboard = () => get('/dashboard').catch(() => ({}));
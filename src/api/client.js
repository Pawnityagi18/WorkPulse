export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

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
    throw new Error(data.message || data.error || `Request failed (${response.status})`);
  }
  return data;
};

// Internal shorthand helpers
const apiGet = (path, params) => {
  const qs = params ? `?${new URLSearchParams(params)}` : '';
  return safeFetchJson(`${API_BASE_URL}/api${path}${qs}`, { headers: getHeaders() });
};
const apiPost = (path, data) =>
  safeFetchJson(`${API_BASE_URL}/api${path}`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
const apiPut = (path, data) =>
  safeFetchJson(`${API_BASE_URL}/api${path}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) });
const apiPatch = (path, data) =>
  safeFetchJson(`${API_BASE_URL}/api${path}`, { method: 'PATCH', headers: getHeaders(), body: data ? JSON.stringify(data) : undefined });
const apiDel = (path) =>
  safeFetchJson(`${API_BASE_URL}/api${path}`, { method: 'DELETE', headers: getHeaders() });

// ==========================================
// SYSTEM & AUTHENTICATION
// ==========================================

export const setAuthToken = (token) => {
  if (typeof window !== 'undefined') {
    token ? localStorage.setItem('workpulse_token', token) : localStorage.removeItem('workpulse_token');
  }
};

export const checkServerHealth = async () =>
  fetch(`${API_BASE_URL}/health`).then(r => r.ok).catch(() => true);

export const apiSignup = (userData) => {
  const title = (userData.profession || userData.title || (userData.role === 'client' ? 'Hiring Client' : 'Full-Stack Developer')).trim();
  return safeFetchJson(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify({ ...userData, profession: title, title })
  });
};

export const apiLogin = (creds) =>
  safeFetchJson(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify(creds)
  });

export const apiGoogleAuth = (payload) =>
  safeFetchJson(`${API_BASE_URL}/api/auth/google`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify(payload)
  });

export const apiGetMe = () => apiGet('/auth/me');
export const apiFetchMe = apiGetMe;

export const apiUpdateProfile = (data) => {
  const title = (data.profession || data.title || '').trim();
  const body = title ? { ...data, profession: title, title } : data;
  return apiPut('/auth/me', body);
};

export const apiDeleteAccount = () => apiDel('/auth/me');

export const apiLogout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('workpulse_token');
    localStorage.removeItem('workpulse_user');
  }
};

export const apiChangePassword = (data) => apiPost('/auth/change-password', data);

export const apiUploadAvatar = async (formData) => {
  const isForm = typeof FormData !== 'undefined' && formData instanceof FormData;
  const token = typeof window !== 'undefined' ? localStorage.getItem('workpulse_token') : null;
  const headers = isForm ? (token ? { Authorization: `Bearer ${token}` } : {}) : getHeaders();
  const res = await fetch(`${API_BASE_URL}/api/auth/avatar`, {
    method: 'POST',
    headers,
    body: isForm ? formData : JSON.stringify(formData)
  });
  return res.json().catch(() => ({}));
};

export const apiUploadResume = apiUploadAvatar;
export const apiUploadFile = apiUploadAvatar;

// ==========================================
// NOTIFICATIONS
// ==========================================

export const apiFetchNotifications = () => apiGet('/notifications').catch(() => []);
export const apiMarkNotificationRead = (id) => apiPatch(`/notifications/${id}/read`).catch(() => ({}));
export const apiMarkAllNotificationsRead = () => apiPatch('/notifications/read-all').catch(() => ({}));

// ==========================================
// PROJECTS & AI GENERATION
// ==========================================

export const apiFetchProjects = (params) => apiGet('/projects', params);
export const apiSearchProjects = (q = '') => apiGet('/projects/search', { q });
export const apiCreateProject = (data) => apiPost('/projects', data);
export const apiFetchProjectById = (id) => apiGet(`/projects/${id}`);
export const apiUpdateProject = (id, data) => apiPut(`/projects/${id}`, data);
export const apiDeleteProject = (id) => apiDel(`/projects/${id}`);
export const apiCloseProject = (id) => apiPatch(`/projects/${id}/close`);
export const apiFetchProjectProposals = (id) => apiGet(`/projects/${id}/proposals`).catch(() => []);
export const apiGenerateProjectDescription = (params) =>
  apiPost('/ai/generate-description', typeof params === 'string' ? { prompt: params } : params).catch(() => ({ description: '' }));
export const apiGenerateJobDescription = apiGenerateProjectDescription;

// ==========================================
// PROPOSALS
// ==========================================

export const apiFetchProposals = (params) => apiGet('/proposals', params);
export const apiSubmitProposal = (data) => apiPost('/proposals', data);
export const apiAcceptProposal = (id) => apiPatch(`/proposals/${id}/accept`);
export const apiRejectProposal = (id) => apiPatch(`/proposals/${id}/reject`);
export const apiWithdrawProposal = (id) => apiDel(`/proposals/${id}`);
export const apiUpdateProposal = (id, data) => apiPut(`/proposals/${id}`, data);

// ==========================================
// CONTRACTS & MILESTONES
// ==========================================

export const apiFetchContracts = (params) => apiGet('/contracts', params);
export const apiFetchContractById = (id) => apiGet(`/contracts/${id}`);
export const apiUpdateContract = (id, data) => apiPut(`/contracts/${id}`, data);
export const apiCompleteContract = (id) => apiPatch(`/contracts/${id}/complete`);
export const apiCancelContract = (id) => apiPatch(`/contracts/${id}/cancel`);
export const apiSubmitMilestone = (id, idx) => apiPost(`/contracts/${id}/milestone/${idx}/submit`);
export const apiApproveMilestone = (id, idx) => apiPost(`/contracts/${id}/milestone/${idx}/approve`);
export const apiReleaseMilestone = (id, idx) => apiPost(`/contracts/${id}/milestones/${idx}/release`);
export const apiFundMilestone = (id, idx) => apiPost(`/contracts/${id}/milestones/${idx}/fund`, { contractId: id, milestoneIndex: idx });
export const apiCancelMilestoneCheckout = (id, idx) => apiPost(`/contracts/${id}/milestones/${idx}/cancel-checkout`, { contractId: id, milestoneIndex: idx }).catch(() => ({}));

// ==========================================
// PAYMENTS & PAYOUTS
// ==========================================

export const apiVerifyPayment = (params) => apiPost('/payments/verify', typeof params === 'string' ? { sessionId: params } : params);
export const apiGetPayoutStatus = () => apiGet('/payments/payout-status').catch(() => ({ status: 'unconfigured' }));
export const apiStartPayoutOnboarding = () => apiPost('/payments/onboard-payout').catch(() => ({ url: '#' }));
export const apiDepositEscrow = (contractId, amount) => apiPost('/escrow/deposit', { contractId, amount });
export const apiReleaseEscrow = (contractId) => apiPost('/escrow/release', { contractId });
export const apiReleasePayment = apiReleaseEscrow;
export const apiFetchTransactions = () => apiGet('/payments/transactions').catch(() => []);
export const apiFetchInvoices = () => apiGet('/payments/invoices').catch(() => []);

// ==========================================
// FREELANCERS & HIRING
// ==========================================

export const apiFetchFreelancers = (params) => apiGet('/freelancers', params);
export const apiFetchFreelancerById = (id) => apiGet(`/freelancers/${id}`);
export const apiFetchFreelancerProfile = apiFetchFreelancerById;
export const apiUpdateFreelancerProfile = (data) => apiPut('/freelancers/profile', data);
export const apiDirectHire = (data) => apiPost('/contracts/direct-hire', data);

// ==========================================
// REVIEWS & CHAT
// ==========================================

export const apiCreateReview = (data) => apiPost('/reviews', data);
export const apiFetchReviews = (params) => apiGet('/reviews', params);
export const apiFetchMessages = (convId) => apiGet(`/messages/${convId}`).catch(() => []);
export const apiSendMessage = (data) => apiPost('/messages', data);
export const apiFetchConversations = () => apiGet('/messages/conversations').catch(() => []);
export const apiMarkMessagesRead = (convId) => apiPatch(`/messages/${convId}/read`).catch(() => ({}));

// ==========================================
// DASHBOARD & STATS
// ==========================================

export const apiFetchStats = () => apiGet('/dashboard/stats').catch(() => ({}));
export const apiFetchDashboard = () => apiGet('/dashboard').catch(() => ({}));
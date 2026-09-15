const getApiBase = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return url.replace(/\/+$/, '');
};

// ==========================================
// SIGNUP / REGISTRATION API
// ==========================================
export const apiSignup = async (userData) => {
  const base = getApiBase();
  const professionTitle = (
    userData.profession ||
    userData.title ||
    (userData.role === 'client' ? 'Hiring Client' : 'Full-Stack Developer')
  ).trim();

  const payload = {
    ...userData,
    profession: professionTitle,
    title: professionTitle
  };

  const response = await fetch(`${base}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMessage = data.message || data.error || 'Registration failed. Check your details.';
    throw new Error(errorMessage);
  }
  return data;
};

// ==========================================
// LOGIN API
// ==========================================
export const apiLogin = async (credentials) => {
  const base = getApiBase();
  const response = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMessage = data.message || data.error || 'Login failed. Invalid credentials.';
    throw new Error(errorMessage);
  }
  return data;
};

// ==========================================
// GOOGLE AUTH API
// ==========================================
export const apiGoogleAuth = async (googlePayload) => {
  const base = getApiBase();
  const response = await fetch(`${base}/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(googlePayload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMessage = data.message || data.error || 'Google authentication failed.';
    throw new Error(errorMessage);
  }
  return data;
};

// ==========================================
// PROFILE UPDATE API (Step 2 Persistence)
// ==========================================
export const apiUpdateProfile = async (profileData) => {
  const base = getApiBase();
  const token = localStorage.getItem('workpulse_token');
  const professionTitle = (profileData.profession || profileData.title || '').trim();

  const payload = {
    ...profileData,
    profession: professionTitle,
    title: professionTitle
  };

  const response = await fetch(`${base}/auth/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMessage = data.message || data.error || 'Failed to update profile.';
    throw new Error(errorMessage);
  }
  return data;
};

// ==========================================
// GET PROFILE API
// ==========================================
export const apiGetMe = async () => {
  const base = getApiBase();
  const token = localStorage.getItem('workpulse_token');
  const response = await fetch(`${base}/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch user profile');
  }
  return data;
};

// ==========================================
// DELETE ACCOUNT API
// ==========================================
export const apiDeleteAccount = async () => {
  const base = getApiBase();
  const token = localStorage.getItem('workpulse_token');
  const response = await fetch(`${base}/auth/me`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete account');
  }
  return data;
};
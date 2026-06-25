export const BASE_URL = 'http://127.0.0.1:3001';

/**
 * Standard fetch wrapper helper that manages baseline headers,
 * JSON serialization, base URL prepending, and client-side JWT injection.
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Retrieve token from localStorage if running client-side
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(url, config);

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Something went wrong');
  }

  return data;
}

/**
 * Log in a physiotherapist and store their JWT in localStorage.
 * @param {string} email
 * @param {string} password
 */
export async function login(email, password) {
  const data = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  if (data?.token && typeof window !== 'undefined') {
    localStorage.setItem('token', data.token);
    if (data.user) {
      // Attach the role to the user object before caching it
      data.user.role = data.role;
      localStorage.setItem('user', JSON.stringify(data.user));
    }
  }
  
  return data;
}

/**
 * Register a new physiotherapist.
 * @param {object} data - { firstName, lastName, email, password, licenseNumber }
 */
export async function register(data) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Create a new patient referral and clinical record.
 * @param {object} data - { patientName, patientContact, receivingPhysioId, diagnosis, treatmentPlan }
 */
export async function createReferral(data) {
  const formData = new FormData();
  
  // Append all non-document fields
  Object.keys(data).forEach(key => {
    if (key !== 'documents' && data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key]);
    }
  });

  // Append actual File objects if present
  if (data.documents && Array.isArray(data.documents)) {
    data.documents.forEach((file) => {
      formData.append('documents', file);
    });
  }

  // Ensure token is passed
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // For FormData, do not set Content-Type header manually
  const res = await fetch(`${BASE_URL}/api/referrals`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const resData = await res.json();
  if (!res.ok) throw new Error(resData.error || resData.message || 'API request failed');
  return resData;
}

/**
 * Fetch all referrals involving the logged-in physiotherapist.
 */
export async function getReferrals() {
  return apiRequest('/api/referrals', {
    method: 'GET',
  });
}

export async function forgotPassword(email) {
  return apiRequest('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/**
 * Reset a user's password.
 * @param {string} email - Currently unused by backend, but included for completeness or future use.
 * @param {string} token 
 * @param {string} newPassword 
 */
export async function resetPassword(token, newPassword) {
  return apiRequest('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
}

/**
 * Get the currently logged-in user from localStorage or by decoding the JWT.
 */
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user');
    if (raw) return JSON.parse(raw);
    
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Fetch a list of verified physiotherapists, optionally filtered by search query, location, and specialty.
 */
export async function getProviders(filters = {}) {
  const params = new URLSearchParams();
  if (filters.q) params.append('q', filters.q);
  if (filters.location) params.append('location', filters.location);
  if (filters.specialty) params.append('specialty', filters.specialty);
  
  const queryString = params.toString();
  const endpoint = queryString ? `/api/physiotherapists?${queryString}` : '/api/physiotherapists';
  
  return apiRequest(endpoint, {
    method: 'GET',
  });
}

/**
 * Fetch a specific referral by ID.
 */
export async function getReferralById(id) {
  return apiRequest(`/api/referrals/${id}`, {
    method: 'GET',
  });
}

/**
 * Update the status of a referral.
 */
export async function updateReferralStatus(id, status) {
  return apiRequest(`/api/referrals/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

/**
 * Patient creates a transfer request.
 */
export async function createTransferRequest(data) {
  return apiRequest('/api/referrals/transfer', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update patient profile settings.
 */
export async function updatePatientProfile(data) {
  return apiRequest('/api/patients/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Update physiotherapist profile settings.
 */
export async function updatePhysioProfile(data) {
  return apiRequest('/api/physiotherapists/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Fetch a list of all patients (physiotherapists only).
 */
export async function getPatients() {
  return apiRequest('/api/patients', {
    method: 'GET',
  });
}

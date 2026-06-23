const BASE_URL = 'http://127.0.0.1:3001';

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
  return apiRequest('/api/referrals', {
    method: 'POST',
    body: JSON.stringify(data),
  });
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

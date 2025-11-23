// Helper utility for authentication
import { API_URL } from './config.js';

export const getAuthToken = () => {
  // Try both 'token' and 'userToken' for backward compatibility
  return localStorage.getItem('token') || localStorage.getItem('userToken');
};

export const isAdmin = () => {
  return localStorage.getItem('isAdmin') === 'true';
};

export const verifyAdminToken = async () => {
  const token = getAuthToken();
  if (!token) {
    return { isAdmin: false, error: 'No token found' };
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/verify-admin`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return { isAdmin: data.isAdmin || false, user: data.user };
    } else {
      const errorData = await response.json().catch(() => ({}));
      return { isAdmin: false, error: errorData.message || 'Verification failed' };
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return { isAdmin: false, error: error.message };
  }
};

export const refreshToken = async () => {
  // If token exists, verify it and update admin status
  const verification = await verifyAdminToken();
  if (verification.isAdmin) {
    localStorage.setItem('isAdmin', 'true');
    if (verification.user) {
      localStorage.setItem('userName', verification.user.name || '');
      localStorage.setItem('userEmail', verification.user.email || '');
    }
  } else {
    localStorage.setItem('isAdmin', 'false');
  }
  return verification;
};


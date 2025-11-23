// Centralized API utility
// Use this for all API calls instead of hardcoded URLs

import { API_URL } from './config.js';

/**
 * Make an API request with authentication
 * @param {string} endpoint - API endpoint (e.g., '/api/auth/login')
 * @param {object} options - Fetch options
 * @returns {Promise<Response>}
 */
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token') || localStorage.getItem('userToken');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  
  return fetch(url, config);
};

/**
 * Get request
 */
export const apiGet = async (endpoint, options = {}) => {
  return apiRequest(endpoint, { ...options, method: 'GET' });
};

/**
 * Post request
 */
export const apiPost = async (endpoint, data, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Put request
 */
export const apiPut = async (endpoint, data, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * Delete request
 */
export const apiDelete = async (endpoint, options = {}) => {
  return apiRequest(endpoint, { ...options, method: 'DELETE' });
};

export default {
  request: apiRequest,
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
};


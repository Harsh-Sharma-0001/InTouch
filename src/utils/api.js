// Centralized API utility
// Use this for all API calls instead of hardcoded URLs

import { API_URL } from './config.js';

/**
 * Safely parse JSON response, handling HTML error pages
 * @param {Response} response - Fetch response object
 * @returns {Promise<any>}
 */
const safeJsonParse = async (response) => {
  const contentType = response.headers.get('content-type');
  
  // Check if response is actually JSON
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    // If we got HTML (error page), throw a meaningful error
    if (text.trim().startsWith('<!')) {
      throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}. This usually means the API endpoint doesn't exist or the backend is not running.`);
    }
    // Try to parse as JSON anyway
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error(`Failed to parse response as JSON. Status: ${response.status}. Response: ${text.substring(0, 100)}`);
    }
  }
  
  return response.json();
};

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
  
    try {
    const response = await fetch(url, config);
    return response;
  } catch (error) {
    console.error(`API Request failed to ${url}:`, error);
    throw error;
  }
};

/**
 * Make an API request and safely parse JSON response
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<any>} - Parsed JSON data
 */
export const apiRequestJson = async (endpoint, options = {}) => {
  const response = await apiRequest(endpoint, options);
  return safeJsonParse(response);
};

/**
  * Get request (returns Response)
 */
export const apiGet = async (endpoint, options = {}) => {
  return apiRequest(endpoint, { ...options, method: 'GET' });
};

/**
  * Get request (returns parsed JSON)
 */
export const apiGetJson = async (endpoint, options = {}) => {
  return apiRequestJson(endpoint, { ...options, method: 'GET' });
};

/**
 * Post request (returns Response)
 */
export const apiPost = async (endpoint, data, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Post request (returns parsed JSON)
 */
export const apiPostJson = async (endpoint, data, options = {}) => {
  const response = await apiPost(endpoint, data, options);
  return safeJsonParse(response);
};

/**
 * Put request (returns Response)
 */
export const apiPut = async (endpoint, data, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * Put request (returns parsed JSON)
 */
export const apiPutJson = async (endpoint, data, options = {}) => {
  const response = await apiPut(endpoint, data, options);
  return safeJsonParse(response);
};

/**
 * Delete request (returns Response)
 */
export const apiDelete = async (endpoint, options = {}) => {
  return apiRequest(endpoint, { ...options, method: 'DELETE' });
};

/**
 * Delete request (returns parsed JSON)
 */
export const apiDeleteJson = async (endpoint, options = {}) => {
  const response = await apiDelete(endpoint, options);
  return safeJsonParse(response);
};

export default {
  request: apiRequest,
  requestJson: apiRequestJson,
  get: apiGet,
  getJson: apiGetJson,
  post: apiPost,
  postJson: apiPostJson,
  put: apiPut,
  putJson: apiPutJson,
  delete: apiDelete,
  deleteJson: apiDeleteJson,
};

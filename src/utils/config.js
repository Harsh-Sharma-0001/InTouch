// Environment configuration
// This file handles API URLs based on environment

const getApiUrl = () => {
  // In production, use environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In development, use localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:5000';
  }
  
  // Fallback for production if VITE_API_URL is not set
  // Replace with your actual backend URL after deployment
  return 'https://your-backend-url.onrender.com';
};

const getSocketUrl = () => {
  // In production, use environment variable
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  
  // In development, use localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:5000';
  }
  
  // Fallback for production if VITE_API_URL is not set
  // Replace with your actual backend URL after deployment
  return 'https://your-backend-url.onrender.com';
};

export const API_URL = getApiUrl();
export const SOCKET_URL = getSocketUrl();

// Export for use in components
export default {
  API_URL,
  SOCKET_URL,
};


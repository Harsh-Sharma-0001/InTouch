// Environment configuration
// This file handles API URLs based on environment

const getApiUrl = () => {
  // In production, use environment variable (highest priority)
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL.trim();
    // Remove trailing slash if present
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }

  // Check if we're in production build (not dev mode)
  // In production build, import.meta.env.DEV is false
  const isProduction = import.meta.env.PROD || (!import.meta.env.DEV && window.location.hostname !== 'localhost');
  
  if (isProduction) {
    // In production but no env var set - this is an error
    console.error('⚠️ VITE_API_URL is not set! API calls will fail. Please set VITE_API_URL in your environment variables.');
    // Try to infer from current hostname (for Render deployments)
    const hostname = window.location.hostname;
    if (hostname.includes('onrender.com')) {
      // If frontend is on Render, backend is likely on same domain
      const backendName = hostname.replace('frontend', 'backend').replace('intouch-frontend', 'intouch-backend');
      return `https://${backendName}`;
    }
    return 'https://intouch-backend.onrender.com'; // Default fallback
  }

  // In development, use localhost
  return 'http://localhost:5000';
};

const getSocketUrl = () => {
  // In production, use environment variable (highest priority)
  if (import.meta.env.VITE_SOCKET_URL) {
      const url = import.meta.env.VITE_SOCKET_URL.trim();
    // Remove trailing slash if present
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }
  
  // Use same logic as API_URL
  const isProduction = import.meta.env.PROD || (!import.meta.env.DEV && window.location.hostname !== 'localhost');
  
  if (isProduction) {
    console.error('⚠️ VITE_SOCKET_URL is not set! Socket connections will fail. Please set VITE_SOCKET_URL in your environment variables.');
    const hostname = window.location.hostname;
    if (hostname.includes('onrender.com')) {
      const backendName = hostname.replace('frontend', 'backend').replace('intouch-frontend', 'intouch-backend');
      return `https://${backendName}`;
    }
    return 'https://intouch-backend.onrender.com';
  }

  // In development, use localhost
    return 'http://localhost:5000';
};

export const API_URL = getApiUrl();
export const SOCKET_URL = getSocketUrl();

// Export for use in components
export default {
  API_URL,
  SOCKET_URL,
};

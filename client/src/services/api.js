import axios from 'axios';

// Get base URL from environment variable or fallback to /api for Vite proxy
let rawBaseURL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.trim() : '/api';

// If an external URL is provided (e.g. from Render: https://xxx.onrender.com),
// ensure it always ends with /api even if the user omitted /api in Vercel
if (rawBaseURL.startsWith('http://') || rawBaseURL.startsWith('https://')) {
  // Strip trailing slashes
  rawBaseURL = rawBaseURL.replace(/\/+$/, '');
  if (!rawBaseURL.endsWith('/api')) {
    rawBaseURL = `${rawBaseURL}/api`;
  }
}

const api = axios.create({
  baseURL: rawBaseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Interceptor to handle unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid or expired
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;


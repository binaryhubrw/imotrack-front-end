import axios from 'axios';

// Make sure this matches your backend URL exactly
const baseURL = process.env.NEXT_API_URL || 'https://imotrak-xj6e.onrender.com';

// Debug: Log the base URL being used
console.log('API Base URL:', baseURL);

export const api = axios.create({
  baseURL,
  headers: {
    'Accept': 'application/json',
  },
  // Ensure we're getting JSON responses
  responseType: 'json',
});

// Request interceptor for adding auth token and logging requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error Response:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
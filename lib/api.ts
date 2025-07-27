import axios from 'axios';

// Make sure this matches your backend URL exactly
 const baseURL = process.env.NEXTAPI_URL || 'https://imoteak.onrender.com';

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
    const status = error.response?.status;
    const data = error.response?.data;
    // Suppress logging for 403 and 404 errors (expected for restricted APIs)
    // Also suppress logging if data is undefined or an empty object
    const isEmptyData =
      data === undefined ||
      (typeof data === 'object' && data !== null && Object.keys(data).length === 0);
    if (status !== 403 && status !== 404 && !isEmptyData) {
      console.error('API Error Response:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
      });
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

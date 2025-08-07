import axios from 'axios';

// Make sure this matches your backend URL exactly
const baseURL = process.env.NEXT_API_URL || 'https://imoteack.onrender.com';  

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
  // Don't add auth token for verification calls
  const isVerificationCall = config.url?.includes('/v2/auth/verify') || 
                            config.url?.includes('/v2/auth/set-password-and-verify') ||
                            config.url?.includes('/v2/auth/resend-invitation');
  
  console.log('API Request:', config.url, 'isVerificationCall:', isVerificationCall);
  
  if (!isVerificationCall) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return config;
});

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;
    const url = error.config?.url;
    
    // Don't clear localStorage or redirect for verification-related API calls
    const isVerificationCall = url?.includes('/v2/auth/verify') || 
                              url?.includes('/v2/auth/set-password-and-verify') ||
                              url?.includes('/v2/auth/resend-invitation');
    
    // Suppress logging for 401 errors on verification calls (they might be expected)
    // Also suppress logging if data is undefined or an empty object
    const isEmptyData =
      data === undefined ||
      (typeof data === 'object' && data !== null && Object.keys(data).length === 0);
    
    const shouldSuppressLogging = 
      (status === 401 && isVerificationCall) ||
      (status === 403 && status !== 404) ||
      isEmptyData;
    
    if (!shouldSuppressLogging) {
      console.error('API Error Response:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: url,
      });
    }
    
    console.log('API Error Response:', {
      url,
      status: error.response?.status,
      isVerificationCall,
      message: error.response?.data?.message
    });
    
    if (error.response?.status === 401 && !isVerificationCall) {
      console.log('401 error on non-verification call, clearing auth data and redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('position');
      localStorage.removeItem('organization');
      localStorage.removeItem('unit');
      window.location.href = '/login';
    } else if (error.response?.status === 401 && isVerificationCall) {
      console.log('401 error on verification call, not clearing auth data');
    }
    
    return Promise.reject(error);
  }
);

export default api;


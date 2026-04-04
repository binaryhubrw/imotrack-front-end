import axios from 'axios';
import { API_BASE_URL } from './api-base-url';

// Make sure this matches your backend URL exactly
// const baseURL = process.env.NEXT_API_URL || 'https://imotrak-api.urbinaryhub.rw';  
const baseURL = API_BASE_URL;
// const baseURL = process.env.NEXT_API_URL || 'http://localhost:4000'

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
    
    // Don't clear localStorage for logout calls
    const isLogoutCall = url?.includes('/v2/auth/logout');
    
    const isEmptyData =
      data === undefined ||
      (typeof data === 'object' && data !== null && Object.keys(data).length === 0);

    const payload = isEmptyData ? '(no body)' : data;
    const statusText = error.response?.statusText ?? '';
    const summary = `API Error: ${status ?? 'network'} ${statusText} ${url ?? ''}`.trim();

    const shouldSuppressFullLog =
      (status === 401 && (isVerificationCall || isLogoutCall));

    if (!shouldSuppressFullLog) {
      console.error(summary, payload);
    }
    
    if (error.response?.status === 401 && !isVerificationCall && !isLogoutCall) {
      console.log('401 error on non-verification/non-logout call, clearing auth data and redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('position');
      localStorage.removeItem('organization');
      localStorage.removeItem('unit');
      window.location.href = '/login';
    } else if (error.response?.status === 401 && isVerificationCall) {
      console.log('401 error on verification call, not clearing auth data');
    } else if (error.response?.status === 401 && isLogoutCall) {
      console.log('401 error on logout call, not clearing auth data (logout will handle it)');
    }
    
    return Promise.reject(error);
  }
);

export default api;


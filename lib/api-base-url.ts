const DEFAULT_API_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:4000'
    : 'https://imotrak.ur.ac.rw/api';

const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_API_URL || DEFAULT_API_BASE_URL;

export const API_BASE_URL = rawApiBaseUrl.trim().replace(/\/+$/, '').replace(/^(?!https?:\/\/)/, 'https://');

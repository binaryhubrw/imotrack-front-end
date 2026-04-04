const DEFAULT_API_BASE_URL = 'https://imotrak.ur.ac.rw';

const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_API_URL || DEFAULT_API_BASE_URL;

export const API_BASE_URL = rawApiBaseUrl.trim().replace(/\/+$/, '').replace(/^(?!https?:\/\/)/, 'https://');

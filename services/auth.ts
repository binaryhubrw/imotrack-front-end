import api from '@/lib/api';
import { 
  LoginCredentials, 
  AuthResponse, 
  VerifyEmailRequest, 
  VerifyEmailResponse,
  SetPasswordAndVerifyRequest,
  SetPasswordAndVerifyResponse 
} from '@/types/next-auth';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  async verifyEmail(request: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    const { data } = await api.get<{ data: VerifyEmailResponse }>(`/v2/auth/verify?token=${request.token}`);
    if (data.data?.token) {
      localStorage.setItem('token', data.data.token);
    }
    return data.data;
  },

  async setPasswordAndVerify(request: SetPasswordAndVerifyRequest): Promise<SetPasswordAndVerifyResponse> {
    const verificationToken = localStorage.getItem('verification_token');
    if (!verificationToken) {
      throw new Error('No verification token found. Please verify your email first.');
    }

    const { data } = await api.post<{ data: SetPasswordAndVerifyResponse }>(
      '/v2/auth/set-password-and-verify',
      request,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${verificationToken}`,
        },
      }
    );
    return data.data;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },
}; 
import { useMutation } from '@tanstack/react-query';
import api from './api';
import { LoginCredentials, AuthResponse } from '@/types/next-auth';

// Login mutation
export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data } = await api.post<AuthResponse>('/auth/login', credentials);
      return data;
    },
  });
};



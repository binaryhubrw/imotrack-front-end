import { useRouter } from 'next/navigation';
import { useLogin, useLogout, useCurrentUser } from '@/lib/queries';
import { LoginCredentials } from '@/types/next-auth';

export function useAuth() {
  const router = useRouter();
  const login = useLogin();
  const logout = useLogout();
  const { data: user, isLoading } = useCurrentUser();

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      const response = await login.mutateAsync(credentials);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return {
    user,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
    isAuthenticated: !!localStorage.getItem('token'),
  };
}
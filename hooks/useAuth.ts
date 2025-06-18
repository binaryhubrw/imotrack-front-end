import { useRouter } from 'next/navigation';
import { useLogin } from '@/lib/queries';
import { LoginCredentials, UserRole } from '@/types/next-auth';
import { useEffect, useState } from 'react';

export function useAuth() {
  const router = useRouter();
  const login = useLogin();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{
    id: string;
    email: string;
    role: UserRole;
    organization_id: string;
  } | null>(null);

  useEffect(() => {
    // Check authentication status on mount
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      const response = await login.mutateAsync(credentials);
      
      // Store token in localStorage
      localStorage.setItem('token', response.token);
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Set token in cookie for middleware
      document.cookie = `token=${response.token}; path=/; max-age=86400`;
      
      // Update state
      setIsAuthenticated(true);
      setUser(response.user);
      
      // Redirect based on role
      switch (response.user.role) {
        case 'admin':
          router.push('/dashboard');
          break;
        case 'fleetmanager':
          router.push('/dashboard');
          break;
        case 'hr':
          router.push('/dashboard');
          break;
        case 'staff':
          router.push('/dashboard');
          break;
        default:
          router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    setIsAuthenticated(false);
    setUser(null);
    router.push('/login');
  };

  return {
    login: handleLogin,
    logout: handleLogout,
    isAuthenticated,
    user,
  };
}
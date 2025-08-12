"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLogin, useAuthLogout } from '@/lib/queries';
import { 
  LoginCredentials, 
  AuthenticatedUserWithPosition
} from '@/types/next-auth';
import { toast } from 'sonner';
import api from '@/lib/api';

interface AuthState {
  user: AuthenticatedUserWithPosition | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  positions: Array<{
    position_id: string;
    position_name: string;
    unit_id: string;
    unit_name: string;
    organisation_id: string;
    organization_name: string;
  }>;
  showPositionSelector: boolean;
}

export const useAuth = () => {
  const router = useRouter();
  const loginMutation = useLogin();
  const logoutMutation = useAuthLogout();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true, // Start with loading true
    positions: [],
    showPositionSelector: false,
  });
  
  // Use ref to access current state in callbacks
  const authStateRef = useRef(authState);
  authStateRef.current = authState;

  // Track if we've completed the initial auth check
  const [hasInitialized, setHasInitialized] = useState(false);

  // Check for existing authentication on mount
  useEffect(() => {
    // Prevent multiple initialization attempts
    if (hasInitialized) {
      return;
    }

    const initializeAuth = () => {
      // Don't restore authentication on verification pages
      if (typeof window !== 'undefined') {
        const pathname = window.location.pathname;
        if (pathname === '/verify' || pathname === '/set-password') {
          console.log('On verification page, skipping auth restoration');
          setAuthState(prev => ({ ...prev, isLoading: false }));
          setHasInitialized(true);
          return;
        }
      }

      console.log('Checking for existing authentication...');
      const storedUser = localStorage.getItem('user');
      const storedPosition = localStorage.getItem('position');
      const storedOrganization = localStorage.getItem('organization');
      const storedUnit = localStorage.getItem('unit');
      const storedToken = localStorage.getItem('token');

      console.log('Stored auth data:', {
        user: storedUser ? 'exists' : 'missing',
        position: storedPosition ? 'exists' : 'missing',
        organization: storedOrganization ? 'exists' : 'missing',
        unit: storedUnit ? 'exists' : 'missing',
        token: storedToken ? 'exists' : 'missing',
      });

      if (storedUser && storedPosition && storedOrganization && storedUnit && storedToken) {
        try {
          const user = JSON.parse(storedUser);
          const position = JSON.parse(storedPosition);
          const organization = JSON.parse(storedOrganization);
          const unit = JSON.parse(storedUnit);

          console.log('Restoring authentication state...');
          setAuthState(prev => ({
            ...prev,
            user: {
              user,
              position,
              organization,
              unit,
            },
            isAuthenticated: true,
            isLoading: false,
          }));
        } catch (error) {
          console.error('Error parsing stored auth data:', error);
          // Clear corrupted data
          localStorage.removeItem('user');
          localStorage.removeItem('position');
          localStorage.removeItem('organization');
          localStorage.removeItem('unit');
          localStorage.removeItem('token');
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        console.log('No complete authentication found, setting loading to false');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }

      setHasInitialized(true);
    };

    initializeAuth();
  }, [hasInitialized]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Store credentials temporarily for position authentication
      localStorage.setItem('loginCredentials', JSON.stringify(credentials));
      
      // Step 1: Login to get positions
      const positions = await loginMutation.mutateAsync(credentials);
      console.log('Login successful, received positions:', positions);
      
      // Store positions in localStorage for position selection
      localStorage.setItem('availablePositions', JSON.stringify(positions));
      
      setAuthState(prev => {
        console.log('Updating auth state with positions:', positions);
        console.log('Setting showPositionSelector to true');
        return {
          ...prev,
          positions,
          showPositionSelector: true,
          isLoading: false,
        };
      });

      return positions;
    } catch (error) {
      console.error('Login failed in useAuth:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      // Clear stored credentials on error
      localStorage.removeItem('loginCredentials');
      localStorage.removeItem('availablePositions');
      throw error;
    }
  }, [loginMutation]);

  const selectPosition = useCallback(async (positionId: string, positions?: Array<{
    position_id: string;
    position_name: string;
    unit_id: string;
    unit_name: string;
    organisation_id: string;
    organization_name: string;
  }>) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Get positions from localStorage or provided parameter
      let currentPositions = positions;
      if (!currentPositions || currentPositions.length === 0) {
        const storedPositions = localStorage.getItem('availablePositions');
        if (storedPositions) {
          currentPositions = JSON.parse(storedPositions);
        }
      }
      
      // Ensure we have positions
      if (!currentPositions || currentPositions.length === 0) {
        throw new Error('No positions available for selection');
      }
      
      console.log('Current positions in selectPosition:', currentPositions);
      console.log('Looking for position ID:', positionId);
      
      // Find the selected position from the positions array
      const selectedPosition = currentPositions.find(p => p.position_id === positionId);
      
      if (!selectedPosition) {
        console.error('Available positions:', currentPositions);
        console.error('Looking for position ID:', positionId);
        throw new Error('Selected position not found');
      }

      // Get the stored credentials from localStorage
      const storedCredentials = localStorage.getItem('loginCredentials');
      if (!storedCredentials) {
        throw new Error('Login credentials not found');
      }

      const credentials = JSON.parse(storedCredentials);

      // Make API call to authenticate with the selected position using the api instance
      const response = await api.post(`/v2/auth/${positionId}`, {
        email: credentials.email,
        password: credentials.password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = response.data;

      if (data.message === 'Sign in successful' && data.data) {
        const authData = data.data;

        // Create the authenticated user object with real data from API
        const authenticatedUser: AuthenticatedUserWithPosition = {
          user: {
            first_name: authData.user.first_name,
            last_name: authData.user.last_name,
            email: credentials.email, // Use the email from credentials
            phone: authData.user.user_phone,
            avatar: authData.user.user_photo,
            nid: authData.user.user_nid,
            gender: authData.user.user_gender,
            dob: authData.user.user_dob,
          },
          position: {
            position_id: authData.position.position_id,
            position_name: authData.position.position_name,
            position_access: authData.position.position_access,
          },
          organization: {
            organization_id: authData.organization.organization_id,
            organization_name: authData.organization.organization_name,
            organization_email: authData.organization.organization_email,
            organization_logo: authData.organization.organization_logo,
            organization_address: authData.organization.street_address,
            organization_created_at: authData.organization.created_at,
          },
          unit: {
            unit_id: authData.unit.unit_id,
            unit_name: authData.unit.unit_name,
          },
        };

        // Store token and data in localStorage
        if (authData.token) {
          localStorage.setItem('token', authData.token);
        }
        localStorage.setItem('user', JSON.stringify(authenticatedUser.user));
        localStorage.setItem('position', JSON.stringify(authenticatedUser.position));
        localStorage.setItem('organization', JSON.stringify(authenticatedUser.organization));
        localStorage.setItem('unit', JSON.stringify(authenticatedUser.unit));

        // Clear stored credentials and positions for security
        localStorage.removeItem('loginCredentials');
        localStorage.removeItem('availablePositions');

        // Update state
        setAuthState(prev => ({
          ...prev,
          user: authenticatedUser,
          isAuthenticated: true,
          showPositionSelector: false,
          isLoading: false,
        }));

        // Redirect to dashboard
        router.push('/dashboard');
        
        toast.success('Position selected successfully!');
      } else {
        throw new Error(data.message || 'Position authentication failed');
      }
    } catch (error) {
      console.error('Position selection failed:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      toast.error(error instanceof Error ? error.message : 'Position selection failed');
      throw error;
    }
  }, [router]);

  const cancelPositionSelection = useCallback(() => {
    // Clear stored data when canceling
    localStorage.removeItem('loginCredentials');
    localStorage.removeItem('availablePositions');
    
    setAuthState(prev => ({
      ...prev,
      showPositionSelector: false,
      positions: [],
      isLoading: false,
    }));
  }, []);

  const logout = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Try to call logout API, but don't fail if it doesn't work
      try {
        await logoutMutation.mutateAsync();
      } catch (apiError) {
        console.warn('Logout API call failed, but proceeding with local logout:', apiError);
      }
      
      // Clear all auth-related localStorage items
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('position');
      localStorage.removeItem('organization');
      localStorage.removeItem('unit');
      localStorage.removeItem('loginCredentials');
      localStorage.removeItem('availablePositions');
      localStorage.removeItem('verification_token');
      localStorage.removeItem('verification_email');
      
      // Reset state
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        positions: [],
        showPositionSelector: false,
      });
      
      // Redirect to login
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      
      // Even if there's an error, clear localStorage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('position');
      localStorage.removeItem('organization');
      localStorage.removeItem('unit');
      localStorage.removeItem('loginCredentials');
      localStorage.removeItem('availablePositions');
      localStorage.removeItem('verification_token');
      localStorage.removeItem('verification_email');
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        positions: [],
        showPositionSelector: false,
      });
      
      router.push('/login');
    }
  }, [logoutMutation, router]);

  return {
    ...authState,
    login,
    selectPosition,
    cancelPositionSelection,
    logout,
  };
};
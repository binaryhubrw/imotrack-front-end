import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from './api';
import {
  LoginCredentials,
  LoginResponse,
  PositionAuthRequest,
  PositionAuthResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  UpdatePasswordRequest,
  UpdatePasswordResponse,
  ResetPasswordRequest,
  VerifyEmailRequest,
  VerifyEmailResponse,
  SetPasswordAndVerifyRequest,
  SetPasswordAndVerifyResponse,
  ApiResponse,
  Organization,
  PaginatedOrganizations,
  Pagination,
  Unit,
  CreateUnitDto,
  Position,
  UserWithPositions,
  UpdateUserDto,
  CreateUserDto,
  VehicleModel,
  CreateVehicleModelDto,
  Vehicle,
  Reservation,
  CreateReservationDto,
  UpdateReservationStatusDto,
  VehicleIssue,
  CreateVehicleIssueDto,
  Notification,
  AuditLog,
  position_accesses,
  VehicleOperationResponse,
  RemoveVehicleFromReservationDto,
  VehicleOperationApiResponse,
  AddVehicleToReservationDto,
} from '@/types/next-auth';
import { toast } from 'sonner';
import { TransmissionMode } from '@/types/enums';

// 1. AUTH
export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      try {
        // Send JSON data instead of FormData
        const jsonData = {
          email: credentials.email,
          password: credentials.password,
        };
        console.log('Making login request to /v2/auth/login...');
        const response = await api.post<ApiResponse<LoginResponse>>('/v2/auth/login', jsonData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        // Check if we have a response and data
        if (!response.data) {
          throw new Error('No response received from server');
        }

        // Check if the response indicates success
        if (response.data.message === 'Login successful' && response.data.data) {
          // Show success toast
          toast.success(response.data.message);
          
          // The API returns positions array directly in data field
          // Return the positions array from the response
          const positions = response.data.data || [];
          console.log('Extracted positions:', positions);
          return positions;
        }

        // If we reach here, it's a real error
        const errorMessage = response.data.message || 'Login failed';
        toast.error(errorMessage);
        throw new Error(errorMessage);
      } catch (error: unknown) {
        
        if (typeof error === 'object' && error !== null && 'response' in error && typeof error.response === 'object' && error.response !== null) {
          const axiosError = error as { response?: { data?: { message?: string; data?: LoginResponse }; status?: number } };
          
          // Check if this is actually a successful response with 400 status
          if (axiosError.response?.data?.message === 'Login successful' && axiosError.response?.data?.data) {
            console.log('Detected successful login with 400 status, treating as success');
            toast.success(axiosError.response.data.message);
            return axiosError.response.data.data || [];
          }
          
          const errorMessage = axiosError.response?.data?.message || 'Login failed';
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
        toast.error('Login failed');
        throw error;
      }
    },
  });
};

// Position-based authentication (not used in current flow)
export const usePositionAuth = (position_id: string) => {
  return useMutation({
    mutationFn: async (positionAuthData: PositionAuthRequest) => {
      try {
        // Send JSON data instead of FormData
        const jsonData = {
          email: positionAuthData.email,
          password: positionAuthData.password,
        };

        const response = await api.post<ApiResponse<PositionAuthResponse>>(`/v2/auth/${position_id}`, jsonData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        // Debug the response
        console.log('Position auth response:', response);

        if (!response.data) {
          throw new Error('No response received from server');
        }

        // Show success toast
        if (response.data.message) {
          toast.success(response.data.message);
        }

        // Store the token and user data from position authentication
        if (response.data.data?.token) {
          localStorage.setItem('token', response.data.data.token);
        }

        // Store user data
        if (response.data.data?.user) {
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }

        // Store position data
        if (response.data.data?.position) {
          localStorage.setItem('position', JSON.stringify(response.data.data.position));
        }

        // Store organization data
        if (response.data.data?.organization) {
          localStorage.setItem('organization', JSON.stringify(response.data.data.organization));
        }

        // Store unit data
        if (response.data.data?.unit) {
          localStorage.setItem('unit', JSON.stringify(response.data.data.unit));
        }

        return response.data.data;
      } catch (error: unknown) {
        console.error('Position auth request failed:', error);
        if (typeof error === 'object' && error !== null && 'response' in error && typeof error.response === 'object' && error.response !== null) {
          const axiosError = error as { response?: { data?: { message?: string } } };
          console.error('Error response:', axiosError.response?.data);
          const errorMessage = axiosError.response?.data?.message || 'Position authentication failed';
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
        toast.error('Position authentication failed');
        throw error;
      }
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (request: ForgotPasswordRequest) => {
      try {
        // Send JSON data directly as per backend API specification
        const jsonData = {
          email: request.email,
        };

        const response = await api.post<ApiResponse<ForgotPasswordResponse>>('/v2/auth/forgot-password', jsonData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        // Debug the response
        console.log('Forgot password response:', response);

        if (!response.data) {
          throw new Error('No response received from server');
        }

        // Show success toast
        if (response.data.message) {
          toast.success(response.data.message);
        }

        return response.data;
      } catch (error: unknown) {
        console.error('Forgot password request failed:', error);
        if (typeof error === 'object' && error !== null && 'response' in error && typeof error.response === 'object' && error.response !== null) {
          const axiosError = error as { response?: { data?: { message?: string } } };
          console.error('Error response:', axiosError.response?.data);
          const errorMessage = axiosError.response?.data?.message || 'Failed to send reset email';
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
        toast.error('Failed to send reset email');
        throw error;
      }
    },
  });
};


export const useUpdatePassword = () => {
  return useMutation<UpdatePasswordResponse, Error, UpdatePasswordRequest>({
    mutationFn: async (request: UpdatePasswordRequest) => {
      const jsonData = {
        currentPassword: request.currentPassword,
        newPassword: request.newPassword,
      };

      console.log('Update password request data:', jsonData);
      console.log('Update password request URL:', '/v2/auth/update-password');

      const response = await api.patch<ApiResponse<UpdatePasswordResponse>>('/v2/auth/update-password', jsonData, {
        headers: { 'Content-Type': 'application/json' },
      });

      console.log('Update password response:', response);

      if (!response.data.data) {
        throw new Error('No data received from update password request');
      }

      return response.data.data;
    },
    onSuccess: () => {
      toast.success('Password updated successfully!');
    },
    onError: (error: unknown) => {
      console.error('Update password request failed:', error);
      const axiosError = error as { response?: { data?: { message?: string }, status?: number } };
      const errorMessage = axiosError.response?.data?.message || 'Failed to update password';
      const status = axiosError.response?.status;
      
      console.error('Update password error message:', errorMessage);
      console.error('Update password error status:', status);
      
      // Show specific error messages based on status codes
      if (status === 401) {
        toast.error('Invalid current password. Please check your current password and try again.');
      } else if (status === 404) {
        toast.error('Account not found. Please contact support.');
      } else {
        toast.error(errorMessage);
      }
    },
  });
};

export const useResetPassword = () => {
  return useMutation<{ message: string }, Error, ResetPasswordRequest>({
    mutationFn: async (request: ResetPasswordRequest) => {
      const jsonData = {
        email: request.email,
        new_password: request.new_password,
        reset_token: request.reset_token,
      };

      console.log('Reset password request data:', jsonData);
      console.log('Reset password request URL:', '/v2/auth/reset-password');

      const response = await api.post<ApiResponse<{ message: string }>>('/v2/auth/reset-password', jsonData, {
        headers: { 'Content-Type': 'application/json' },
      });

      console.log('Reset password response:', response);

      if (!response.data.data) {
        throw new Error('No data received from reset password request');
      }

      return response.data.data;
    },
    onSuccess: () => {
      toast.success('Password reset successfully!');
    },
    onError: (error: unknown) => {
      console.error('Reset password request failed:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      const errorMessage = axiosError.response?.data?.message || 'Failed to reset password';
      console.error('Reset password error message:', errorMessage);
      toast.error('Failed to reset password');
    },
  });
};

export const useAuthLogout =()=> {
  return useMutation({
    mutationFn: async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }
        // Call the backend logout endpoint
        const response = await api.post('/v2/auth/logout', {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('position');
        localStorage.removeItem('organization');
        localStorage.removeItem('unit');
        // Show success toast
        toast.success(response.data?.message || 'Logged out successfully');
        return { success: true };
      } catch (error: unknown) {
        console.error('Logout request failed:', error);
        if (typeof error === 'object' && error !== null && 'response' in error && typeof error.response === 'object' && error.response !== null) {
          const axiosError = error as { response?: { data?: { message?: string } } };
          console.error('Error response:', axiosError.response?.data);
          const errorMessage = axiosError.response?.data?.message || 'Failed to log out';
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
        toast.error('Failed to log out');
        throw error;
      }
    }
  });
}

// Email verification query
export const useVerifyEmail = () => {
  return useMutation<VerifyEmailResponse, Error, VerifyEmailRequest>({
    mutationFn: async ({ token }) => {
      console.log('Making verification API call with token:', token);
      const response = await api.get<ApiResponse<VerifyEmailResponse>>(`/v2/auth/verify?token=${token}`);
      console.log('Verification API response:', response.data);
      
      if (!response.data.data) {
        throw new Error('No data received from verification request');
      }

      return response.data.data;
    },
    onSuccess: (data) => {
      // Store the new access token as verification_token (not regular token)
      if (data.token) {
        localStorage.setItem('verification_token', data.token);
        console.log('Verification token stored successfully');
      }
      
      // Store the email for resend verification functionality
      if (data.email) {
        localStorage.setItem('verification_email', data.email);
        console.log('Verification email stored successfully');
      }
      
      // Don't show toast here as it's handled in the component
    },
    onError: (error: unknown) => {
      console.error('Email verification failed:', error);
      const axiosError = error as { 
        response?: { 
          data?: { message?: string };
          status?: number;
        };
        message?: string;
      };
      
      const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Failed to verify email';
      const status = axiosError.response?.status;
      
      // Don't show toast here as it's handled in the component
      // Only log errors that are not 409 (already verified) or 401 (auth issues)
      if (status !== 409 && status !== 401) {
        console.error('Verification error:', errorMessage);
      }
    },
  });
};

// Resend verification email
export const useResendVerification = () => {
  return useMutation<{ message: string }, Error, { email: string }>({
    mutationFn: async ({ email }) => {
      console.log('Resending verification email to:', email);
      const response = await api.post<ApiResponse<{ message: string }>>(
        '/v2/auth/resend-invitation',
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Resend verification API response:', response.data);

      if (!response.data.message) {
        throw new Error('No response message received');
      }

      return { message: response.data.message };
    },
    onSuccess: (data) => {
      toast.success('Verification email sent!', {
        description: data.message,
        duration: 5000,
      });
    },
    onError: (error: unknown) => {
      console.error('Resend verification failed:', error);
      const axiosError = error as { 
        response?: { 
          data?: { message?: string };
          status?: number;
        };
        message?: string;
      };
      
      const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Failed to resend verification email';
      const status = axiosError.response?.status;
      
      if (status === 404) {
        toast.error('User not found', {
          description: 'No account found with this email address',
          duration: 5000,
        });
      } else if (status === 409) {
        toast.error('Email already verified', {
          description: 'This email address has already been verified',
          duration: 5000,
        });
      } else {
        toast.error('Failed to resend verification email', {
          description: errorMessage,
          duration: 5000,
        });
      }
    },
  });
};

// Set password and verify account
export const useSetPasswordAndVerify = () => {
  return useMutation<SetPasswordAndVerifyResponse, Error, SetPasswordAndVerifyRequest>({
    mutationFn: async ({ password }) => {
      console.log('Setting password and verifying account...');
      
      // Get verification token from localStorage (stored during email verification)
      const verificationToken = localStorage.getItem('verification_token');
      console.log('Verification token from localStorage:', verificationToken ? 'exists' : 'missing');
      
      if (!verificationToken) {
        throw new Error('No verification token found. Please verify your email first.');
      }

      console.log('Making set password API call with verification token');
      const response = await api.post<ApiResponse<SetPasswordAndVerifyResponse>>(
        '/v2/auth/set-password-and-verify',
        { password },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${verificationToken}`,
          },
        }
      );
      console.log('Set password API response:', response.data);

      if (!response.data.data) {
        throw new Error('No data received from set password request');
      }

      return response.data.data;
    },
    onSuccess: () => {
      // Clear verification data after successful password setting
      localStorage.removeItem('verification_token');
      localStorage.removeItem('verification_email');
      toast.success('Account verified and password set successfully!');
    },
    onError: (error: unknown) => {
      console.error('Set password and verify failed:', error);
      const axiosError = error as { 
        response?: { 
          data?: { message?: string };
          status?: number;
        };
        message?: string;
      };
      
      const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Failed to set password and verify account';
      const status = axiosError.response?.status;
      
      if (status === 409) {
        toast.error('Account is already verified. You can now login.');
      } else if (status === 401) {
        toast.error('Verification session expired. Please try again from the email link.');
      } else {
        toast.error(errorMessage);
      }
    },
  });
};

// Fetch paginated organizations
export const useOrganizations = (page = 1, limit = 10) => {
  return useQuery<PaginatedOrganizations, Error>({
    queryKey: ['organizations', page, limit],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ organizations: Organization[]; pagination: Pagination }>>('/v2/organizations', {
        params: { page, limit },
      });
      if (!data.data) throw new Error('No data');
      return data.data;
    },
  });
};

// --- GET /v2/organizations/{organization_id} ---
export const useOrganization = (organization_id: string) => {
  return useQuery({
    queryKey: ['organization', organization_id],
    queryFn: async () => {
      const { data } = await api.get<{ data: Organization }>(`/v2/organizations/${organization_id}`);
      if (!data.data) throw new Error('No data');
      return data.data;
    },
    enabled: !!organization_id,
  });
};
//----------------------------------------------------------------------------------
// Create organization (multipart/form-data)
export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation<Organization, Error, FormData>({
    mutationFn: async (formData) => {
      const { data } = await api.post<ApiResponse<Organization>>('/v2/organizations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (!data.data) throw new Error('No data');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organization created successfully!');
    },
    onError: (error: unknown) => {
      let apiMsg: string | undefined;
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
      ) {
        apiMsg = (error.response.data as { message?: string }).message;
      }
      toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to create organization.'));
    },
  });
};

// --- PATCH /v2/organizations/{organization_id} ---
export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation<Organization, Error, { organization_id: string; updates: Partial<Organization> }>({
    mutationFn: async ({ organization_id, updates }) => {
      const { data } = await api.patch<{ data: Organization }>(`/v2/organizations/${organization_id}`, updates, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!data.data) throw new Error('No data');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organization updated successfully!');
    },
    onError: (error: unknown) => {
      let apiMsg: string | undefined;
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
      ) {
        apiMsg = (error.response.data as { message?: string }).message;
      }
      toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to update organization.'));
    },
  });
};
//---------------------------------------------------------------------------------------------

// --- DELETE /v2/organizations/{organization_id} ---
export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, { organization_id: string }>({
    mutationFn: async ({ organization_id }) => {
      const { data } = await api.delete<{ message: string }>(`/v2/organizations/${organization_id}`);
      if (!data.message) throw new Error('No data');
      return { message: data.message };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organization disabled successfully!');
    },
    onError: (error: unknown) => {
      let apiMsg: string | undefined;
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
      ) {
        apiMsg = (error.response.data as { message?: string }).message;
      }
      toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to disable organization.'));
    },
  });
};


export const useOrganizationUnits = () => {
  return useQuery<Unit[], Error>({
    queryKey: ['units'],
    queryFn: async () => {
      const response = await api.get<{ message: string; data: Unit[] }>('/v2/organizations/units');
      console.log('Units API response:', response.data);
      if (!response.data.data) throw new Error('No data');
      return response.data.data.map((unit) => ({
        ...unit,
        status: unit.status || 'ACTIVE',
      }));
    },
  });
};


// --- Get all positions in a unit ---
export const useUnitPositions = (unit_id: string) => {
  return useQuery<Position[], Error>({
    queryKey: ['unit-positions', unit_id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Position[]>>(`/v2/organizations/units/${unit_id}/positions`);
      if (!data.data) throw new Error('No data');
      return data.data;
    },
    enabled: !!unit_id,
  });
};

// --- GET /v2/organizations/{organization_id}/units ---
export const useOrganizationUnitsByOrgId = (organization_id: string) => {
  return useQuery<Unit[], Error>({
    queryKey: ['organization-units', organization_id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Unit[]>>(`/v2/organizations/${organization_id}/units`);
      if (!data.data) throw new Error('No data');
      return data.data;
    },
    enabled: !!organization_id,
  });
};

export const useCreateUnit = () => {
  const queryClient = useQueryClient();
  return useMutation<Unit, Error, CreateUnitDto>({
    mutationFn: async (unit) => {
      const formData = new FormData();
      formData.append('unit_name', unit.unit_name);
      formData.append('organization_id', unit.organization_id);
      const { data } = await api.post<ApiResponse<Unit>>('/v2/organizations/units', formData, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!data.data) throw new Error('No data');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      toast.success('Unit created successfully!');
    },
    onError: (error: unknown) => {
      let apiMsg: string | undefined;
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
      ) {
        apiMsg = (error.response.data as { message?: string }).message;
      }
      toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to create unit.'));
    },
  });
};
//----------------------------------------------------------------
// --- GET /v2/organizations/units/{unit_id} ---
export const useOrganizationUnit = (unit_id: string) => {
  return useQuery<Unit, Error>({
    queryKey: ['unit', unit_id],
    queryFn: async () => {
      const { data } = await api.get<{ data: Unit }>(`/v2/organizations/units/${unit_id}`);
      if (!data.data) throw new Error('No data');
      return data.data;
    },
    enabled: !!unit_id,
  });
};

// --- PATCH /v2/organizations/units/{unit_id} ---
export const useUpdateOrganizationUnit = () => {
  const queryClient = useQueryClient();
  return useMutation<Unit, Error, { unit_id: string; updates: Partial<Unit> }>({
    mutationFn: async ({ unit_id, updates }) => {
      const { data } = await api.patch<{ data: Unit }>(`/v2/organizations/units/${unit_id}`, updates, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!data.data) throw new Error('No data');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      toast.success('Unit updated successfully!');
    },
    onError: (error: unknown) => {
      let apiMsg: string | undefined;
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
      ) {
        apiMsg = (error.response.data as { message?: string }).message;
      }
      toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to update unit.'));
    },
  });
};

// --- DELETE /v2/organizations/units/{unit_id} ---
export const useOrganizationDeleteUnit = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, { unit_id: string }>({
    mutationFn: async ({ unit_id }) => {
      const { data } = await api.delete<{ message: string }>(`/v2/organizations/units/${unit_id}`);
      if (!data.message) throw new Error('No data');
      return { message: data.message };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      toast.success('Unit deleted successfully!');
    },
    onError: (error: unknown) => {
      let apiMsg: string | undefined;
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
      ) {
        apiMsg = (error.response.data as { message?: string }).message;
      }
      toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to delete unit.'));
    },
  });
};


// --- Create a new position in a unit ---
export const useCreatePosition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (positionData: {
      position_name: string;
      position_description: string;
      unit_id: string;
      position_access: position_accesses;
    }) => {
      try {
        const { data } = await api.post('/v2/organizations/positions', positionData, {
          headers: { 'Content-Type': 'application/json' },
        });
        if (!data.data) throw new Error('No data');
        return data.data;
      } catch (error: unknown) {
        // Show toast for specific backend error
        if (
          typeof error === 'object' &&
          error !== null &&
          'response' in error &&
          error.response &&
          typeof error.response === 'object' &&
          'data' in error.response &&
          error.response.data &&
          typeof error.response.data === 'object' &&
          'message' in error.response.data
        ) {
          toast.error((error.response.data as { message?: string }).message);
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unit-positions'] });
      toast.success('Position created successfully!');
    },
    onError: (error: unknown) => {
      let apiMsg: string | undefined;
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
      ) {
        apiMsg = (error.response.data as { message?: string }).message;
      }
      toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to create position.'));
    },
  });
};

// --- Delete (soft) a position ---
export const useDeletePosition = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, { positionId: string; unit_id: string }>({
    mutationFn: async ({ positionId }) => {
      const { data } = await api.delete<ApiResponse<{ message: string }>>(`/v2/organizations/positions/${positionId}`);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['unit-positions', variables.unit_id] });
      toast.success('Position deleted successfully!');
    },
    onError: (error: unknown) => {
      let apiMsg: string | undefined;
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
      ) {
        apiMsg = (error.response.data as { message?: string }).message;
      }
      toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to delete position.'));
    },
  });
};

// --- GET /v2/organizations/positions/{position_id} ---
export const usePosition = (position_id: string) => {
  return useQuery<Position, Error>({
    queryKey: ['position', position_id],
    queryFn: async () => {
      const { data } = await api.get<{ data: Position }>(`/v2/organizations/positions/${position_id}`);
      if (!data.data) throw new Error('No data');
      return data.data;
    },
    enabled: !!position_id,
  });
};

export const useAssignPositionToUser = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string; data: Position }, Error, { position_id: string; email: string }>({
    mutationFn: async ({ position_id, email }) => {
      const { data } = await api.patch<{ message: string; data: Position }>(`/v2/organizations/positions/${position_id}/assign`, { email });
      if (!data.message) throw new Error('No data');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unit-positions'] });
      queryClient.invalidateQueries({ queryKey: ['all-positions'] });
      toast.success('User assigned to position successfully!');
    },
    onError: (error: unknown) => {
      let apiMsg: string | undefined;
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
      ) {
        apiMsg = (error.response.data as { message?: string }).message;
      }
      toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to assign user to position.'));
    },
  });
};

export const usePositions = () => {
  return useQuery<Position[], Error>({
    queryKey: ['all-positions'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Position[]>>('/v2/organizations/positions');
      if (!data.data) throw new Error('No data');
      return data.data;
    },
  });
};

// --- PATCH /v2/organizations/positions/{position_id} ---
export const useUpdatePosition = () => {
  const queryClient = useQueryClient();
  return useMutation<Position, Error, { position_id: string; updates: Partial<Position> }>({
    mutationFn: async ({ position_id, updates }) => {
      const { data } = await api.patch<{ data: Position }>(`/v2/organizations/positions/${position_id}`, updates, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!data.data) throw new Error('No data');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unit-positions'] });
      toast.success('Position updated successfully!');
    },
    onError: (error: unknown) => {
      let apiMsg: string | undefined;
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
      ) {
        apiMsg = (error.response.data as { message?: string }).message;
      }
      toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to update position.'));
    },
  });
};

// --- GET all users grouped by unit ---
export const useOrganizationUsers = () => {
  return useQuery<UserWithPositions[], Error>({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get<{ data: UserWithPositions[] }>('/v2/users');
      if (!data.data) throw new Error('No data');
      return data.data;
    },
  });
};

export const useOrganizationUser = (user_id: string) => {
  return useQuery<UserWithPositions, Error>({
    queryKey: ['user', user_id],
    queryFn: async () => {
      const { data } = await api.get<{ data: UserWithPositions }>(`/v2/users/${user_id}`);
      if (!data.data) throw new Error('No data');
      return data.data;
    },
    enabled: !!user_id,
  });
};

// --- Create user ---
export const useOrganizationCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation<UserWithPositions, Error, CreateUserDto>({
    mutationFn: async (user) => {
      const { data } = await api.post<{ data: UserWithPositions }>('/v2/users', user, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!data.data) throw new Error('No data');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully!');
    },
    onError: (error: unknown) => {
      let apiMsg: string | undefined;
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
      ) {
        apiMsg = (error.response.data as { message?: string }).message;
      }
      toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to create user.'));
    },
  });
};

export const useOrganizationUpdateUser = (user_id: string) => {
  const queryClient = useQueryClient();
  return useMutation<UserWithPositions, Error, UpdateUserDto>({
    mutationFn: async (updates) => {
      const { data } = await api.patch<{ data: UserWithPositions }>(`/v2/users/${user_id}`, updates, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!data.data) throw new Error('No data');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', user_id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully!');
    },
    onError: (error: unknown) => {
      let apiMsg: string | undefined;
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
      ) {
        apiMsg = (error.response.data as { message?: string }).message;
      }
      toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to update user.'));
    },
  });
};



// --- Get all vehicle models ---
export const useVehicleModels = () => {
  return useQuery<VehicleModel[], Error>({
    queryKey: ['vehicle-models'],
    queryFn: async () => {
      const { data } = await api.get<{ data: VehicleModel[] }>('/v2/vehicle-models');
      if (!data.data) throw new Error('No data');
      return data.data;
    },
  });
};

// --- Get a vehicle model by ID ---
export const useVehicleModel = (id: string) => {
  return useQuery<VehicleModel, Error>({
    queryKey: ['vehicle-model', id],
    queryFn: async () => {
      const { data } = await api.get<{ data: VehicleModel }>(`/v2/vehicle-models/${id}`);
      if (!data.data) throw new Error('No data');
      return data.data;
    },
    enabled: !!id,
  });
};

// --- Create a vehicle model ---
export const useCreateVehicleModel = () => {
  const queryClient = useQueryClient();
  return useMutation<VehicleModel, Error, CreateVehicleModelDto>({
    mutationFn: async (model) => {
      const { data } = await api.post<{ data: VehicleModel }>('/v2/vehicle-models', model, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!data.data) throw new Error('No data');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-models'] });
      toast.success('Vehicle model created successfully!');
    },
    onError: (error: unknown) => {
      let apiMsg: string | undefined;
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
      ) {
        apiMsg = (error.response.data as { message?: string }).message;
      }
      // Show raw error if nothing else
      toast.error(apiMsg || JSON.stringify(error) || (error instanceof Error ? error.message : 'Failed to create vehicle model.'));
    },
  });
};

// --- Update a vehicle model ---
export const useUpdateVehicleModel = () => {
  const queryClient = useQueryClient();
  return useMutation<VehicleModel, Error, { id: string; updates: Partial<CreateVehicleModelDto> }>({
    mutationFn: async ({ id, updates }) => {
      const { data } = await api.put<{ data: VehicleModel }>(`/v2/vehicle-models/${id}`, updates, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!data.data) throw new Error('No data');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-models'] });
      toast.success('Vehicle model updated successfully!');
    },
    onError: (error: unknown) => {
      let apiMsg: string | undefined;
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
      ) {
        apiMsg = (error.response.data as { message?: string }).message;
      }
      toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to update vehicle model.'));
    },
  });
};

// --- Delete a vehicle model ---
export const useDeleteVehicleModel = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, { id: string }>({
    mutationFn: async ({ id }) => {
      const { data } = await api.delete<{ message: string }>(`/v2/vehicle-models/${id}`);
      if (!data.message) throw new Error('No data');
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-models'] });
      toast.success(data.message || 'Vehicle model deleted successfully!');
    },
    onError: (error: unknown) => {
      let apiMsg: string | undefined;
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
      ) {
        apiMsg = (error.response.data as { message?: string }).message;
      }
      // Show a user-friendly fallback if no message
      toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to delete vehicle model. Please try again.'));
    },
  });
};


// --- Get all vehicles (with nested vehicle_model and organization) ---
export const useVehicles = () => {
  return useQuery<Vehicle[], Error>({
    queryKey: ['vehicles'],
    queryFn: async () => {
      // Returns Vehicle[] with nested vehicle_model and organization objects
      const { data } = await api.get<{ data: Vehicle[] }>('/v2/vehicles');
      if (!data.data) throw new Error('No data');
      return data.data;
    },
  });
};

// --- Get a vehicle by ID (with nested vehicle_model and organization) ---
export const useVehicle = (id: string) => {
  return useQuery<Vehicle, Error>({
    queryKey: ['vehicle', id],
    queryFn: async () => {
      // Returns Vehicle with nested vehicle_model and organization objects
      const { data } = await api.get<{ data: Vehicle }>(`/v2/vehicles/${id}`);
      if (!data.data) throw new Error('No data');
      return data.data;
    },
    enabled: !!id,
  });
};

// --- Create a vehicle (multipart/form-data) ---
export const useCreateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation<Vehicle, Error, {
    plate_number: string;
    transmission_mode: TransmissionMode;
    vehicle_model_id: string;
    vehicle_photo?: File;
    vehicle_year: number;
    energy_type: string;
    organization_id: string;
  }>({
    mutationFn: async (vehicle) => {
      const formData = new FormData();
      formData.append('plate_number', vehicle.plate_number);
      formData.append('transmission_mode', vehicle.transmission_mode);
      formData.append('vehicle_model_id', vehicle.vehicle_model_id);
      if (vehicle.vehicle_photo) {
        formData.append('vehicle_photo', vehicle.vehicle_photo);
      }
      formData.append('vehicle_year', String(vehicle.vehicle_year));
      formData.append('energy_type', vehicle.energy_type);
      formData.append('organization_id', vehicle.organization_id);
      const { data } = await api.post<{ data: Vehicle }>('/v2/vehicles', formData);
      if (!data.data) throw new Error('No data');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Vehicle created successfully!');
    },
    onError: (error: unknown) => {
      let apiMsg: string | undefined;
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
      ) {
        apiMsg = (error.response.data as { message?: string }).message;
      }
      toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to create vehicle.'));
    },
  });
};

// --- Update a vehicle (application/json) ---
export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation<Vehicle, Error, { id: string; updates: {
    plate_number?: string;
    transmission_mode?: TransmissionMode;
    vehicle_model_id?: string;
    vehicle_year?: number;
    energy_type?: string;
    organization_id?: string;
    vehicle_photo?: File;
  } }>({
    mutationFn: async ({ id, updates }) => {
      // Only send allowed fields
      const allowed: Record<string, unknown> = {};
      if (updates.plate_number) allowed.plate_number = updates.plate_number;
      if (updates.transmission_mode) allowed.transmission_mode = updates.transmission_mode;
      if (updates.vehicle_model_id) allowed.vehicle_model_id = updates.vehicle_model_id;
      if (updates.vehicle_year) allowed.vehicle_year = updates.vehicle_year;
      if (updates.energy_type) allowed.energy_type = updates.energy_type;
      if (updates.organization_id) allowed.organization_id = updates.organization_id;
      // For photo, you may need to use FormData if updating image
      const { data } = await api.put<{ data: Vehicle }>(`/v2/vehicles/${id}`, allowed, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!data.data) throw new Error('No data');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Vehicle updated successfully!');
    },
    onError: (error: unknown) => {
      let apiMsg: string | undefined;
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
      ) {
        apiMsg = (error.response.data as { message?: string }).message;
      }
      toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to update vehicle.'));
    },
  });
};

// --- Delete a vehicle ---
export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, { id: string }>({
    mutationFn: async ({ id }) => {
      console.log('Deleting reservation with id:', id);
      try {
        const response = await api.delete(`/v2/reservations/${id}`);
        console.log('Delete reservation full response:', response);
        const { data } = response;
        console.log('Delete reservation data:', data);
        
        // Handle different response formats
        if (data.data) {
          return data.data;
        } else if (data && data.message) {
          return data;
        } else {
          return { message: 'Reservation deleted successfully' };
        }
      } catch (error) {
        console.error('Delete reservation API error:', error);
        throw error;
      }
    },
    onMutate: async ({ id }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['reservations'] });
      await queryClient.cancelQueries({ queryKey: ['myReservations'] });
      await queryClient.cancelQueries({ queryKey: ['reservation', id] });

      // Snapshot the previous values
      const previousReservations = queryClient.getQueryData(['reservations']);
      const previousMyReservations = queryClient.getQueryData(['myReservations']);
      const previousReservation = queryClient.getQueryData(['reservation', id]);

      // Optimistically update the reservation status
      const optimisticUpdate = (reservation: Reservation) => ({
        ...reservation,
        reservation_status: 'CANCELLED',
        rejection_comment: 'Reservation deleted by user',
        updated_at: new Date().toISOString(),
      });

      // Update reservations list
      queryClient.setQueryData(['reservations'], (old: Reservation[] = []) => {
        return old.map(reservation => 
          reservation.reservation_id === id 
            ? optimisticUpdate(reservation)
            : reservation
        );
      });

      // Update my reservations
      queryClient.setQueryData(['myReservations'], (old: Reservation | Reservation[] = []) => {
        if (Array.isArray(old)) {
          return old.map(reservation => 
            reservation.reservation_id === id 
              ? optimisticUpdate(reservation)
              : reservation
          );
        }
        return old;
      });

      // Update specific reservation
      queryClient.setQueryData(['reservation', id], (old: Reservation) => {
        return old ? optimisticUpdate(old) : old;
      });

      return { previousReservations, previousMyReservations, previousReservation };
    },
    onError: (err, variables, context: unknown) => {
      // Rollback on error
      const typedContext = context as { previousReservations?: unknown; previousMyReservations?: unknown; previousReservation?: unknown } | undefined;
      if (typedContext?.previousReservations) {
        queryClient.setQueryData(['reservations'], typedContext.previousReservations);
      }
      if (typedContext?.previousMyReservations) {
        queryClient.setQueryData(['myReservations'], typedContext.previousMyReservations);
      }
      if (typedContext?.previousReservation) {
        queryClient.setQueryData(['reservation', variables.id], typedContext.previousReservation);
      }
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['myReservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservation', variables.id] });
    },
  });
};

// reservation

export const useReservation = (id: string) => {
  return useQuery({
    queryKey: ['reservation', id],
    queryFn: async () => {
      const response = await api.get(`/v2/reservations/${id}`);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 0, // Always consider data stale to ensure fresh data
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });
};

export const useReservations = () => {
  return useQuery<Reservation[], Error>({
    queryKey: ['reservations'],
    queryFn: async () => {
      console.log('Fetching reservations...');
      const { data } = await api.get<{ data: Reservation[] }>('/v2/reservations');
      console.log('Reservations response:', data);
      if (!data.data) throw new Error('No data');
      return data.data;
    },
  });
};

export const useMyReservations = () => {
  return useQuery<Reservation, Error>({
    queryKey: ['myReservations'],
    queryFn: async () => {
      const { data } = await api.get<{ data: Reservation }>('/v2/reservations/my');
      if (!data.data) throw new Error('No data');
      return data.data;
    },
  });
}

export const useCreateReservation = () => {
  const queryClient = useQueryClient();
  return useMutation<Reservation, Error, CreateReservationDto>({
    mutationFn: async (dto) => {
      console.log('Creating reservation with data:', dto);
      try {
        const response = await api.post('/v2/reservations', dto, {
          headers: { 'Content-Type': 'application/json' },
        });
        console.log('Create reservation full response:', response);
        const { data } = response;
        console.log('Create reservation data:', data);
        
        // Handle different response formats
        if (data.data) {
          return data.data;
        } else if (data) {
          return data;
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Create reservation API error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast.success('Reservation created successfully!');
    },
    onError: (error: unknown) => {
      console.error('Create reservation error:', error);
      let apiMsg: string | undefined;
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
      ) {
        apiMsg = (error.response.data as { message?: string }).message;
      }
      const errorMessage = apiMsg || (error instanceof Error ? error.message : 'Failed to create reservation.');
      console.error('Toast error message:', errorMessage);
      toast.error(errorMessage);
    },
  });
};

export const useCancelReservation = () => {
  const queryClient = useQueryClient();
  return useMutation<Reservation, Error, { id: string; dto: { reason: string } }>({
    mutationFn: async ({ id, dto }) => {
      console.log('Cancelling reservation:', { id, dto });
      const { data } = await api.post<{ message: string; data: Reservation }>(
        `/v2/reservations/${id}/cancel`,
        dto,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (!data.data) throw new Error('No data received');
      return data.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate all reservation-related queries
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['my-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservation', variables.id] });
      
      // Update the specific reservation in cache
      queryClient.setQueryData(['reservation', variables.id], data);
      
      toast.success('Reservation cancelled successfully!');
    },
    onError: (error: unknown) => {
      console.error('Reservation cancellation error:', error);
      let apiMsg: string | undefined;
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        (error as { response?: { data?: { message?: string } } }).response?.data?.message
      ) {
        apiMsg = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      }
      toast.error(apiMsg || 'Failed to cancel reservation');
    },
  });
};

export const useUpdateReservation = () => {
  const queryClient = useQueryClient();
  return useMutation<Reservation, Error, { id: string; dto: UpdateReservationStatusDto }>({
    mutationFn: async ({ id, dto }) => {
      console.log('Updating reservation:', { id, dto });
      const { data } = await api.patch<{ message: string; data: Reservation }>(
        `/v2/reservations/${id}/status`,
        dto,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (!data.data) throw new Error('No data received');
      return data.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate all reservation-related queries
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['my-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservation', variables.id] });
      
      // Update the specific reservation in cache
      queryClient.setQueryData(['reservation', variables.id], data);
      
      toast.success('Reservation updated successfully!');
    },
    onError: (error: unknown) => {
      console.error('Reservation update error:', error);
      let apiMsg: string | undefined;
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        (error as { response?: { data?: { message?: string } } }).response?.data?.message
      ) {
        apiMsg = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      }
      toast.error(apiMsg || 'Failed to update reservation');
    },
  });
};

export const useReservationVehiclesOdometerAssignation = () => {
  const queryClient = useQueryClient();
  return useMutation<Reservation, Error, { id: string; dto: { vehicles: Array<{ vehicle_id: string; starting_odometer: number; fuel_provided: number }> } }>({
    mutationFn: async ({ id, dto }) => {
      console.log('Assigning vehicles with odometer/fuel data:', { id, dto });
      
      const { data } = await api.patch<{ message: string; data: Reservation }>(
        `/v2/reservations/${id}/assign-multiple-vehicles-odometer`, 
        dto,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      
      if (!data.data) throw new Error('No data received');
      return data.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate all reservation-related queries
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['my-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservation', variables.id] });
      
      // Update the specific reservation in cache
      queryClient.setQueryData(['reservation', variables.id], data);
      
      toast.success('Vehicles updated with odometer/fuel and status updated successfully!');
    },
    onError: (error: unknown) => {
      console.error('Vehicle odometer/fuel update error:', error);
      let apiMsg: string | undefined;
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        (error as { response?: { data?: { message?: string } } }).response?.data?.message
      ) {
        apiMsg = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      }
      toast.error(apiMsg || 'Failed to update vehicles with odometer/fuel');
    },
  });
};

export const useAddVehicleToReservation = () => {
  const queryClient = useQueryClient();
  return useMutation<VehicleOperationResponse[], Error, { id: string; dto: AddVehicleToReservationDto }>({
    mutationFn: async ({ id, dto }) => {
      console.log('Adding vehicle to reservation:', { id, dto });
      
      try {
        const { data } = await api.post<VehicleOperationApiResponse>(
          `/v2/reservations/${id}/add-vehicle`,
          dto,
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );
        
        console.log('Add vehicle API response:', data);
        
        if (!data.data) throw new Error('No data received');
        return data.data;
      } catch (error) {
        console.error('Add vehicle API error:', error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      console.log('Vehicle added successfully:', data);
      
      // Invalidate all reservation-related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['my-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservation', variables.id] });
      
      toast.success('Vehicle added to reservation successfully!');
    },
    onError: (error: unknown) => {
      console.error('Add vehicle error:', error);
      
      let apiMsg: string | undefined;
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        (error as { response?: { data?: { message?: string } } }).response?.data?.message
      ) {
        apiMsg = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      }
      
      const errorMessage = apiMsg || (error instanceof Error ? error.message : 'Failed to add vehicle to reservation');
      toast.error(errorMessage);
    },
  });
};

export const useRemoveVehicleFromReservation = () => {
  const queryClient = useQueryClient();
  return useMutation<VehicleOperationResponse[], Error, { id: string; dto: RemoveVehicleFromReservationDto }>({
    mutationFn: async ({ id, dto }) => {
      console.log('Removing vehicle from reservation:', { id, dto });
      
      try {
        const { data } = await api.post<VehicleOperationApiResponse>(
          `/v2/reservations/${id}/remove-vehicle`,
          dto,
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );
        
        console.log('Remove vehicle API response:', data);
        
        if (!data.data) throw new Error('No data received');
        return data.data;
      } catch (error) {
        console.error('Remove vehicle API error:', error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      console.log('Vehicle removed successfully:', data);
      
      // Invalidate all reservation-related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['my-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservation', variables.id] });
      
      toast.success('Vehicle removed from reservation successfully!');
    },
    onError: (error: unknown) => {
      console.error('Remove vehicle error:', error);
      
      let apiMsg: string | undefined;
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        (error as { response?: { data?: { message?: string } } }).response?.data?.message
      ) {
        apiMsg = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      }
      
      const errorMessage = apiMsg || (error instanceof Error ? error.message : 'Failed to remove vehicle from reservation');
      toast.error(errorMessage);
    },
  });
};

export const useUpdateReservationReason = () => {
  const queryClient = useQueryClient();
  return useMutation<Reservation, Error, { id: string; dto: { reason: string } }>({
    mutationFn: async ({ id, dto }) => {
      console.log('Updating reservation reason:', { id, dto });
      const { data } = await api.patch<{ message: string; data: Reservation }>(
        `/v2/reservations/${id}/reason`,
        dto,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (!data.data) throw new Error('No data received');
      return data.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate all reservation-related queries
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['my-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservation', variables.id] });
      
      // Update the specific reservation in cache
      queryClient.setQueryData(['reservation', variables.id], data);
      
      toast.success('Reservation reason updated successfully!');
    },
    onError: (error: unknown) => {
      console.error('Reservation reason update error:', error);
      let apiMsg: string | undefined;
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        (error as { response?: { data?: { message?: string } } }).response?.data?.message
      ) {
        apiMsg = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      }
      toast.error(apiMsg || 'Failed to update reservation reason');
    },
  });
};

export const useCompleteReservation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { reservedVehicleId: string; dto: { returned_odometer: number } }>({
    mutationFn: async ({ reservedVehicleId, dto }) => {
      console.log('Completing reserved vehicle:', { reservedVehicleId, dto });
      
      try {
        const { data } = await api.post<{ message: string }>(
          `/v2/reservations/${reservedVehicleId}/complete`,
          dto,
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );
        console.log('API Response:', data);
        
        // Check if we have a valid response
        if (!data) throw new Error('No response received from server');
        
        // The API returns just a success message, which is fine
        // We don't need to return anything since we'll invalidate the cache
      } catch (error) {
        console.error('API call error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('Vehicle completion successful');
      
      // Since the API only returns a message, we need to invalidate the cache
      // to fetch the updated reservation data
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['my-reservations'] });
      
      toast.success('Vehicle returned successfully!');
    },
    onError: (error: unknown) => {
      console.error('Vehicle return error:', error);
      
      let apiMsg: string | undefined;
      
      // Try to extract error message from different response formats
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error
      ) {
        const response = (error as { response?: { data?: { message?: string; error?: string }; statusText?: string } }).response;
        if (response?.data?.message) {
          apiMsg = response.data.message;
        } else if (response?.data?.error) {
          apiMsg = response.data.error;
        } else if (response?.statusText) {
          apiMsg = response.statusText;
        }
      }
      
      toast.error(apiMsg || 'Failed to return vehicle');
    },
  });
};




// vehicleIssues

export const useVehicleIssues = () => {
  return useQuery<VehicleIssue[], Error>({
    queryKey: ['vehicle-issues'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<VehicleIssue[]>>('/v2/issues');
      if (!data.data) throw new Error('No data');
      return data.data;
    },
  });
};

export const useCreateVehicleIssue = () => {
  const queryClient = useQueryClient();
  return useMutation<VehicleIssue, Error, CreateVehicleIssueDto>({
    mutationFn: async (vehicleIssue) => {
      console.log('Creating vehicle issue with data:', vehicleIssue);
      const { data } = await api.post('/v2/issues', vehicleIssue);
      console.log('Create vehicle issue response:', data);
      
      // Accept both { data: {...} } and direct object
      if (data && typeof data === 'object' && 'data' in data && data.data) {
        return data.data as VehicleIssue;
      } else if (data && typeof data === 'object' && 'issue_id' in data && 'issue_title' in data) {
        // Direct object (not wrapped in data)
        return data as VehicleIssue;
      } else if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string' && data.message.includes('success')) {
        // fallback
        return {
          issue_id: 'temp-id',
          issue_title: vehicleIssue.issue_title,
          issue_description: vehicleIssue.issue_description,
          issue_status: 'OPEN',
          issue_date: vehicleIssue.issue_date,
          created_at: new Date().toISOString(),
          reserved_vehicle_id: vehicleIssue.reserved_vehicle_id,
        } as VehicleIssue;
      } else {
        throw new Error('Unexpected response structure from create vehicle issue request');
      }
    },
    onMutate: async (newVehicleIssue) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['vehicle-issues'] });

      // Snapshot the previous value
      const previousVehicleIssues = queryClient.getQueryData(['vehicle-issues']);

      // Optimistically update to the new value
      const optimisticVehicleIssue: VehicleIssue = {
        issue_id: `temp-${Date.now()}`,
        issue_title: newVehicleIssue.issue_title,
        issue_description: newVehicleIssue.issue_description,
        issue_status: 'OPEN',
        message: newVehicleIssue.message,
        issue_date: newVehicleIssue.issue_date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        reserved_vehicle_id: newVehicleIssue.reserved_vehicle_id,
        reserved_vehicle: null, // Will be filled by server
      };

      // Update vehicle issues list
      queryClient.setQueryData(['vehicle-issues'], (old: VehicleIssue[] = []) => {
        return [optimisticVehicleIssue, ...old];
      });

      // Return a context object with the snapshotted value
      return { previousVehicleIssues };
    },
    onError: (err, newVehicleIssue, context: unknown) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      const typedContext = context as { previousVehicleIssues?: unknown } | undefined;
      if (typedContext?.previousVehicleIssues) {
        queryClient.setQueryData(['vehicle-issues'], typedContext.previousVehicleIssues);
      }
      
      console.error('Create vehicle issue request failed:', err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      const errorMessage = axiosError.response?.data?.message || 'Failed to report vehicle issue';
      console.error('Create vehicle issue error message:', errorMessage);
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['vehicle-issues'] });
    },
    onSuccess: () => {
      toast.success('Vehicle issue reported successfully!');
    },
  });
};

export const useVehicleIssue = (issueId: string) => {
  return useQuery<VehicleIssue, Error>({
    queryKey: ['vehicle-issue', issueId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<VehicleIssue>>(`/v2/issues/${issueId}`);
      if (!data.data) throw new Error('No data');
      return data.data;
    },
    enabled: !!issueId,
  });
};

export const useUpdateVehicleIssue = () => {
  return useMutation<VehicleIssue, Error, { issueId: string; updates: { issue_title?: string; issue_description?: string; issued_date?: string } }>({
    mutationFn: async ({ issueId, updates }) => {
      console.log('Updating vehicle issue with data:', { issueId, updates });
      const { data } = await api.put(`/v2/issues/${issueId}`, updates);
      console.log('Update vehicle issue response:', data);
      
      // Handle both { data: {...} } and direct object responses
      if (data && typeof data === 'object' && 'data' in data && data.data) {
        return data.data as VehicleIssue;
      } else if (data && typeof data === 'object' && 'id' in data) {
        // Direct object with new field names
        return {
          issue_id: data.id,
          issue_title: data.issue_title,
          issue_status: data.issue_status,
          issue_description: data.issue_description,
          issue_date: data.issue_date,
          created_at: data.createdAt,
          updated_at: data.updatedAt,
          reserved_vehicle_id: data.reserved_vehicle_id,
        } as VehicleIssue;
      } else {
        throw new Error('Unexpected response structure from update vehicle issue request');
      }
    },
    onSuccess: () => {
      toast.success('Vehicle issue updated successfully!');
    },
    onError: (error: unknown) => {
      console.error('Update vehicle issue request failed:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      const errorMessage = axiosError.response?.data?.message || 'Failed to update vehicle issue';
      console.error('Update vehicle issue error message:', errorMessage);
      toast.error(errorMessage);
    },
  });
};

export const useRespondToVehicleIssue = () => {
  const queryClient = useQueryClient();
  return useMutation<VehicleIssue, Error, { issueId: string; message: string }>({
    mutationFn: async ({ issueId, message }) => {
      console.log('Responding to vehicle issue with data:', { issueId, message });
      const { data } = await api.patch(`/v2/issues/${issueId}/message`, { message });
      console.log('Respond to vehicle issue response:', data);
      
      // Handle both { data: {...} } and direct object responses
      if (data && typeof data === 'object' && 'data' in data && data.data) {
        return data.data as VehicleIssue;
      } else if (data && typeof data === 'object' && 'id' in data) {
        // Direct object with field mapping
        return {
          issue_id: data.id,
          issue_title: data.issue_title,
          issue_status: data.issue_status,
          issue_description: data.issue_description,
          issue_date: data.issue_date,
          created_at: data.createdAt,
          updated_at: data.updatedAt,
          reserved_vehicle_id: data.reserved_vehicle_id,
        } as VehicleIssue;
      } else {
        throw new Error('Unexpected response structure from respond to vehicle issue request');
      }
    },
    onSuccess: () => {
      toast.success('Response sent successfully!');
      // Invalidate and refetch issues to get updated data
      queryClient.invalidateQueries({ queryKey: ['vehicle-issues'] });
    },
    onError: (error: unknown) => {
      console.error('Respond to vehicle issue request failed:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      const errorMessage = axiosError.response?.data?.message || 'Failed to send response';
      console.error('Respond to vehicle issue error message:', errorMessage);
      toast.error(errorMessage);
    },
  });
};

export const useDeleteVehicleIssue = () => {
  return useMutation<VehicleIssue, Error, { issueId: string }>({
    mutationFn: async ({ issueId }) => {
      const { data } = await api.delete<ApiResponse<VehicleIssue>>(`/v2/issues/${issueId}`);
      if (!data.data) throw new Error('No data');
      return data.data;
    },
  });
};

// Notifications

export const useNotifications = () => {
  return useQuery<Notification[], Error>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Notification[]>>('/v2/notifications');
      if (!data.data) throw new Error('No data');
      return data.data;
    },
  });
};

export const useMarkNotificationAsRead = () => {
  return useMutation<Notification, Error, { notification_id: string }>({
    mutationFn: async ({ notification_id }) => {
      const { data } = await api.delete<ApiResponse<Notification>>(`/v2/notifications/${notification_id}`);
      if (!data.data) throw new Error('No data');
      return data.data;
    },
  });
};




// audit logs

export const useAuditLogs = (filters: {
  name?: string;
  email?: string;
  organization?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
} = {}) => {
  return useQuery<AuditLog[], Error>({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.name) params.append('name', filters.name);
      if (filters.email) params.append('email', filters.email);
      if (filters.organization) params.append('organization', filters.organization);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.page) params.append('page', String(filters.page));
      if (filters.limit) params.append('limit', String(filters.limit));
      const query = params.toString() ? `?${params.toString()}` : '';
      const { data } = await api.get<ApiResponse<AuditLog[]>>(`/v2/history${query}`);
      if (!data.data) throw new Error('No data');
      return data.data;
    },
  });
};

// Get available vehicles for a specific date range
export const useGetAvailableVehicles = (departureDate: string, expectedReturningDate: string) => {
  return useQuery({
    queryKey: ['available-vehicles', departureDate, expectedReturningDate],
    queryFn: async () => {
      const response = await api.post('/v2/reservations/available-vehicles', {
        departure_date: departureDate,
        expected_returning_date: expectedReturningDate,
      });
      return response.data;
    },
    enabled: !!departureDate && !!expectedReturningDate,
  });
};

export const useAssignMultipleVehicles = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ 
      reservationId, 
      vehicleIds 
    }: { 
      reservationId: string; 
      vehicleIds: string[] 
    }) => {
      const response = await api.post(`/v2/reservations/${reservationId}/assign-multiple-vehicles`, {
        vehicle_ids: vehicleIds
      });
      return response.data;
    },
    onMutate: async ({ reservationId, vehicleIds }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['reservations'] });
      await queryClient.cancelQueries({ queryKey: ['myReservations'] });
      await queryClient.cancelQueries({ queryKey: ['reservation', reservationId] });

      // Snapshot the previous values
      const previousReservations = queryClient.getQueryData(['reservations']);
      const previousMyReservations = queryClient.getQueryData(['myReservations']);
      const previousReservation = queryClient.getQueryData(['reservation', reservationId]);

      // Get vehicles data for optimistic update
      const vehicles = queryClient.getQueryData(['vehicles']) as Vehicle[] || [];

      // Create optimistic reserved vehicles
      const optimisticReservedVehicles = vehicleIds.map(vehicleId => {
        const vehicle = vehicles.find(v => v.vehicle_id === vehicleId);
        return {
          reserved_vehicle_id: `temp-${Date.now()}-${vehicleId}`,
          vehicle: vehicle || { vehicle_id: vehicleId, vehicle_name: 'Loading...', plate_number: 'Loading...' },
          starting_odometer: null,
          fuel_provided: null,
          returned_odometer: null,
          returned_date: null,
        };
      });

      // Optimistically update the reservation
      const optimisticUpdate = (reservation: Reservation) => ({
        ...reservation,
        reservation_status: 'ACCEPTED',
        reserved_vehicles: optimisticReservedVehicles,
        updated_at: new Date().toISOString(),
      });

      // Update reservations list
      queryClient.setQueryData(['reservations'], (old: Reservation[] = []) => {
        return old.map(reservation => 
          reservation.reservation_id === reservationId 
            ? optimisticUpdate(reservation)
            : reservation
        );
      });

      // Update my reservations
      queryClient.setQueryData(['myReservations'], (old: Reservation | Reservation[] = []) => {
        if (Array.isArray(old)) {
          return old.map(reservation => 
            reservation.reservation_id === reservationId 
              ? optimisticUpdate(reservation)
              : reservation
          );
        }
        return old;
      });

      // Update specific reservation
      queryClient.setQueryData(['reservation', reservationId], (old: Reservation) => {
        return old ? optimisticUpdate(old) : old;
      });

      return { previousReservations, previousMyReservations, previousReservation };
    },
    onError: (err, variables, context: { previousReservations?: unknown; previousMyReservations?: unknown; previousReservation?: unknown } | undefined) => {
      // Rollback on error
      if (context?.previousReservations) {
        queryClient.setQueryData(['reservations'], context.previousReservations);
      }
      if (context?.previousMyReservations) {
        queryClient.setQueryData(['myReservations'], context.previousMyReservations);
      }
      if (context?.previousReservation) {
        queryClient.setQueryData(['reservation', variables.reservationId], context.previousReservation);
      }
      
      console.error('Vehicle assignment error:', err);
      let apiMsg: string | undefined;
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message
      ) {
        apiMsg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      }
      toast.error(apiMsg || 'Failed to assign vehicles');
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['myReservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservation', variables.reservationId] });
    },
    onSuccess: (data, variables) => {
      // Update the specific reservation in cache if data is available
      if (data?.data) {
        queryClient.setQueryData(['reservation', variables.reservationId], data.data);
      }
      toast.success('Vehicles assigned successfully!');
    },
  });
};


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
  CancelReservationDto,
  UpdateReservationStatusDto,
  StartReservationDto,
  CompleteReservationDto,
  VehicleIssue,
  CreateVehicleIssueDto,
  UpdateVehicleIssueDto,
  Notification,
  AuditLog,
  position_accesses,
} from '@/types/next-auth';
import { toast } from 'sonner';
import { TransmissionMode, VehicleType } from '@/types/enums';

// Define Unit type matching API response


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

      const response = await api.post<ApiResponse<UpdatePasswordResponse>>('/v2/auth/update-password', jsonData, {
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
      const axiosError = error as { response?: { data?: { message?: string } } };
      const errorMessage = axiosError.response?.data?.message || 'Failed to update password';
      console.error('Update password error message:', errorMessage);
      toast.error('Failed to update password');
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
      const formData = new FormData();
      formData.append('email', email);
      
      const { data } = await api.patch<{ message: string; data: Position }>(`/v2/organizations/positions/${position_id}/assign`, formData, {
        headers: { 'Content-Type': 'application/json' },
      });
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
export const useUsers = () => {
  return useQuery<UserWithPositions[], Error>({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get<{ data: UserWithPositions[] }>('/v2/users');
      if (!data.data) throw new Error('No data');
      return data.data;
    },
  });
};

// --- Create user ---
export const useCreateUser = () => {
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

export const useUser = (user_id: string) => {
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
export const useUpdateUser = (user_id: string) => {
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
    vehicle_type: VehicleType;
    transmission_mode: TransmissionMode;
    vehicle_model_id: string;
    vehicle_photo?: File;
    vehicle_year: number;
    vehicle_capacity: number;
    energy_type: string;
    organization_id: string;
  }>({
    mutationFn: async (vehicle) => {
      const formData = new FormData();
      formData.append('plate_number', vehicle.plate_number);
      formData.append('vehicle_type', vehicle.vehicle_type);
      formData.append('transmission_mode', vehicle.transmission_mode);
      formData.append('vehicle_model_id', vehicle.vehicle_model_id);
      if (vehicle.vehicle_photo) {
        formData.append('vehicle_photo', vehicle.vehicle_photo);
      }
      formData.append('vehicle_year', String(vehicle.vehicle_year));
      formData.append('vehicle_capacity', String(vehicle.vehicle_capacity));
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
    vehicle_type?: VehicleType;
    transmission_mode?: TransmissionMode;
    vehicle_model_id?: string;
    vehicle_year?: number;
    vehicle_capacity?: number;
    energy_type?: string;
    organization_id?: string;
    vehicle_photo?: File;
  } }>({
    mutationFn: async ({ id, updates }) => {
      // Only send allowed fields
      const allowed: Record<string, unknown> = {};
      if (updates.plate_number) allowed.plate_number = updates.plate_number;
      if (updates.vehicle_type) allowed.vehicle_type = updates.vehicle_type;
      if (updates.transmission_mode) allowed.transmission_mode = updates.transmission_mode;
      if (updates.vehicle_model_id) allowed.vehicle_model_id = updates.vehicle_model_id;
      if (updates.vehicle_year) allowed.vehicle_year = updates.vehicle_year;
      if (updates.vehicle_capacity) allowed.vehicle_capacity = updates.vehicle_capacity;
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
      const { data } = await api.delete<{ data: { message: string } }>(`/v2/vehicles/${id}`);
      if (!data.data) throw new Error('No data');
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success(data.message || 'Vehicle deleted successfully!');
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
      toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to delete vehicle.'));
    },
  });
};




// --- Reservations ---

export const useReservation = (id: string) => {
  return useQuery<Reservation, Error>({
    queryKey: ['reservation', id],
    queryFn: async () => {
      const { data } = await api.get<{ data: Reservation }>(`/v2/reservations/${id}`);
      if (!data.data) throw new Error('No data');
      return data.data;
    },
    enabled: !!id,
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
  return useMutation<Reservation, Error, { id: string; dto: CancelReservationDto }>({
    mutationFn: async ({ id, dto }) => {
      console.log('Cancelling reservation:', { id, dto });
      try {
        const response = await api.post(`/v2/reservations/${id}/cancel`, dto, {
          headers: { 'Content-Type': 'application/json' },
        });
        console.log('Cancel reservation full response:', response);
        const { data } = response;
        console.log('Cancel reservation data:', data);
        
        // Handle different response formats
        if (data.data) {
          return data.data;
        } else if (data) {
          return data;
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Cancel reservation API error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast.success('Reservation cancelled successfully!');
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
      toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to cancel reservation.'));
    },
  });
};

export const useUpdateReservation = () => {
  const queryClient = useQueryClient();
  return useMutation<Reservation, Error, { id: string; dto: UpdateReservationStatusDto }>({
    mutationFn: async ({ id, dto }) => {
      console.log('Updating reservation status:', { id, dto });
      try {
        const response = await api.patch(`/v2/reservations/${id}/status`, dto, {
          headers: { 'Content-Type': 'application/json' },
        });
        console.log('Update reservation full response:', response);
        const { data } = response;
        console.log('Update reservation data:', data);
        
        // Handle different response formats
        if (data.data) {
          return data.data;
        } else if (data) {
          return data;
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Update reservation API error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast.success('Reservation status updated!');
    },
    onError: (error: unknown) => {
      console.error('Update reservation error:', error);
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
      toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to update reservation.'));
    },
  });
};


// // --- Update starting odometer and fuel provided for a reserved vehicle ---
// export const useReservationOdometerFuel = () => {
//   const queryClient = useQueryClient();
//   return useMutation<
//     unknown,
//     Error,
//     { reservedVehicleId: string; dto: { starting_odometer: number; fuel_provided: number } }
//   >({
//     mutationFn: async ({ reservedVehicleId, dto }) => {
//       try {
//         const response = await api.post(`/v2/reservations/${reservedVehicleId}/odometer-fuel`, dto, {
//           headers: { 'Content-Type': 'application/json' },
//         });
//         if (!response.data) throw new Error('No data');
//         toast.success('Odometer and fuel updated!');
//         return response.data;
//       } catch (error: unknown) {
//         if (typeof error === 'object' && error !== null && 'response' in error) {
//           // @ts-expect-error error.response is not typed on unknown, but is present on Axios errors
//           toast.error(error.response?.data?.message || (error as Error).message || 'Failed to update odometer/fuel');
//         } else {
//           toast.error((error as Error).message || 'Failed to update odometer/fuel');
//         }
//         throw error;
//       }
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['reservations'] });
//     },
//   });
// };
// export const useVehicleReservationAssignment = () => {
//   const queryClient = useQueryClient();
//   return useMutation<Reservation, Error, { id: string; dto: AssignVehicleDto }>({
//     mutationFn: async ({ id, dto }) => {
//       console.log('Assigning vehicle to reservation:', { id, dto });
//       try {
//         const response = await api.post(`/v2/reservations/${id}/assign-vehicle`, dto, {
//           headers: { 'Content-Type': 'application/json' },
//         });
//         console.log('Assign vehicle full response:', response);
//         const { data } = response;
//         console.log('Assign vehicle data:', data);
        
//         // Handle different response formats
//         if (data.data) {
//           return data.data;
//         } else if (data) {
//           return data;
//         } else {
//           throw new Error('Invalid response format');
//         }
//       } catch (error) {
//         console.error('Assign vehicle API error:', error);
//         throw error;
//       }
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['reservations'] });
//       toast.success('Vehicle assigned to reservation!');
//     },
//     onError: (error: unknown) => {
//       let apiMsg: string | undefined;
//       if (
//         typeof error === 'object' &&
//         error !== null &&
//         'response' in error &&
//         error.response &&
//         typeof error.response === 'object' &&
//         'data' in error.response &&
//         error.response.data &&
//         typeof error.response.data === 'object' &&
//         'message' in error.response.data
//       ) {
//         apiMsg = (error.response.data as { message?: string }).message;
//       }
//       toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to assign vehicle.'));
//     },
//   });
// };

// ---------------------------------------------------------

export const useReservationVehicleOdometerAssignation = () => {
  const queryClient = useQueryClient();
  return useMutation<Reservation, Error, { id: string; dto: { vehicle_id: string; starting_odometer: number; fuel_provided: number } }>({
    mutationFn: async ({ id, dto }) => {
      const { data } = await api.post<{ message: string; data: Reservation }>(`/v2/reservations/${id}/assign-vehicle-odometer`, dto);
      if (!data.data) throw new Error('No data');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['my-reservations'] });
      toast.success('Vehicle assigned and odometer/fuel set successfully!');
    },
    onError: (error: unknown) => {
      let apiMsg: string | undefined;
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        (error as { response?: { data?: { message?: string } } }).response?.data?.message
      ) {
        apiMsg = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      }
      toast.error(apiMsg || 'Failed to assign vehicle and set odometer/fuel');
    },
  });
};


export const useUpdateReservationReason = () => {
  const queryClient = useQueryClient();
  return useMutation<Reservation, Error, { id: string; reason: string }>({
    mutationFn: async ({ id, reason }) => {
      const { data } = await api.patch<{ message: string; data: Reservation }>(`/v2/reservations/${id}/reason`, { reason });
      if (!data.data) throw new Error('No data');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast.success('Reservation reason updated successfully!');
    },
    onError: (error: unknown) => {
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
export const useStartReservation = () => {
  const queryClient = useQueryClient();
  return useMutation<Reservation, Error, { reservedVehicleId: string; dto: StartReservationDto }>({
    mutationFn: async ({ reservedVehicleId, dto }) => {
      console.log('Starting reservation for reserved vehicle:', { reservedVehicleId, dto });
      try {
        const response = await api.post(`/v2/reservations/${reservedVehicleId}/start`, dto, {
          headers: { 'Content-Type': 'application/json' },
        });
        console.log('Start reservation full response:', response);
        const { data } = response;
        console.log('Start reservation data:', data);
        // Handle different response formats
        if (data.data) {
          return data.data;
        } else if (data) {
          return data;
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Start reservation API error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast.success('Reservation started!');
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
      toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to start reservation.'));
    },
  });
};

export const useCompleteReservation = () => {
  const queryClient = useQueryClient();
  return useMutation<Reservation, Error, { reservedVehicleId: string; dto: CompleteReservationDto }>({
    mutationFn: async ({ reservedVehicleId, dto }) => {
      console.log('Completing reservation:', { reservedVehicleId, dto });
      try {
        const formData = new FormData();
        formData.append('returned_odometer', dto.returned_odometer.toString());
        
        const response = await api.post(`/v2/reservations/${reservedVehicleId}/complete`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        console.log('Complete reservation full response:', response);
        const { data } = response;
        console.log('Complete reservation data:', data);
        
        // Handle different response formats
        if (data.data) {
          return data.data;
        } else if (data) {
          return data;
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Complete reservation API error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast.success('Reservation completed!');
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
      toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to complete reservation.'));
    },
  });
};

export const useDeleteReservation = () => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast.success('Reservation deleted successfully!');
    },
    onError: (error: unknown) => {
      console.error('Delete reservation error:', error);
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
      toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to delete reservation.'));
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
  return useMutation<VehicleIssue, Error, CreateVehicleIssueDto>({
    mutationFn: async (vehicleIssue) => {
      const { data } = await api.post<ApiResponse<VehicleIssue>>('/v2/issues', vehicleIssue);
      if (!data.data) throw new Error('No data');
      return data.data;
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
  return useMutation<VehicleIssue, Error, { issueId: string; updates: UpdateVehicleIssueDto }>({
    mutationFn: async ({ issueId, updates }) => {
      const { data } = await api.put<ApiResponse<VehicleIssue>>(`/v2/issues/${issueId}`, updates);
      if (!data.data) throw new Error('No data');
      return data.data;
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from './api';
import { 
  LoginCredentials, 
  LoginResponse,
  PositionAuthRequest,
  PositionAuthResponse,
  ApiResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UpdatePasswordRequest,
  PaginatedOrganizations,
  Organization,
  CreateUnitDto,
  Pagination,
  Unit,
  Position,
  UnitWithUsers,
  CreateUserDto,
  User,
  VehicleModel,
  CreateVehicleModelDto,
  Vehicle,
  CreateVehicleDto,
  UpdateVehicleDto,
  position_accesses,
} from '@/types/next-auth';
import { toast } from 'sonner';
// Define Unit type matching API response


// User authentication with JSON
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
        // Create FormData for forgot password
        const formData = new FormData();
        formData.append('email', request.email);

        const response = await api.post<ApiResponse>('/auth/forgot-password', formData, {
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

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (request: ResetPasswordRequest) => {
      try {
        // Create FormData for reset password
        const formData = new FormData();
        formData.append('email', request.email);
        formData.append('new_password', request.new_password);
        formData.append('reset_token', request.reset_token);

        const response = await api.post<ApiResponse>('/auth/reset-password', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        // Debug the response
        console.log('Reset password response:', response);

        if (!response.data) {
          throw new Error('No response received from server');
        }

        // Show success toast
        if (response.data.message) {
          toast.success(response.data.message);
        }

        return response.data;
      } catch (error: unknown) {
        console.error('Reset password request failed:', error);
        if (typeof error === 'object' && error !== null && 'response' in error && typeof error.response === 'object' && error.response !== null) {
          const axiosError = error as { response?: { data?: { message?: string } } };
          console.error('Error response:', axiosError.response?.data);
          const errorMessage = axiosError.response?.data?.message || 'Failed to reset password';
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
        toast.error('Failed to reset password');
        throw error;
      }
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: async (request: UpdatePasswordRequest) => {
      try {
        // TODO: Implement actual password update endpoint
        // For now, this is a placeholder that simulates the API call
        console.log('Password update request:', request);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate success response
        const mockResponse = {
          message: 'Password updated successfully',
          data: {
            success: true
          }
        };
        
        // Show success toast
        toast.success(mockResponse.message);
        
        return mockResponse;
      } catch (error: unknown) {
        console.error('Update password request failed:', error);
        if (typeof error === 'object' && error !== null && 'response' in error && typeof error.response === 'object' && error.response !== null) {
          const axiosError = error as { response?: { data?: { message?: string } } };
          console.error('Error response:', axiosError.response?.data);
          const errorMessage = axiosError.response?.data?.message || 'Failed to update password';
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
        toast.error('Failed to update password');
        throw error;
      }
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

// --- GET all users grouped by unit ---
export const useUsers = () => {
  return useQuery<UnitWithUsers[], Error>({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get<{ data: UnitWithUsers[] }>('/v2/users');
      if (!data.data) throw new Error('No data');
      return data.data;
    },
  });
};

// --- Create user ---
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, CreateUserDto>({
    mutationFn: async (user) => {
      const { data } = await api.post<{ data: User }>('/v2/users', user, {
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
      toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to create vehicle model.'));
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
      const { data } = await api.delete<{ data: { message: string } }>(`/v2/vehicle-models/${id}`);
      if (!data.data) throw new Error('No data');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-models'] });
      toast.success('Vehicle model deleted successfully!');
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
      toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to delete vehicle model.'));
    },
  });
};


// --- Get all vehicles ---
export const useVehicles = () => {
  return useQuery<Vehicle[], Error>({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data } = await api.get<{ data: Vehicle[] }>('/v2/vehicles');
      if (!data.data) throw new Error('No data');
      return data.data;
    },
  });
};

// --- Get a vehicle by ID ---
export const useVehicle = (id: string) => {
  return useQuery<Vehicle, Error>({
    queryKey: ['vehicle', id],
    queryFn: async () => {
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
  return useMutation<Vehicle, Error, CreateVehicleDto>({
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
  return useMutation<Vehicle, Error, { id: string; updates: UpdateVehicleDto }>({
    mutationFn: async ({ id, updates }) => {
      const { data } = await api.put<{ data: Vehicle }>(`/v2/vehicles/${id}`, updates, {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Vehicle deleted successfully!');
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




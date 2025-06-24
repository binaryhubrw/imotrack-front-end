import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from './api';
import { 
  LoginCredentials, 
  AuthResponse, 
  Organization, 
  User, 
  UserRole, 
  CreateOrganizationDto, 
  UpdateOrganizationDto,
  CreateUserDto,
  UpdateUserDto,
  UserDetails,
  CreateHrUserDto,
  UpdateHrUserDto,
  StaffRequestUpdate,
  StaffRequest,
  StaffRequestResponse,
  IssueCreateDto,
} from '@/types/next-auth';
import { jwtDecode } from 'jwt-decode';



// Login mutation
export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      try {
        const response = await api.post('/auth/login', credentials);
        
        // Debug the response
        console.log('Login response:', response);

        // Check if we have a response and data
        if (!response.data) {
          throw new Error('No response received from server');
        }

        // The backend returns just the token object
        const { token } = response.data;
        
        if (!token || typeof token !== 'string') {
          console.error('Invalid token received:', token);
          throw new Error('Invalid token received from server');
        }

        try {
          // Decode the JWT token to get user data
          const decodedToken = jwtDecode<{
            id: string;
            email: string;
            role: string;
            organization_id: string;
          }>(token);

          // Create the auth response with user data from token
          const authResponse: AuthResponse = {
            token: token,
            user: {
              id: decodedToken.id,
              email: decodedToken.email,
              role: decodedToken.role as UserRole,
              organization_id: decodedToken.organization_id,
            },
          };

          return authResponse;
        } catch (error) {
          console.error('Error decoding token:', error);
          console.error('Token that failed to decode:', token);
          throw new Error('Invalid token received from server');
        }
      } catch (error: unknown) {
        console.error('Login request failed:', error);
        if (typeof error === 'object' && error !== null && 'response' in error && typeof error.response === 'object' && error.response !== null) {
          const axiosError = error as { response?: { data?: { message?: string } } };
          console.error('Error response:', axiosError.response?.data);
          throw new Error(axiosError.response?.data?.message || 'Login failed');
        }
        throw error;
      }
    },
  });
};

// Organizations Query (All)
export const useOrganizations = () => {
  return useQuery<Organization[], Error>({
    queryKey: ['organizations'],
    queryFn: async () => {
      const { data } = await api.get<Organization[]>('/org');
      return data;
    },
  });
};

// Organization Details Query (Single)
export const useOrganizationDetails = (id: string) => {
  return useQuery<Organization, Error>({
    queryKey: ['organization', id],
    queryFn: async () => {
      const { data } = await api.get<Organization>(`/org/${id}`);
      return data;
    },
    enabled: !!id, // Only run query if id is available
  });
};

// Create Organization Mutation
export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation<Organization, Error, CreateOrganizationDto>({
    mutationFn: async (newOrg) => {
      const { data } = await api.post<Organization>('/org', newOrg);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};

// Update Organization Mutation
export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation<Organization, Error, { id: string; updates: UpdateOrganizationDto }>({
    mutationFn: async ({ id, updates }) => {
      const { data } = await api.put<Organization>(`/org/${id}`, updates);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organization', variables.id] });
    },
  });
};

// Delete Organization Mutation
export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/org/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};

// Users Query (All)
export const useUsers = () => {
  return useQuery<User[], Error>({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get<User[]>('/users');
      return data;
    },
  });
};

// User Details Query (Single)
export const useUserDetails = (id: string) => {
  return useQuery<UserDetails, Error>({
    queryKey: ['user', id],
    queryFn: async () => {
      const { data } = await api.get<UserDetails>(`/users/${id}`, {
        params: {
          include: ['organization', 'role']
        }
      });
      return data;
    },
    enabled: !!id, // Only run query if id is available
  });
};

// Create User Mutation
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, CreateUserDto>({
    mutationFn: async (newUser) => {
      const { data } = await api.post<User>('/users', newUser);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// Update User Mutation
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, { id: string; updates: UpdateUserDto }>({
    mutationFn: async ({ id, updates }) => {
      const { data } = await api.put<User>(`/users/${id}`, updates);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
    },
  });
};

// Delete User Mutation
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await api.get('/auth/roles');
      return response.data;
    },
  });
};

//HR CRUD____________________________________________________________________________ HR: Get roles
export const useHrRoles = () => {
  return useQuery({
    queryKey: ['hr-roles'],
    queryFn: async () => {
      const { data } = await api.get('/hr/roles');
      return data;
    },
  });
};

export const useHrUsers = () => {
  return useQuery({
    queryKey: ['hr-users'],
    queryFn: async () => {
      const { data } = await api.get('/hr/users');
      return data;
    },
  })
}

export const useHrUser = (id: string) => {
  return useQuery({
    queryKey: ['hr-user', id],
    queryFn: async () => {
      const { data } = await api.get(`/hr/users/${id}`);
      return data;
    },
    enabled: !!id, // Only run query if id is available
  })
}


// HR: Create user
export const useCreateHrUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userData: CreateHrUserDto) => {
      const { data } = await api.post('/hr/users', userData, {
        headers: { 'Content-Type': 'application/json' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-users'] });
    },
  });
};

export const useUpdateHrUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<UpdateHrUserDto> }) => {
      const { data } = await api.put(`/hr/users/${id}`, updates, {
        headers: { 'Content-Type': 'application/json' },
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hr-users'] });
      queryClient.invalidateQueries({ queryKey: ['hr-user', variables.id] });
    },
  });
}

export const useDeleteHrUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/hr/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-users'] });
    },
  });
}


//__________STAFF CRUD____________________________________________________________________________ HR: Get roles

export const useStaffRequests = () => {
  return useQuery<StaffRequestResponse[], Error>({
    queryKey: ['staff-requests'],
    queryFn: async () => {
      const { data } = await api.get<StaffRequestResponse[]>('/staff/requests');
      return data;
    },
  });
}

export const useStaffRequest = (id: string) => {
  return useQuery({
    queryKey: ['staff-request', id],
    queryFn: async () => {
      const { data } = await api.get(`/staff/requests/${id}`);
      return data;
    },
    enabled: !!id, // Only run query if id is available
  });
}

export const useGetAvailableVehicles =()=>{
  return useQuery({
    queryKey: ['available-vehicles'],
    queryFn: async () => {
      const { data } = await api.get('/staff/vehicles/available');
      return data;
    },
  });
}

export const useCreateStaffRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestData: StaffRequest) => {
      const { data } = await api.post('/staff/requests', requestData, {
        headers: { 'Content-Type': 'application/json' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-requests'] });
    },
  });
}

export const useUpdateStaffRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: StaffRequestUpdate }) => {
      const { data } = await api.put(`/staff/requests/${id}`, updates, {
        headers: { 'Content-Type': 'application/json' },
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staff-requests'] });
      queryClient.invalidateQueries({ queryKey: ['staff-request', variables.id] });
    },
  });
}

export const useCancelStaffRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/staff/requests/${id}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-requests'] });
    },
  });
}

//__________FLEET MANAGER CRUD____________________________________________________________________________ HR: Get roles

export const useFMVehiclesStatuses = () => {
  return useQuery({
    queryKey: ['fm-vehicles-statuses'],
    queryFn: async () => {
      const { data } = await api.get('/fleetmanager/vehicles/statuses');
      return data;
    },
  });
}

export const useFMVehicles = () => {
  return useQuery({
    queryKey: ['fm-vehicles'],
    queryFn: async ()=>{
      const { data } = await api.get('/fleetmanager/vehicles');    
      return data;
    }
  })  
}

export const useCreateFMVehicles = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vehicleData: unknown) => {
      const { data } = await api.post('/fleetmanager/vehicles', vehicleData, {
        headers: { 'Content-Type': 'application/json' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fm-vehicles'] });
    },
  });
}

export const useGetFMVehicle = (id: string) => {
  return useQuery({
    queryKey: ['fm-vehicle', id],
    queryFn: async () => {
      const { data } = await api.get(`/fleetmanager/vehicles/${id}`);
      return data;
    },
    enabled: !!id, // Only run query if id is available
  });
}

export const useUpdateFMVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: unknown }) => {
      const { data } = await api.put(`/fleetmanager/vehicles/${id}`, updates, {
        headers: { 'Content-Type': 'application/json' },
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fm-vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['fm-vehicle', variables.id] });
    },
  });
}

export const useDeleteFMVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/fleetmanager/vehicles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fm-vehicles'] });
    },
  });
}

// FMRequests
export const useFmRequests = () => {
  return useQuery<StaffRequestResponse[], Error>({
    queryKey: ['fm-requests'],
    queryFn: async () => {
      const { data } = await api.get<StaffRequestResponse[]>('/fleetmanager/requests');
      return data;
    },
  });
}

export const useFMApproveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ requestId, vehicleId }: { requestId: string; vehicleId: string }) => {
      const { data } = await api.post(`/fleetmanager/requests/approve`, { requestId, vehicleId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fm-requests'] });
    },
  });
}

export const useFMRejectRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ requestId, comment }: { requestId: string; comment?: string }) => {
      const { data } = await api.post(`/fleetmanager/requests/reject`, { requestId, comment });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fm-requests'] });
    },
  });
}

export const useIssues = () => {
  return useQuery({
    queryKey: ['issues'],
    queryFn: async () => {
      const { data } = await api.get('/issues/fleet');
      return data;
    },
  });
}

export const useCreateIssue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (issueData: IssueCreateDto) => {
      const { data } = await api.post('/issues/staff/report', issueData, {
        headers: { 'Content-Type': 'application/json' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });
}

// NOTIFICATIONS for staff

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/staff/notifications');
      return data;
    },
  });
}
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      await api.patch(`/staff/notifications/${notificationId}/mark`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.patch('/staff/notifications/mark-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      await api.delete(`/staff/notifications/${notificationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
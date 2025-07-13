import { useMutation } from '@tanstack/react-query';
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
} from '@/types/next-auth';
import { toast } from 'sonner';

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






// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import api from './api';
// import { 
//   LoginCredentials, 
//   AuthResponse, 
//   Organization, 
//   User, 
//   UserRole, 
//   CreateOrganizationDto, 
//   UpdateOrganizationDto,
//   CreateUserDto,
//   UpdateUserDto,
//   UserDetails,
//   CreateHrUserDto,
//   UpdateHrUserDto,
//   StaffRequestUpdate,
//   StaffRequest,
//   StaffRequestResponse,
//   IssueCreateDto,
//   UserProfile,
// } from '@/types/next-auth';
// import { jwtDecode } from 'jwt-decode';
// import { toast } from 'sonner';


// // User authentication
// export const useRoles = () => {
//   return useQuery({
//     queryKey: ['roles'],
//     queryFn: async () => {
//       const response = await api.get('/auth/roles');
//       return response.data;
//     },
//   });
// };

// export const useLogin = () => {
//   return useMutation({
//     mutationFn: async (credentials: LoginCredentials) => {
//       try {
//         const response = await api.post('/auth/login', credentials);
        
//         // Debug the response
//         console.log('Login response:', response);

//         // Check if we have a response and data
//         if (!response.data) {
//           throw new Error('No response received from server');
//         }

//         // The backend returns just the token object
//         const { token } = response.data;
        
//         if (!token || typeof token !== 'string') {
//           console.error('Invalid token received:', token);
//           throw new Error('Invalid token received from server');
//         }

//         try {
//           // Decode the JWT token to get user data
//           const decodedToken = jwtDecode<{
//             id: string;
//             email: string;
//             role: string;
//             organization_id: string;
//           }>(token);

//           // Create the auth response with user data from token
//           const authResponse: AuthResponse = {
//             token: token,
//             user: {
//               id: decodedToken.id,
//               email: decodedToken.email,
//               role: decodedToken.role as UserRole,
//               organization_id: decodedToken.organization_id,
//             },
//           };

//           return authResponse;
//         } catch (error) {
//           console.error('Error decoding token:', error);
//           console.error('Token that failed to decode:', token);
//           throw new Error('Invalid token received from server');
//         }
//       } catch (error: unknown) {
//         console.error('Login request failed:', error);
//         if (typeof error === 'object' && error !== null && 'response' in error && typeof error.response === 'object' && error.response !== null) {
//           const axiosError = error as { response?: { data?: { message?: string } } };
//           console.error('Error response:', axiosError.response?.data);
//           throw new Error(axiosError.response?.data?.message || 'Login failed');
//         }
//         throw error;
//       }
//     },
//   });
// };

// export const useMe = () => {
//   return useQuery<UserProfile, Error>({
//     queryKey: ['me'],
//     queryFn: async () => {
//       try {
//         const response = await api.get<UserProfile>('/auth/me');
//         return response.data;
//       } catch (error) {
//         console.error('Error fetching user data:', error);
//         throw new Error('Failed to fetch user data');
//       }
//     },
//   });
// };

// export const useUpdatePassword = () => {
//   return useMutation({
//     mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
//       try {
//         const response = await api.put('/auth/password', {
//           current_password: currentPassword,
//           new_password: newPassword,
//         });
//         return response.data;
//       } catch (error) {
//         console.error('Error updating password:', error);
//         throw new Error('Failed to update password');
//       }
//     }
//   });
// }

// // Organizations Query (All)
// export const useOrganizations = () => {
//   return useQuery<Organization[], Error>({
//     queryKey: ['organizations'],
//     queryFn: async () => {
//       const { data } = await api.get<Organization[]>('/org');
//       return data;
//     },
//   });
// };

// // Organization Details Query (Single)
// export const useOrganizationDetails = (id: string) => {
//   return useQuery<Organization, Error>({
//     queryKey: ['organization', id],
//     queryFn: async () => {
//       const { data } = await api.get<Organization>(`/org/${id}`);
//       return data;
//     },
//     enabled: !!id, // Only run query if id is available
//   });
// };

// // Create Organization Mutation
// export const useCreateOrganization = () => {
//   const queryClient = useQueryClient();
//   return useMutation<Organization, Error, CreateOrganizationDto>({
//     mutationFn: async (newOrg) => {
//       const { data } = await api.post<Organization>('/org', newOrg);
//       return data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['organizations'] });
//       toast.success('Organization created successfully!');
//     },
//     onError: (error: unknown) => {
//       let apiMsg: string | undefined;
//       if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
//         apiMsg = (error.response.data as { message?: string }).message;
//       }
//       toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to create organization.'));
//     },
//   });
// };

// // Update Organization Mutation
// export const useUpdateOrganization = () => {
//   const queryClient = useQueryClient();
//   return useMutation<Organization, Error, { id: string; updates: UpdateOrganizationDto }>({
//     mutationFn: async ({ id, updates }) => {
//       const { data } = await api.put<Organization>(`/org/${id}`, updates);
//       return data;
//     },
//     onSuccess: (_, variables) => {
//       queryClient.invalidateQueries({ queryKey: ['organizations'] });
//       queryClient.invalidateQueries({ queryKey: ['organization', variables.id] });
//       toast.success('Organization updated successfully!');
//     },
//     onError: (error: unknown) => {
//       let apiMsg: string | undefined;
//       if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
//         apiMsg = (error.response.data as { message?: string }).message;
//       }
//       toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to update organization.'));
//     },
//   });
// };

// // Delete Organization Mutation
// export const useDeleteOrganization = () => {
//   const queryClient = useQueryClient();
//   return useMutation<void, Error, string>({
//     mutationFn: async (id) => {
//       await api.delete(`/org/${id}`);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['organizations'] });
//       toast.success('Organization deleted successfully!');
//     },
//     onError: (error: unknown) => {
//       let apiMsg: string | undefined;
//       if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
//         apiMsg = (error.response.data as { message?: string }).message;
//       }
//       toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to delete organization.'));
//     },
//   });
// };


// // Users Query (All)
// export const useUsers = () => {
//   return useQuery<User[], Error>({
//     queryKey: ['users'],
//     queryFn: async () => {
//       const { data } = await api.get<User[]>('/users');
//       return data;
//     },
//   });
// };

// // User Details Query (Single)
// export const useUserDetails = (id: string) => {
//   return useQuery<UserDetails, Error>({
//     queryKey: ['user', id],
//     queryFn: async () => {
//       const { data } = await api.get<UserDetails>(`/users/${id}`, {
//         params: {
//           include: ['organization', 'role']
//         }
//       });
//       return data;
//     },
//     enabled: !!id, // Only run query if id is available
//   });
// };

// // Create User Mutation
// export const useCreateUser = () => {
//   const queryClient = useQueryClient();
//   return useMutation<User, Error, CreateUserDto>({
//     mutationFn: async (newUser) => {
//       const { data } = await api.post<User>('/users', newUser);
//       return data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['users'] });
//       toast.success('User created successfully!');
//     },
//     onError: (error: unknown) => {
//       let apiMsg: string | undefined;
//       if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
//         apiMsg = (error.response.data as { message?: string }).message;
//       }
//       toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to create user.'));
//     },
//   });
// };

// // Update User Mutation
// export const useUpdateUser = () => {
//   const queryClient = useQueryClient();
//   return useMutation<User, Error, { id: string; updates: UpdateUserDto }>({
//     mutationFn: async ({ id, updates }) => {
//       const { data } = await api.put<User>(`/users/${id}`, updates);
//       return data;
//     },
//     onSuccess: (_, variables) => {
//       queryClient.invalidateQueries({ queryKey: ['users'] });
//       queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
//       toast.success('User updated successfully!');
//     },
//     onError: (error: unknown) => {
//       let apiMsg: string | undefined;
//       if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
//         apiMsg = (error.response.data as { message?: string }).message;
//       }
//       toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to update user.'));
//     },
//   });
// };

// // Delete User Mutation
// export const useDeleteUser = () => {
//   const queryClient = useQueryClient();
//   return useMutation<void, Error, string>({
//     mutationFn: async (id) => {
//       await api.delete(`/users/${id}`);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['users'] });
//       toast.success('User deleted successfully!');
//     },
//     onError: (error: unknown) => {
//       let apiMsg: string | undefined;
//       if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
//         apiMsg = (error.response.data as { message?: string }).message;
//       }
//       toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to delete user.'));
//     },
//   });
// };


// //HR CRUD____________________________________________________________________________ HR: Get roles
// export const useHrRoles = () => {
//   return useQuery({
//     queryKey: ['hr-roles'],
//     queryFn: async () => {
//       const { data } = await api.get('/hr/roles');
//       return data;
//     },
//   });
// };

// export const useHrUsers = () => {
//   return useQuery({
//     queryKey: ['hr-users'],
//     queryFn: async () => {
//       const { data } = await api.get('/hr/users');
//       return data;
//     },
//   })
// }

// export const useHrUser = (id: string) => {
//   return useQuery({
//     queryKey: ['hr-user', id],
//     queryFn: async () => {
//       const { data } = await api.get(`/hr/users/${id}`);
//       return data;
//     },
//     enabled: !!id, // Only run query if id is available
//   })
// }


// // HR: Create user
// export const useCreateHrUser = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (userData: CreateHrUserDto) => {
//       const { data } = await api.post('/hr/users', userData, {
//         headers: { 'Content-Type': 'application/json' },
//       });
//       return data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['hr-users'] });
//       toast.success('HR user created successfully!');
//     },
//     onError: (error: unknown) => {
//       let apiMsg: string | undefined;
//       if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
//         apiMsg = (error.response.data as { message?: string }).message;
//       }
//       toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to create HR user.'));
//     },
//   });
// };

// export const useUpdateHrUser = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async ({ id, updates }: { id: string; updates: Partial<UpdateHrUserDto> }) => {
//       const { data } = await api.put(`/hr/users/${id}`, updates, {
//         headers: { 'Content-Type': 'application/json' },
//       });
//       return data;
//     },
//     onSuccess: (_, variables) => {
//       queryClient.invalidateQueries({ queryKey: ['hr-users'] });
//       queryClient.invalidateQueries({ queryKey: ['hr-user', variables.id] });
//       toast.success('HR user updated successfully!');
//     },
//     onError: (error: unknown) => {
//       let apiMsg: string | undefined;
//       if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
//         apiMsg = (error.response.data as { message?: string }).message;
//       }
//       toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to update HR user.'));
//     },
//   });
// }

// export const useDeleteHrUser = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (id: string) => {
//       await api.delete(`/hr/users/${id}`);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['hr-users'] });
//       toast.success('HR user deleted successfully!');
//     },
//     onError: (error: unknown) => {
//       let apiMsg: string | undefined;
//       if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
//         apiMsg = (error.response.data as { message?: string }).message;
//       }
//       toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to delete HR user.'));
//     },
//   });
// }


// //__________STAFF CRUD____________________________________________________________________________ HR: Get roles

// export const useStaffRequests = () => {
//   return useQuery<StaffRequestResponse[], Error>({
//     queryKey: ['staff-requests'],
//     queryFn: async () => {
//       const { data } = await api.get<StaffRequestResponse[]>('/staff/requests');
//       return data;
//     },
//   });
// }

// export const useStaffRequest = (id: string) => {
//   return useQuery({
//     queryKey: ['staff-request', id],
//     queryFn: async () => {
//       const { data } = await api.get(`/staff/requests/${id}`);
//       return data;
//     },
//     enabled: !!id, // Only run query if id is available
//   });
// }

// export const useGetAvailableVehicles =()=>{
//   return useQuery({
//     queryKey: ['available-vehicles'],
//     queryFn: async () => {
//       const { data } = await api.get('/staff/vehicles/available');
//       return data;
//     },
//   });
// }

// export const useCreateStaffRequest = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (requestData: StaffRequest) => {
//       const { data } = await api.post('/staff/requests', requestData, {
//         headers: { 'Content-Type': 'application/json' },
//       });
//       return data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['staff-requests'] });
//       toast.success('Request submitted successfully!');
//     },
//     onError: (error: unknown) => {
//       let apiMsg: string | undefined;
//       if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
//         apiMsg = (error.response.data as { message?: string }).message;
//       }
//       toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to submit request.'));
//     },
//   });
// }

// export const useUpdateStaffRequest = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async ({ id, updates }: { id: string; updates: StaffRequestUpdate }) => {
//       const { data } = await api.put(`/staff/requests/${id}`, updates, {
//         headers: { 'Content-Type': 'application/json' },
//       });
//       return data;
//     },
//     onSuccess: (_, variables) => {
//       queryClient.invalidateQueries({ queryKey: ['staff-requests'] });
//       queryClient.invalidateQueries({ queryKey: ['staff-request', variables.id] });
//       toast.success('Request updated successfully!');
//     },
//     onError: (error: unknown) => {
//       let apiMsg: string | undefined;
//       if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
//         apiMsg = (error.response.data as { message?: string }).message;
//       }
//       toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to update request.'));
//     },
//   });
// }

// export const useCancelStaffRequest = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (id: string) => {
//       await api.patch(`/staff/requests/${id}/cancel`);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['staff-requests'] });
//       toast.success('Request cancelled successfully!');
//     },
//     onError: (error: unknown) => {
//       let apiMsg: string | undefined;
//       if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
//         apiMsg = (error.response.data as { message?: string }).message;
//       }
//       toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to cancel request.'));
//     },
//   });
// }

// //__________FLEET MANAGER CRUD____________________________________________________________________________ HR: Get roles

// export const useFMVehiclesStatuses = () => {
//   return useQuery({
//     queryKey: ['fm-vehicles-statuses'],
//     queryFn: async () => {
//       const { data } = await api.get('/fleetmanager/vehicles/statuses');
//       return data;
//     },
//   });
// }

// export const useFMVehicles = () => {
//   return useQuery({
//     queryKey: ['fm-vehicles'],
//     queryFn: async ()=>{
//       const { data } = await api.get('/fleetmanager/vehicles');    
//       return data;
//     }
//   })  
// }

// export const useCreateFMVehicles = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (vehicleData: unknown) => {
//       const { data } = await api.post('/fleetmanager/vehicles', vehicleData, {
//         headers: { 'Content-Type': 'application/json' },
//       });
//       return data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['fm-vehicles'] });
//       toast.success('Vehicle added successfully!');
//     },
//     onError: (error: unknown) => {
//       let apiMsg: string | undefined;
//       if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
//         apiMsg = (error.response.data as { message?: string }).message;
//       }
//       toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to add vehicle.'));
//     },
//   });
// }

// export const useGetFMVehicle = (id: string) => {
//   return useQuery({
//     queryKey: ['fm-vehicle', id],
//     queryFn: async () => {
//       const { data } = await api.get(`/fleetmanager/vehicles/${id}`);
//       return data;
//     },
//     enabled: !!id, // Only run query if id is available
//   });
// }

// export const useUpdateFMVehicle = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async ({ id, updates }: { id: string; updates: unknown }) => {
//       const { data } = await api.put(`/fleetmanager/vehicles/${id}`, updates, {
//         headers: { 'Content-Type': 'application/json' },
//       });
//       return data;
//     },
//     onSuccess: (_, variables) => {
//       queryClient.invalidateQueries({ queryKey: ['fm-vehicles'] });
//       queryClient.invalidateQueries({ queryKey: ['fm-vehicle', variables.id] });
//       toast.success('Vehicle updated successfully!');
//     },
//     onError: (error: unknown) => {
//       let apiMsg: string | undefined;
//       if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
//         apiMsg = (error.response.data as { message?: string }).message;
//       }
//       toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to update vehicle.'));
//     },
//   });
// }

// export const useDeleteFMVehicle = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (id: string) => {
//       await api.delete(`/fleetmanager/vehicles/${id}`);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['fm-vehicles'] });
//       toast.success('Vehicle deleted successfully!');
//     },
//     onError: (error: unknown) => {
//       let apiMsg: string | undefined;
//       if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
//         apiMsg = (error.response.data as { message?: string }).message;
//       }
//       toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to delete vehicle.'));
//     },
//   });
// }

// // FMRequests
// export const useFmRequests = () => {
//   return useQuery<StaffRequestResponse[], Error>({
//     queryKey: ['fm-requests'],
//     queryFn: async () => {
//       const { data } = await api.get<StaffRequestResponse[]>('/fleetmanager/requests');
//       return data;
//     },
//   });
// }

// export const useFMApproveRequest = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async ({ requestId, vehicleId }: { requestId: string; vehicleId: string }) => {
//       const { data } = await api.post(`/fleetmanager/requests/approve`, { requestId, vehicleId });
//       return data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['fm-requests'] });
//       toast.success('Request approved successfully!');
//     },
//     onError: (error: unknown) => {
//       let apiMsg: string | undefined;
//       if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
//         apiMsg = (error.response.data as { message?: string }).message;
//       }
//       toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to approve request.'));
//     },
//   });
// }

// export const useFMRejectRequest = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async ({ requestId, comment }: { requestId: string; comment?: string }) => {
//       const { data } = await api.post(`/fleetmanager/requests/reject`, { requestId, comment });
//       return data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['fm-requests'] });
//       toast.success('Request rejected successfully!');
//     },
//     onError: (error: unknown) => {
//       let apiMsg: string | undefined;
//       if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
//         apiMsg = (error.response.data as { message?: string }).message;
//       }
//       toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to reject request.'));
//     },
//   });
// }

// export const useIssues = () => {
//   return useQuery({
//     queryKey: ['issues'],
//     queryFn: async () => {
//       const { data } = await api.get('/issues/fleet');
//       return data;
//     },
//   });
// }

// export const useMyIssues = () => {
//   return useQuery({
//     queryKey: ['my-issues'],
//     queryFn: async () => {
//       const { data } = await api.get('/issues/staff/mine');
//       return data;
//     },
//   });
// }

// export const useMyIssue = (id: string) => {
//   return useQuery({
//     queryKey: ['my-issue', id],
//     queryFn: async () => {
//       const { data } = await api.get(`/issues/staff/mine/${id}`);
//       return data;
//     },
//     enabled: !!id,
//   });
// }

// export const useCreateIssue = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (issueData: IssueCreateDto) => {
//       const { data } = await api.post('/issues/staff/report', issueData, {
//         headers: { 'Content-Type': 'application/json' },
//       });
//       return data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['issues'] });
//       toast.success('Issue reported successfully!');
//     },
//     onError: (error: unknown) => {
//       let apiMsg: string | undefined;
//       if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
//         apiMsg = (error.response.data as { message?: string }).message;
//       }
//       toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to report issue.'));
//     },
//   });
// }

// // NOTIFICATIONS for staff

// export const useNotifications = () => {
//   return useQuery({
//     queryKey: ['notifications'],
//     queryFn: async () => {
//       const { data } = await api.get('/staff/notifications');
//       return data;
//     },
//   });
// }
// export const useMarkNotificationAsRead = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (notificationId: string) => {
//       await api.patch(`/staff/notifications/${notificationId}/mark`);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['notifications'] });
//       toast.success('Notification marked as read!');
//     },
//     onError: (error: unknown) => {
//       let apiMsg: string | undefined;
//       if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
//         apiMsg = (error.response.data as { message?: string }).message;
//       }
//       toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to mark notification as read.'));
//     },
//   });
// };

// export const useMarkAllNotificationsAsRead = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async () => {
//       await api.patch('/staff/notifications/mark-all');
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['notifications'] });
//       toast.success('All notifications marked as read!');
//     },
//     onError: (error: unknown) => {
//       let apiMsg: string | undefined;
//       if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
//         apiMsg = (error.response.data as { message?: string }).message;
//       }
//       toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to mark all notifications as read.'));
//     },
//   });
// }
// export const useDeleteNotification = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (notificationId: string) => {
//       await api.delete(`/staff/notifications/${notificationId}`);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['notifications'] });
//       toast.success('Notification deleted successfully!');
//     },
//     onError: (error: unknown) => {
//       let apiMsg: string | undefined;
//       if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
//         apiMsg = (error.response.data as { message?: string }).message;
//       }
//       toast.error(apiMsg || (error instanceof Error ? error.message : 'Failed to delete notification.'));
//     },
//   });
// };

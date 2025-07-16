export interface position_accesses {
  organizations: {
    create: boolean;
    view: boolean;
    update: boolean;
    delete: boolean;
  };
  units: {
    create: boolean;
    view: boolean;
    update: boolean;
    delete: boolean;
  };
  positions: {
    create: boolean;
    view: boolean;
    update: boolean;
    delete: boolean;
  };
  users: {
    create: boolean;
    view: boolean;
    update: boolean;
    delete: boolean;
  };
  vehicleModels: {
    create: boolean;
    view: boolean;
    viewSingle: boolean;
    update: boolean;
    delete: boolean;
  };
  vehicles: {
    create: boolean;
    view: boolean;
    viewSingle: boolean;
    update: boolean;
    delete: boolean;
  }



  // issue:{
  //   create: boolean;
  //   view: boolean;
  //   update: boolean;
  //   delete: boolean;
  // };
  // notifications:{
  //   create: boolean;
  //   view: boolean;
  //   update: boolean;
  //   delete: boolean;
  // };
  // reservation:{
  //   create: boolean;
  //   view: boolean;
  //   update: boolean;
  //   delete: boolean;
  // };

}
export type Unit = {
  unit_id: string;
  unit_name: string;
  created_at: string;
  organization_id: string;
  status: string;
  positions: Array<{
    position_id: string;
    position_name: string;
    position_description: string;
    position_access: Record<string, unknown>;
    created_at: string;
    user_id: string;
    unit_id: string;
    position_status: string;
  }>;
};

  export interface Pagination{
  page: number;
  limit: number;
  total: number;
  pages: number;
};

// Generic API response type for all backend responses
export type ApiResponse<T = unknown> = {
  message: string;
  data?: T;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

// Type for the login response - returns array of position objects
export type LoginResponse = Array<{
  position_id: string;
  position_name: string;
  unit_id: string;
  unit_name: string;
  organisation_id: string;
  organization_name: string;
}>;

// Type for the authenticated user from login response
export type AuthenticatedUser = {
  positions: Array<{
    position_id: string;
    position_name: string;
    unit_id: string;
    unit_name: string;
    organisation_id: string;
    organization_name: string;
  }>; 
};

// Type for position authentication request
export type PositionAuthRequest = {
  email: string;
  password: string;
};

// Type for position authentication response - returns token and user data
export type PositionAuthResponse = {
  token: string;
  user: {
    user_id: string;
    first_name: string;
    last_name: string;
    user_nid: string;
    user_phone: string;
    created_at: string;
    user_dob: string;
    user_photo: string;
    user_gender: string;
    street_address: string;
    auth_id: string;
  };
  position: {
    position_id: string;
    position_name: string;
    position_description: string;
    position_access: position_access;
    created_at: string;
    user_id: string;
    unit_id: string;
    position_status: string;
  };
  organization: {
    organization_id: string;
    organization_name: string;
    street_address: string;
    organization_phone: string;
    organization_email: string;
    organization_logo: string;
    created_at: string;
    organization_customId: string;
    organization_status: string;
  };
  unit: {
    unit_id: string;
    unit_name: string;
    created_at: string;
    organization_id: string;
    status: string;
  };
};

// Type for the complete authenticated user with position data
export type AuthenticatedUserWithPosition = {
  user: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    avatar: string;
    nid: string;
    gender: string;
    dob: string;
  };
  position: {
    position_id: string;
    position_name: string;
    position_access: position_access;
  };
  organization: {
    organization_id: string;
    organization_name: string;
    organization_email: string;
    organization_url: string;
    organization_address: string;
    organization_created_at: string;
  };
  unit: {
    unit_id: string;
    unit_name: string;
  };
};

export type AuthResponse = {
  token: string;
  user: AuthenticatedUser;
};



// Forgot password request type
export type ForgotPasswordRequest = {
  email: string;
};

// Reset password request type
export type ResetPasswordRequest = {
  email: string;
  new_password: string;
  reset_token: string;
};

// Update password request type
export type UpdatePasswordRequest = {
  current_password: string;
  new_password: string;
};

// Organization Types (NEW API)
export type OrganizationStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

export type Organization = {
  organization_id: string;
  organization_name: string;
  street_address: string;
  organization_phone: string;
  organization_email: string;
  organization_logo: string;
  created_at: string;
  organization_customId: string;
  organization_status: OrganizationStatus;
};

export type CreateOrganizationDto = {
  organization_name: string;
  organization_email: string;
  organization_phone: string;
  organization_logo: string; // URL or file (for now string)
  street_address: string;
};

export type PaginatedOrganizations = {
  organizations: Organization[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

// Unit Types (NEW API)
export type Unit = {
  unit_id: string;
  unit_name: string;
  unit_status: string;
  organization_id: string;
  positions: Array<{
    position_id: string;
    position_title: string;
    position_status: string;
    user_id: string;
  }>;
};

export type CreateUnitDto = {
  unit_name: string;
  organization_id: string;
};

// User Types
export type UserStatus = 'active' | 'inactive' | 'suspended';

// For users list response (GET /api/users)
export type UserListItem = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  orgName: string;
  role: string;
  roleId: string;
  dob: string;
  phone: string | null;
  status: UserStatus;
};
// --- Position Types ---
export type Position = {
  position_id: string;
  position_name: string;
  position_description?: string;
  position_status: string;
  position_access?: Record<string, any>;
  created_at?: string;
  user_id?: string;
  unit_id?: string;
  user?: {
    user_id: string;
    first_name: string;
    last_name: string;
  };
};

export type CreatePositionDto = {
  position_name: string;
  position_description: string;
  unit_id: string;
  position_access: Record<string, any>;
};
// // For single user response (GET /api/users/:id)
// export type UserDetails = {
//   id: string;
//   organization_id: string;
//   email: string;
//   phone: string | null;
//   status: UserStatus;
//   created_at: string;
//   role_id: string;
//   role: string;
//   dob: string;
//   first_name: string;
//   last_name: string;
//   nid: string;
//   gender: 'MALE' | 'FEMALE';
//   street_address: string;
// };

// // Combined type for frontend use
// export type User = UserListItem | UserDetails;

// // Helper type guard to check if user is UserDetails
// export function isUserDetails(user: User): user is UserDetails {
//   return 'first_name' in user;
// }

// // Helper type guard to check if user is UserListItem
// export function isUserListItem(user: User): user is UserListItem {
//   return 'firstName' in user;
// }

// export type CreateUserDto = {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   nid: string;
//   gender: 'Male' | 'Female';
//   dob: string;
//   role: string;
//   organizationId: string;
//   streetAddress: string;
// };

// export type UpdateUserDto = {
//   firstName?: string;
//   lastName?: string;
//   email?: string;
//   phone?: string;
//   password?: string;
//   role?: string;
//   status?: string;
//   streetAddress?: string;
// };

// // Role Types
// export type Role = {
//   id: string;
//   name: string;
//   description?: string;
//   users?: User[];
//   role_permissions?: RolePermission[];
// };

// export type CreateRoleDto = {
//   name: string;
//   description?: string;
// };

// export type UpdateRoleDto = Partial<CreateRoleDto>;

// // Permission Types
// export type Permission = {
//   id: string;
//   name: string;
//   description?: string;
//   role_permissions?: RolePermission[];
// };

// export type CreatePermissionDto = {
//   name: string;
//   description?: string;
// };

// export type UpdatePermissionDto = Partial<CreatePermissionDto>;

// // RolePermission Types
// export type RolePermission = {
//   id: string;
//   role_id: string;
//   permission_id: string;
//   role?: Role;
//   permission?: Permission;
// };

// export type CreateRolePermissionDto = {
//   role_id: string;
//   permission_id: string;
// };

// // Session Types
// export type Session = {
//   id: string;
//   user_id: string;
//   token: string;
//   created_at: Date;
//   expires_at: Date;
//   is_active: boolean;
//   user?: User;
// };

// export type CreateSessionDto = {
//   user_id: string;
//   token: string;
//   expires_at: Date;
// };

// // Define the user profile type based on the API response
// export type UserProfile ={
//   id: string;
//   first_name: string;
//   last_name: string;
//   nid: string;
//   email: string;
//   phone: string;
//   gender: 'MALE' | 'FEMALE';
//   dob: string;
//   role: string;
//   organization: {
//     id: string;
//     name: string;
//   };
//   status: string;
//   street_address: string;
//   created_at: string;
//   last_login: string;
// }

// export type UpdateSessionDto = {
//   is_active?: boolean;
//   expires_at?: Date;
// };

// // Vehicle Types
// export type VehicleStatus = 'available' | 'in_use' | 'maintenance' | 'retired';

// export type Vehicle = {
//   [x: string]: string;
//   type: string;
//   id: string;
//   plate_number: string;
//   model: string;
//   manufacturer: string;
//   year: number;
//   capacity?: number;
//   odometer: number;
//   status: VehicleStatus;
//   fuel_type?: string;
//   last_service_date?: Date;
//   created_at: Date;
//   organization_name: string;
//   trips?: Trip[];
//   requests?: Request[];
// };

// export type CreateVehicleDto = {
//   plate_number: string;
//   model: string;
//   manufacturer: string;
//   year: number;
//   capacity?: number;
//   odometer?: number;
//   status?: VehicleStatus;
//   fuel_type?: string;
//   last_service_date?: Date;
//   organization_id: string;
// };

// export type UpdateVehicleDto = Partial<Omit<CreateVehicleDto, 'plate_number'>>;

// // Request Types
// export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'completed';

// export type Request = {
//   id: string;
//   vehicle_id?: string;
//   requested_at: Date;
//   trip_purpose: string;
//   start_location: string;
//   end_location: string;
//   start_date: Date;
//   end_date: Date;
//   status: RequestStatus;
//   reviewed_at?: Date;
//   comments?: string;
//   requester_id: string;
//   reviewed_by?: string;
//   vehicle?: Vehicle;
//   requester?: User;
//   reviewer?: User;
//   trips?: Trip[];
// };

// export type CreateRequestDto = {
//   vehicle_id?: string;
//   trip_purpose: string;
//   start_location: string;
//   end_location: string;
//   start_date: Date;
//   end_date: Date;
//   comments?: string;
//   requester_id: string;
// };

// export type UpdateRequestDto = {
//   vehicle_id?: string;
//   trip_purpose?: string;
//   start_location?: string;
//   end_location?: string;
//   start_date?: Date;
//   end_date?: Date;
//   status?: RequestStatus;
//   reviewed_at?: Date;
//   comments?: string;
//   reviewed_by?: string;
// };

// // Trip Types
// export type Trip = {
//   id: string;
//   request_id?: string;
//   vehicle_id: string;
//   start_odometer: number;
//   end_odometer?: number;
//   start_time: Date;
//   end_time?: Date;
//   fuel_used?: number;
//   trip_notes?: string;
//   created_at: Date;
//   driver_id: string;
//   request?: Request;
//   vehicle?: Vehicle;
//   driver?: User;
// };

// export type CreateTripDto = {
//   request_id?: string;
//   vehicle_id: string;
//   start_odometer: number;
//   start_time: Date;
//   driver_id: string;
// };

// export type UpdateTripDto = {
//   end_odometer?: number;
//   end_time?: Date;
//   fuel_used?: number;
//   trip_notes?: string;
// };

// // Report Types
// export type ReportType = 'fuel_consumption' | 'vehicle_usage' | 'driver_performance' | 'maintenance';

// export type Report = {
//   id: string;
//   generated_by: string;
//   organization_id: string;
//   report_type: string;
//   generated_at: Date;
//   file_url?: string;
//   description?: string;
//   generator?: User;
//   organization?: Organization;
// };

// export type CreateReportDto = {
//   generated_by: string;
//   organization_id: string;
//   report_type: string;
//   file_url?: string;
//   description?: string;
// };

// export type UpdateReportDto = {
//   file_url?: string;
//   description?: string;
// };

// // API Response Types
// export type ApiResponse<T> = {
//   success: boolean;
//   data?: T;
//   error?: string;
//   message?: string;
// };

// export type PaginatedResponse<T> = {
//   items: T[];
//   total: number;
//   page: number;
//   limit: number;
//   totalPages: number;
// };

// export type PaginationParams = {
//   page?: number;
//   limit?: number;
//   sort?: string;
//   order?: 'asc' | 'desc';
// };

// // Auth Types
// export type UserRole = 'admin' | 'hr' | 'staff' | 'fleetmanager';

// export type ChangePasswordDto = {
//   current_password: string;
//   new_password: string;
// };

// // Filter Types
// export type VehicleFilterParams = PaginationParams & {
//   status?: VehicleStatus;
//   manufacturer?: string;
//   year?: number;
//   fuel_type?: string;
// };

// export type TripFilterParams = PaginationParams & {
//   start_date?: Date;
//   end_date?: Date;
//   driver_id?: string;
//   vehicle_id?: string;
// };

// export type RequestFilterParams = PaginationParams & {
//   status?: RequestStatus;
//   requester_id?: string;
//   start_date?: Date;
//   end_date?: Date;
// };

// export type ReportFilterParams = PaginationParams & {
//   report_type?: string;
//   start_date?: Date;
//   end_date?: Date;
// };

// // HR user creation payload type
// export interface CreateHrUserDto {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   nid: string;
//   gender: 'MALE' | 'FEMALE';
//   dob: string;
//   streetAddress: string;
//   roleId: string;
// }

// // HR user creation payload type
// export interface UpdateHrUserDto {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   nid: string;
//   gender: 'MALE' | 'FEMALE';
//   dob: string;
//   streetAddress: string;
//   roleId: string;
// }

// // Types based on your API responses
// interface HrUser {
//   id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   nid: string;
//   gender: "MALE" | "FEMALE";
//   dob: string;
//   streetAddress: string;
//   role: string;
//   organizationName: string;
//   status: string;
// }
// // Add a type for StatCard props
// interface StatCardProps {
//   icon: React.ElementType;
//   title: string;
//   value: string;
//   bgColor: string;
//   textColor: string;
// }

// export interface HrRole {
//   id: string;
//   name: string;
//   description: string;
// }

// interface CreateHRUserData {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   nid: string;
//   gender: "MALE" | "FEMALE";
//   dob: string;
//   streetAddress: string;
//   roleId: string;
//   organizationName: string;
// }

// interface CreateStaffUserDto {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   nid: string;
//   gender: "MALE" | "FEMALE";
//   dob: string;
//   streetAddress: string;
//   organizationName: string;

// }

// export interface StaffRequest {
//   trip_purpose: string;
//   start_location: string;
//   end_location: string;
//   start_date: string;
//   end_date: string;
//   full_name: string;
//   passengers_number: number;
//   comments?: string;
// }

// export interface StaffRequestUpdate {
//   trip_purpose?: string;
//   passengers_number?: number;
//   comments?: string;
// }

// // Staff request status as per backend
// export type StaffRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'ACTIVE';

// // API response for GET /staff/requests
// export interface StaffRequestResponse {
//   id: string;
//   vehicle_id: string | null;
//   requested_at: string;
//   trip_purpose: string;
//   start_location: string;
//   end_location: string;
//   start_date: string;
//   end_date: string;
//   status: StaffRequestStatus;
//   reviewed_at?: string | null;
//   comments?: string | null;
//   requester_id: string;
//   reviewed_by?: string | null;
//   full_name: string;
//   passengers_number: number;
//   vehicle?: {
//     id: string;
//     plate_number: string;
//     vehicle_type: string;
//     vehicle_model: string;
//     manufacturer: string;
//     year: number;
//     capacity: number;
//     status: string;
//   } | null;
//   requester?: {
//     id: string;
//     first_name: string;
//     last_name: string;
//     email: string;
//   } | null;
// }
// export interface RequestApprove{
//   requestId: string;
//   vehicleId: string;
// }

// export interface RequestReject {
//   requestId: string;
//   comment?: string;
// }

// export interface IssueDto {
//   vehicle_model: string;
//   plate_number: string;
//   date: string; // ISO date string
//   requester_full_name: string;
//   trip_purpose: string;
//   description: string;
//   type: 'Emergency' | 'Maintenance'; // or any other types you have
// }
// export interface IssueCreateDto {
//   request_id: string;
//   description: string;
//   emergency?: boolean;
// }

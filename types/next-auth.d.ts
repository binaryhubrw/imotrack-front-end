// Organization Types
export type Organization = {
  id: string;
  name: string;
  customId: string;
  address: string;
  phone: string;
  status: string;
  email: string;
  created_at: Date;
  users?: User[];
  vehicles?: Vehicle[];
  reports?: Report[];
};

export type CreateOrganizationDto = {
  name: string;
  address: string;
  phone: string;
  email: string;
};

export type UpdateOrganizationDto = Partial<CreateOrganizationDto>;

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

// For single user response (GET /api/users/:id)
export type UserDetails = {
  id: string;
  organization_id: string;
  email: string;
  phone: string | null;
  status: UserStatus;
  created_at: string;
  role_id: string;
  dob: string;
  first_name: string;
  last_name: string;
  nid: string;
  gender: 'MALE' | 'FEMALE';
  street_address: string;
};

// Combined type for frontend use
export type User = UserListItem | UserDetails;

// Helper type guard to check if user is UserDetails
export function isUserDetails(user: User): user is UserDetails {
  return 'first_name' in user;
}

// Helper type guard to check if user is UserListItem
export function isUserListItem(user: User): user is UserListItem {
  return 'firstName' in user;
}

export type CreateUserDto = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nid: string;
  gender: 'Male' | 'Female';
  dob: string;
  role: string;
  organizationId: string;
  streetAddress: string;
};

export type UpdateUserDto = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: string;
  status?: string;
  streetAddress?: string;
};

// Role Types
export type Role = {
  id: string;
  name: string;
  description?: string;
  users?: User[];
  role_permissions?: RolePermission[];
};

export type CreateRoleDto = {
  name: string;
  description?: string;
};

export type UpdateRoleDto = Partial<CreateRoleDto>;

// Permission Types
export type Permission = {
  id: string;
  name: string;
  description?: string;
  role_permissions?: RolePermission[];
};

export type CreatePermissionDto = {
  name: string;
  description?: string;
};

export type UpdatePermissionDto = Partial<CreatePermissionDto>;

// RolePermission Types
export type RolePermission = {
  id: string;
  role_id: string;
  permission_id: string;
  role?: Role;
  permission?: Permission;
};

export type CreateRolePermissionDto = {
  role_id: string;
  permission_id: string;
};

// Session Types
export type Session = {
  id: string;
  user_id: string;
  token: string;
  created_at: Date;
  expires_at: Date;
  is_active: boolean;
  user?: User;
};

export type CreateSessionDto = {
  user_id: string;
  token: string;
  expires_at: Date;
};

export type UpdateSessionDto = {
  is_active?: boolean;
  expires_at?: Date;
};

// Vehicle Types
export type VehicleStatus = 'available' | 'in_use' | 'maintenance' | 'retired';

export type Vehicle = {
  id: string;
  plate_number: string;
  model: string;
  manufacturer: string;
  year: number;
  capacity?: number;
  odometer: number;
  status: VehicleStatus;
  fuel_type?: string;
  last_service_date?: Date;
  created_at: Date;
  organization_name: string;
  trips?: Trip[];
  requests?: Request[];
};

export type CreateVehicleDto = {
  plate_number: string;
  model: string;
  manufacturer: string;
  year: number;
  capacity?: number;
  odometer?: number;
  status?: VehicleStatus;
  fuel_type?: string;
  last_service_date?: Date;
  organization_id: string;
};

export type UpdateVehicleDto = Partial<Omit<CreateVehicleDto, 'plate_number'>>;

// Request Types
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export type Request = {
  id: string;
  vehicle_id?: string;
  requested_at: Date;
  trip_purpose: string;
  start_location: string;
  end_location: string;
  start_date: Date;
  end_date: Date;
  status: RequestStatus;
  reviewed_at?: Date;
  comments?: string;
  requester_id: string;
  reviewed_by?: string;
  vehicle?: Vehicle;
  requester?: User;
  reviewer?: User;
  trips?: Trip[];
};

export type CreateRequestDto = {
  vehicle_id?: string;
  trip_purpose: string;
  start_location: string;
  end_location: string;
  start_date: Date;
  end_date: Date;
  comments?: string;
  requester_id: string;
};

export type UpdateRequestDto = {
  vehicle_id?: string;
  trip_purpose?: string;
  start_location?: string;
  end_location?: string;
  start_date?: Date;
  end_date?: Date;
  status?: RequestStatus;
  reviewed_at?: Date;
  comments?: string;
  reviewed_by?: string;
};

// Trip Types
export type Trip = {
  id: string;
  request_id?: string;
  vehicle_id: string;
  start_odometer: number;
  end_odometer?: number;
  start_time: Date;
  end_time?: Date;
  fuel_used?: number;
  trip_notes?: string;
  created_at: Date;
  driver_id: string;
  request?: Request;
  vehicle?: Vehicle;
  driver?: User;
};

export type CreateTripDto = {
  request_id?: string;
  vehicle_id: string;
  start_odometer: number;
  start_time: Date;
  driver_id: string;
};

export type UpdateTripDto = {
  end_odometer?: number;
  end_time?: Date;
  fuel_used?: number;
  trip_notes?: string;
};

// Report Types
export type ReportType = 'fuel_consumption' | 'vehicle_usage' | 'driver_performance' | 'maintenance';

export type Report = {
  id: string;
  generated_by: string;
  organization_id: string;
  report_type: string;
  generated_at: Date;
  file_url?: string;
  description?: string;
  generator?: User;
  organization?: Organization;
};

export type CreateReportDto = {
  generated_by: string;
  organization_id: string;
  report_type: string;
  file_url?: string;
  description?: string;
};

export type UpdateReportDto = {
  file_url?: string;
  description?: string;
};

// API Response Types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PaginationParams = {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
};

// Auth Types
export type UserRole = 'admin' | 'hr' | 'staff' | 'fleetmanager';

export type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    organization_id: string;
  };
};

export type ChangePasswordDto = {
  current_password: string;
  new_password: string;
};

// Filter Types
export type VehicleFilterParams = PaginationParams & {
  status?: VehicleStatus;
  manufacturer?: string;
  year?: number;
  fuel_type?: string;
};

export type TripFilterParams = PaginationParams & {
  start_date?: Date;
  end_date?: Date;
  driver_id?: string;
  vehicle_id?: string;
};

export type RequestFilterParams = PaginationParams & {
  status?: RequestStatus;
  requester_id?: string;
  start_date?: Date;
  end_date?: Date;
};

export type ReportFilterParams = PaginationParams & {
  report_type?: string;
  start_date?: Date;
  end_date?: Date;
};

// HR user creation payload type
export interface CreateHrUserDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nid: string;
  gender: 'MALE' | 'FEMALE';
  dob: string;
  streetAddress: string;
  roleId: string;
}

// HR user creation payload type
export interface UpdateHrUserDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nid: string;
  gender: 'MALE' | 'FEMALE';
  dob: string;
  streetAddress: string;
  roleId: string;
}

// Types based on your API responses
interface HrUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nid: string;
  gender: "MALE" | "FEMALE";
  dob: string;
  streetAddress: string;
  role: string;
  organizationName: string;
  status: string;
}
// Add a type for StatCard props
interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  bgColor: string;
  textColor: string;
}



export interface HrRole {
  id: string;
  name: string;
  description: string;
}

interface CreateHRUserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nid: string;
  gender: "MALE" | "FEMALE";
  dob: string;
  streetAddress: string;
  roleId: string;
  organizationName: string;
}
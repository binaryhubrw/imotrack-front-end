import { Request } from 'express';

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
  };
  reservations: {
    create: boolean;
    view: boolean;
    update: boolean;
    delete: boolean;
  };
}

export interface AuthenticatedUser {
  user_id: string;
  email: string;
  organization_id: string;
  position_id: string;
  position_access?: PositionAccess;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
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
    position_access: position_accesses;
    created_at: string;
    user_id: string | null; 
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
  position_access?: position_access;
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
  position_access: position_accesses;
};



// --- User Types for new API ---
export interface User {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  user_gender: string;
  user_phone: string;
  position_id: string;
  position_name: string;
}

export interface UnitWithUsers {
  unit_id: string;
  unit_name: string;
  users: User[];
}

export interface CreateUserDto {
  first_name: string;
  last_name: string;
  user_nid: string;
  user_phone: string;
  user_gender: string;
  user_dob: string;
  street_address: string;
  position_id: string;
  email: string;
}



export enum VehicleType {
  AMBULANCE = "AMBULANCE",
  SEDAN = "SEDAN",
  SUV = "SUV",
  TRUCK = "TRUCK",
  VAN = "VAN",
  MOTORCYCLE = "MOTORCYCLE",
  BUS = "BUS",
  OTHER = "OTHER"
}

export enum VehicleStatus {
  AVAILABLE = "AVAILABLE",
  OCCUPIED = "OCCUPIED",
  MAINTENANCE = "MAINTENANCE",
  OUT_OF_SERVICE = "OUT_OF_SERVICE"
}

export enum TransmissionMode {
  MANUAL = "MANUAL",
  AUTOMATIC = "AUTOMATIC",
  SEMI_AUTOMATIC = "SEMI_AUTOMATIC"
}




// --- Vehicle Model Types ---
export type VehicleModel = {
  vehicle_model_id: string;
  vehicle_model_name: string;
  vehicle_type: string;
  manufacturer_name: string;
  created_at: string;
};

export type CreateVehicleModelDto = {
  vehicle_model_name: string;
  vehicle_type: VehicleType;
  manufacturer_name: string;
};




// --- Vehicle Types ---
export type Vehicle = {
  vehicle_id: string;
  plate_number: string;
  vehicle_type: string;
  transmission_mode: string;
  vehicle_model_id: string;
  vehicle_photo: string;
  vehicle_year: number;
  vehicle_capacity: number;
  vehicle_status: string;
  energy_type: string;
  last_service_date: string;
  created_at: string;
  organization_id: string;
  // Add nested objects for backend compatibility
  vehicle_model?: {
    vehicle_model_id: string;
    vehicle_model_name: string;
    vehicle_type: string;
    manufacturer_name: string;
    created_at: string;
  };
  organization?: {
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
};

export type CreateVehicleDto = {
  plate_number: string;
  vehicle_type: string;
  transmission_mode: string;
  vehicle_model_id: string;
  vehicle_photo?: File | null;
  vehicle_year: number;
  vehicle_capacity: number;
  energy_type: string;
  organization_id: string;
};

export type UpdateVehicleDto = {
  plate_number?: string;
  vehicle_type?: string;
  transmission_mode?: string;
  vehicle_model_id?: string;
  vehicle_photo?: string; // URL or base64 string (not file)
  vehicle_year?: number;
  vehicle_capacity?: number;
  vehicle_status?: string;
  energy_type?: string;
  organization_id?: string;
};

// --- Reservation Types ---
export type ReservationStatus =
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'IN_PROGRESS'
  | 'COMPLETED';

export interface ReservationUser {
  user_id: string;
  first_name: string;
  last_name: string;
  user_nid: string;
  user_phone: string;
  created_at: string;
  user_dob: string;
  user_photo: string | null;
  user_gender: string;
  street_address: string;
  auth_id: string;
}

export interface ReservedVehicle {
  reserved_vehicle_id: string;
  vehicle_id: string;
  reservation_id: string;
  starting_odometer?: number;
  fuel_provided?: number;
  returned_odometer?: number;
  started_at?: string;
  completed_at?: string;
}

export interface Reservation {
  reservation_id: string;
  created_at: string;
  reservation_purpose: string;
  start_location: string;
  reservation_destination: string;
  departure_date: string;
  expected_returning_date: string;
  reservation_status: ReservationStatus;
  reviewed_at: string | null;
  rejection_comment: string | null;
  user_id: string;
  user: ReservationUser;
  reserved_vehicles: ReservedVehicle[];
}

export interface CreateReservationDto {
  reservation_purpose: string;
  start_location: string;
  reservation_destination: string;
  departure_date: string;
  expected_returning_date: string;
}

export interface CancelReservationDto {
  reason: string;
}

export interface UpdateReservationStatusDto {
  status: ReservationStatus;
  reason?: string;
}

export interface AssignVehicleDto {
  vehicle_id: string;
}

export interface StartReservationDto {
  starting_odometer: number;
  fuel_provided: number;
}

export interface CompleteReservationDto {
  returned_odometer: number;
}



import { z } from 'zod';
// Common validation schemas
export const phoneRegex = /^(\+?25078|078|079|072|073)\d{7}$/;
export const nidRegex = /^\d{16}$/;
export const plateNumberRegex = /^[A-Z]{3}\s?\d{3}[A-Z]$/;

// Enums validation
export const genderEnum = z.enum(['MALE', 'FEMALE'], {
  errorMap: () => ({ message: 'Gender must be either MALE or FEMALE' })
});

export const vehicleStatusEnum = z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'OUT_OF_SERVICE'], {
  errorMap: () => ({ message: 'Invalid vehicle status' })
});

export const requestStatusEnum = z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'], {
  errorMap: () => ({ message: 'Invalid request status' })
});

// Organization validation schemas
export const createOrganizationSchema = z.object({
  name: z.string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name cannot exceed 100 characters')
    .trim(),
  address: z.string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address cannot exceed 200 characters')
    .trim(),
  phone: z.string()
    .regex(phoneRegex, 'Please enter a valid Rwandan phone number (e.g., +25078XXXXXXX or 078XXXXXXX)'),
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim()
});

export const updateOrganizationSchema = createOrganizationSchema.partial();

// User validation schemas
export const createUserSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces')
    .trim(),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces')
    .trim(),
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  phone: z.string()
    .regex(phoneRegex, 'Please enter a valid Rwandan phone number'),
  nid: z.string()
    .regex(nidRegex, 'National ID must be exactly 16 digits')
    .length(16, 'National ID must be exactly 16 digits'),
  gender: genderEnum,
  dob: z.string()
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 18 && age <= 100;
    }, 'User must be between 18 and 100 years old')
    .refine((date) => !isNaN(Date.parse(date)), 'Please enter a valid date'),
  role: z.string()
    .min(1, 'Please select a role'),
  organizationId: z.string()
    .uuid('Invalid organization ID'),
  streetAddress: z.string()
    .min(5, 'Street address must be at least 5 characters')
    .max(200, 'Street address cannot exceed 200 characters')
    .trim()
});

export const updateUserSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces')
    .trim()
    .optional(),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces')
    .trim()
    .optional(),
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim()
    .optional(),
  phone: z.string()
    .regex(phoneRegex, 'Please enter a valid Rwandan phone number')
    .optional(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
    .optional(),
  role: z.string()
    .min(1, 'Please select a role')
    .optional(),
  status: z.enum(['active', 'inactive', 'suspended'], {
    errorMap: () => ({ message: 'Status must be active, inactive, or suspended' })
  }).optional(),
  streetAddress: z.string()
    .min(5, 'Street address must be at least 5 characters')
    .max(200, 'Street address cannot exceed 200 characters')
    .trim()
    .optional()
});

// HR User schemas
export const createHrUserSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces')
    .trim(),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces')
    .trim(),
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  phone: z.string()
    .regex(phoneRegex, 'Please enter a valid Rwandan phone number'),
  nid: z.string()
    .regex(nidRegex, 'National ID must be exactly 16 digits'),
  gender: genderEnum,
  dob: z.string()
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 18 && age <= 100;
    }, 'User must be between 18 and 100 years old'),
  streetAddress: z.string()
    .min(5, 'Street address must be at least 5 characters')
    .max(200, 'Street address cannot exceed 200 characters')
    .trim(),
  roleId: z.string()
    .uuid('Invalid role ID')
});

export const updateHrUserSchema = createHrUserSchema.partial();

// Staff User schemas
export const createStaffUserSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces')
    .trim(),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces')
    .trim(),
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  phone: z.string()
    .regex(phoneRegex, 'Please enter a valid Rwandan phone number'),
  nid: z.string()
    .regex(nidRegex, 'National ID must be exactly 16 digits'),
  gender: genderEnum,
  dob: z.string()
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 18 && age <= 100;
    }, 'User must be between 18 and 100 years old'),
  streetAddress: z.string()
    .min(5, 'Street address must be at least 5 characters')
    .max(200, 'Street address cannot exceed 200 characters')
    .trim(),
  organizationName: z.string()
    .min(2, 'Organization name must be at least 2 characters')
    .trim()
});

// Role validation schemas
export const createRoleSchema = z.object({
  name: z.string()
    .min(2, 'Role name must be at least 2 characters')
    .max(50, 'Role name cannot exceed 50 characters')
    .trim(),
  description: z.string()
    .max(200, 'Description cannot exceed 200 characters')
    .trim()
    .optional()
});

export const updateRoleSchema = createRoleSchema.partial();

// Permission validation schemas
export const createPermissionSchema = z.object({
  name: z.string()
    .min(2, 'Permission name must be at least 2 characters')
    .max(50, 'Permission name cannot exceed 50 characters')
    .trim(),
  description: z.string()
    .max(200, 'Description cannot exceed 200 characters')
    .trim()
    .optional()
});

export const updatePermissionSchema = createPermissionSchema.partial();

// Vehicle validation schemas
export const createVehicleSchema = z.object({
  plate_number: z.string()
    .regex(plateNumberRegex, 'Please enter a valid Rwandan plate number (e.g., RAA 123A)')
    .toUpperCase()
    .trim(),
  vehicle_type: z.string()
    .min(2, 'Vehicle type must be at least 2 characters')
    .max(50, 'Vehicle type cannot exceed 50 characters')
    .trim(),
  vehicle_model: z.string()
    .min(2, 'Vehicle model must be at least 2 characters')
    .max(50, 'Vehicle model cannot exceed 50 characters')
    .trim(),
  manufacturer: z.string()
    .min(2, 'Manufacturer must be at least 2 characters')
    .max(50, 'Manufacturer cannot exceed 50 characters')
    .trim()
    .optional(),
  year: z.number()
    .min(1990, 'Vehicle year must be 1990 or later')
    .max(new Date().getFullYear() + 1, 'Vehicle year cannot be in the future')
    .optional(),
  capacity: z.number()
    .min(1, 'Capacity must be at least 1')
    .max(50, 'Capacity cannot exceed 50')
    .optional(),
  odometer: z.number()
    .min(0, 'Odometer cannot be negative')
    .default(0)
    .optional(),
  status: vehicleStatusEnum.default('AVAILABLE').optional(),
  fuel_type: z.string()
    .min(2, 'Fuel type must be at least 2 characters')
    .max(20, 'Fuel type cannot exceed 20 characters')
    .trim()
    .optional(),
  last_service_date: z.string()
    .refine((date) => !isNaN(Date.parse(date)), 'Please enter a valid service date')
    .optional(),
  organization_id: z.string()
    .uuid('Invalid organization ID')
});

export const updateVehicleSchema = createVehicleSchema.omit({ plate_number: true }).partial();

// Request validation schemas
export const createRequestSchema = z.object({
  vehicle_id: z.string()
    .uuid('Invalid vehicle ID')
    .optional(),
  trip_purpose: z.string()
    .min(5, 'Trip purpose must be at least 5 characters')
    .max(200, 'Trip purpose cannot exceed 200 characters')
    .trim(),
  start_location: z.string()
    .min(3, 'Start location must be at least 3 characters')
    .max(100, 'Start location cannot exceed 100 characters')
    .trim(),
  end_location: z.string()
    .min(3, 'End location must be at least 3 characters')
    .max(100, 'End location cannot exceed 100 characters')
    .trim(),
  start_date: z.string()
    .refine((date) => {
      const startDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return startDate >= today;
    }, 'Start date cannot be in the past'),
  end_date: z.string()
    .refine((date) => !isNaN(Date.parse(date)), 'Please enter a valid end date'),
  comments: z.string()
    .max(500, 'Comments cannot exceed 500 characters')
    .trim()
    .optional(),
  requester_id: z.string()
    .uuid('Invalid requester ID')
}).refine((data) => {
  const startDate = new Date(data.start_date);
  const endDate = new Date(data.end_date);
  return endDate >= startDate;
}, {
  message: 'End date must be after start date',
  path: ['end_date']
});

// Staff Request validation schemas
export const staffRequestSchema = z.object({
  trip_purpose: z.string()
    .min(5, 'Trip purpose must be at least 5 characters')
    .max(200, 'Trip purpose cannot exceed 200 characters')
    .trim(),
  start_location: z.string()
    .min(3, 'Start location must be at least 3 characters')
    .max(100, 'Start location cannot exceed 100 characters')
    .trim(),
  end_location: z.string()
    .min(3, 'End location must be at least 3 characters')
    .max(100, 'End location cannot exceed 100 characters')
    .trim(),
  start_date: z.string()
    .refine((date) => {
      const startDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return startDate >= today;
    }, 'Start date cannot be in the past'),
  end_date: z.string()
    .refine((date) => !isNaN(Date.parse(date)), 'Please enter a valid end date'),
  full_name: z.string()
    .min(3, 'Full name must be at least 3 characters')
    .max(100, 'Full name cannot exceed 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces')
    .trim(),
  passengers_number: z.number()
    .min(1, 'Number of passengers must be at least 1')
    .max(50, 'Number of passengers cannot exceed 50'),
  comments: z.string()
    .max(500, 'Comments cannot exceed 500 characters')
    .trim()
    .optional()
}).refine((data) => {
  const startDate = new Date(data.start_date);
  const endDate = new Date(data.end_date);
  return endDate >= startDate;
}, {
  message: 'End date must be after start date',
  path: ['end_date']
});

export const staffRequestUpdateSchema = z.object({
  trip_purpose: z.string()
    .min(5, 'Trip purpose must be at least 5 characters')
    .max(200, 'Trip purpose cannot exceed 200 characters')
    .trim()
    .optional(),
  passengers_number: z.string()
    .transform((val) => parseInt(val))
    .refine((num) => num >= 1 && num <= 50, 'Number of passengers must be between 1 and 50')
    .optional(),
  comments: z.string()
    .max(500, 'Comments cannot exceed 500 characters')
    .trim()
    .optional()
});

export const updateRequestSchema = z.object({
  vehicle_id: z.string()
    .uuid('Invalid vehicle ID')
    .optional(),
  trip_purpose: z.string()
    .min(5, 'Trip purpose must be at least 5 characters')
    .max(200, 'Trip purpose cannot exceed 200 characters')
    .trim()
    .optional(),
  start_location: z.string()
    .min(3, 'Start location must be at least 3 characters')
    .max(100, 'Start location cannot exceed 100 characters')
    .trim()
    .optional(),
  end_location: z.string()
    .min(3, 'End location must be at least 3 characters')
    .max(100, 'End location cannot exceed 100 characters')
    .trim()
    .optional(),
  start_date: z.string()
    .refine((date) => !isNaN(Date.parse(date)), 'Please enter a valid start date')
    .optional(),
  end_date: z.string()
    .refine((date) => !isNaN(Date.parse(date)), 'Please enter a valid end date')
    .optional(),
  status: requestStatusEnum.optional(),
  reviewed_at: z.string()
    .refine((date) => !isNaN(Date.parse(date)), 'Please enter a valid review date')
    .optional(),
  comments: z.string()
    .max(500, 'Comments cannot exceed 500 characters')
    .trim()
    .optional(),
  reviewed_by: z.string()
    .uuid('Invalid reviewer ID')
    .optional()
});

// Request approval/rejection schemas
export const requestApproveSchema = z.object({
  requestId: z.string()
    .uuid('Invalid request ID'),
  vehicleId: z.string()
    .uuid('Invalid vehicle ID')
});

export const requestRejectSchema = z.object({
  requestId: z.string()
    .uuid('Invalid request ID'),
  comment: z.string()
    .min(10, 'Rejection reason must be at least 10 characters')
    .max(500, 'Rejection reason cannot exceed 500 characters')
    .trim()
    .optional()
});

// Trip validation schemas
export const createTripSchema = z.object({
  request_id: z.string()
    .uuid('Invalid request ID')
    .optional(),
  vehicle_id: z.string()
    .uuid('Invalid vehicle ID'),
  start_odometer: z.number()
    .min(0, 'Start odometer cannot be negative'),
  start_time: z.string()
    .refine((date) => !isNaN(Date.parse(date)), 'Please enter a valid start time'),
  driver_id: z.string()
    .uuid('Invalid driver ID')
});

export const updateTripSchema = z.object({
  end_odometer: z.number()
    .min(0, 'End odometer cannot be negative')
    .optional(),
  end_time: z.string()
    .refine((date) => !isNaN(Date.parse(date)), 'Please enter a valid end time')
    .optional(),
  fuel_used: z.number()
    .min(0, 'Fuel used cannot be negative')
    .optional(),
  trip_notes: z.string()
    .max(500, 'Trip notes cannot exceed 500 characters')
    .trim()
    .optional()
}).refine((data) => {
  if (data.end_odometer !== undefined && data.end_time === undefined) {
    return false;
  }
  return true;
}, {
  message: 'End time is required when end odometer is provided',
  path: ['end_time']
});

// Report validation schemas
export const createReportSchema = z.object({
  generated_by: z.string()
    .uuid('Invalid generator ID'),
  organization_id: z.string()
    .uuid('Invalid organization ID'),
  report_type: z.enum(['fuel_consumption', 'vehicle_usage', 'driver_performance', 'maintenance'], {
    errorMap: () => ({ message: 'Invalid report type' })
  }),
  file_url: z.string()
    .url('Please enter a valid file URL')
    .optional(),
  description: z.string()
    .max(500, 'Description cannot exceed 500 characters')
    .trim()
    .optional()
});

export const updateReportSchema = z.object({
  file_url: z.string()
    .url('Please enter a valid file URL')
    .optional(),
  description: z.string()
    .max(500, 'Description cannot exceed 500 characters')
    .trim()
    .optional()
});

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, 'Password is required')
});

export const changePasswordSchema = z.object({
  current_password: z.string()
    .min(1, 'Current password is required'),
  new_password: z.string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
});

// Pagination validation schema
export const paginationSchema = z.object({
  page: z.number()
    .min(1, 'Page must be at least 1')
    .default(1)
    .optional(),
  limit: z.number()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(10)
    .optional(),
  sort: z.string()
    .trim()
    .optional(),
  order: z.enum(['asc', 'desc'], {
    errorMap: () => ({ message: 'Order must be either asc or desc' })
  }).default('desc').optional()
});

// Filter validation schemas
export const vehicleFilterSchema = paginationSchema.extend({
  status: vehicleStatusEnum.optional(),
  manufacturer: z.string().trim().optional(),
  year: z.number().min(1990).max(new Date().getFullYear() + 1).optional(),
  fuel_type: z.string().trim().optional()
});

export const requestFilterSchema = paginationSchema.extend({
  status: requestStatusEnum.optional(),
  requester_id: z.string().uuid().optional(),
  start_date: z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
  end_date: z.string().refine((date) => !isNaN(Date.parse(date))).optional()
});

export const tripFilterSchema = paginationSchema.extend({
  start_date: z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
  end_date: z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
  driver_id: z.string().uuid().optional(),
  vehicle_id: z.string().uuid().optional()
});

export const reportFilterSchema = paginationSchema.extend({
  report_type: z.string().trim().optional(),
  start_date: z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
  end_date: z.string().refine((date) => !isNaN(Date.parse(date))).optional()
});

// Utility functions for validation
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; errors?: string[] } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => err.message);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
};

// Success and error messages for toasts
export const TOAST_MESSAGES = {
  // Organization messages
  ORGANIZATION_CREATED: 'Organization created successfully',
  ORGANIZATION_UPDATED: 'Organization updated successfully',
  ORGANIZATION_DELETED: 'Organization deleted successfully',
  ORGANIZATION_CREATE_ERROR: 'Failed to create organization',
  ORGANIZATION_UPDATE_ERROR: 'Failed to update organization',
  ORGANIZATION_DELETE_ERROR: 'Failed to delete organization',
  ORGANIZATION_NOT_FOUND: 'Organization not found',

  // User messages
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  USER_CREATE_ERROR: 'Failed to create user',
  USER_UPDATE_ERROR: 'Failed to update user',
  USER_DELETE_ERROR: 'Failed to delete user',
  USER_NOT_FOUND: 'User not found',
  USER_EMAIL_EXISTS: 'Email already exists',
  USER_NID_EXISTS: 'National ID already exists',

  // HR User messages
  HR_USER_CREATED: 'HR user created successfully',
  HR_USER_UPDATED: 'HR user updated successfully',
  HR_USER_DELETED: 'HR user deleted successfully',
  HR_USER_CREATE_ERROR: 'Failed to create HR user',
  HR_USER_UPDATE_ERROR: 'Failed to update HR user',
  HR_USER_DELETE_ERROR: 'Failed to delete HR user',

  // Staff User messages
  STAFF_USER_CREATED: 'Staff user created successfully',
  STAFF_USER_UPDATED: 'Staff user updated successfully',
  STAFF_USER_DELETED: 'Staff user deleted successfully',
  STAFF_USER_CREATE_ERROR: 'Failed to create staff user',
  STAFF_USER_UPDATE_ERROR: 'Failed to update staff user',
  STAFF_USER_DELETE_ERROR: 'Failed to delete staff user',

  // Role messages
  ROLE_CREATED: 'Role created successfully',
  ROLE_UPDATED: 'Role updated successfully',
  ROLE_DELETED: 'Role deleted successfully',
  ROLE_CREATE_ERROR: 'Failed to create role',
  ROLE_UPDATE_ERROR: 'Failed to update role',
  ROLE_DELETE_ERROR: 'Failed to delete role',
  ROLE_NOT_FOUND: 'Role not found',
  ROLE_NAME_EXISTS: 'Role name already exists',

  // Permission messages
  PERMISSION_CREATED: 'Permission created successfully',
  PERMISSION_UPDATED: 'Permission updated successfully',
  PERMISSION_DELETED: 'Permission deleted successfully',
  PERMISSION_CREATE_ERROR: 'Failed to create permission',
  PERMISSION_UPDATE_ERROR: 'Failed to update permission',
  PERMISSION_DELETE_ERROR: 'Failed to delete permission',
  PERMISSION_NOT_FOUND: 'Permission not found',

  // Vehicle messages
  VEHICLE_CREATED: 'Vehicle created successfully',
  VEHICLE_UPDATED: 'Vehicle updated successfully',
  VEHICLE_DELETED: 'Vehicle deleted successfully',
  VEHICLE_CREATE_ERROR: 'Failed to create vehicle',
  VEHICLE_UPDATE_ERROR: 'Failed to update vehicle',
  VEHICLE_DELETE_ERROR: 'Failed to delete vehicle',
  VEHICLE_NOT_FOUND: 'Vehicle not found',
  VEHICLE_PLATE_EXISTS: 'Plate number already exists',

  // Request messages
  REQUEST_CREATED: 'Request submitted successfully',
  REQUEST_UPDATED: 'Request updated successfully',
  REQUEST_DELETED: 'Request deleted successfully',
  REQUEST_APPROVED: 'Request approved successfully',
  REQUEST_REJECTED: 'Request rejected successfully',
  REQUEST_CREATE_ERROR: 'Failed to submit request',
  REQUEST_UPDATE_ERROR: 'Failed to update request',
  REQUEST_DELETE_ERROR: 'Failed to delete request',
  REQUEST_APPROVE_ERROR: 'Failed to approve request',
  REQUEST_REJECT_ERROR: 'Failed to reject request',
  REQUEST_NOT_FOUND: 'Request not found',

  // Trip messages
  TRIP_CREATED: 'Trip started successfully',
  TRIP_UPDATED: 'Trip updated successfully',
  TRIP_COMPLETED: 'Trip completed successfully',
  TRIP_DELETED: 'Trip deleted successfully',
  TRIP_CREATE_ERROR: 'Failed to start trip',
  TRIP_UPDATE_ERROR: 'Failed to update trip',
  TRIP_COMPLETE_ERROR: 'Failed to complete trip',
  TRIP_DELETE_ERROR: 'Failed to delete trip',
  TRIP_NOT_FOUND: 'Trip not found',

  // Report messages
  REPORT_CREATED: 'Report generated successfully',
  REPORT_UPDATED: 'Report updated successfully',
  REPORT_DELETED: 'Report deleted successfully',
  REPORT_CREATE_ERROR: 'Failed to generate report',
  REPORT_UPDATE_ERROR: 'Failed to update report',
  REPORT_DELETE_ERROR: 'Failed to delete report',
  REPORT_NOT_FOUND: 'Report not found',

  // Auth messages
  LOGIN_SUCCESS: 'Login successful',
  LOGIN_ERROR: 'Invalid email or password',
  LOGOUT_SUCCESS: 'Logged out successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  PASSWORD_CHANGE_ERROR: 'Failed to change password',
  INVALID_CREDENTIALS: 'Invalid credentials',
  SESSION_EXPIRED: 'Session expired. Please login again',
  UNAUTHORIZED: 'You are not authorized to perform this action',

  // General messages
  INVALID_DATA: 'Please check your input and try again',
  SERVER_ERROR: 'Something went wrong. Please try again later',
  NETWORK_ERROR: 'Network error. Please check your connection',
  FORBIDDEN: 'Access denied',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Please fix the errors and try again'
} as const;

// Export type for toast message keys
export type ToastMessageKey = keyof typeof TOAST_MESSAGES;

export const getToastMessage = (key: ToastMessageKey): string => {
  return TOAST_MESSAGES[key];
};
export const isValidPhoneNumber = (phone: string): boolean => {
  return phoneRegex.test(phone);
};
export const isValidNID = (nid: string): boolean => {
  return nidRegex.test(nid);
};
export const isValidPlateNumber = (plate: string): boolean => {
  return plateNumberRegex.test(plate);
};
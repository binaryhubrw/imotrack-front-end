import { z } from 'zod';

// ENUMS
export const UserStatusEnum = z.enum(['active', 'inactive', 'suspended']);
export const VehicleStatusEnum = z.enum(['available', 'in_use', 'maintenance', 'retired']);
export const RequestStatusEnum = z.enum(['pending', 'approved', 'rejected', 'completed']);
export const ReportTypeEnum = z.enum(['fuel_consumption', 'vehicle_usage', 'driver_performance', 'maintenance']);

// ORGANIZATION
export const CreateOrganizationDtoSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
});
export const UpdateOrganizationDtoSchema = CreateOrganizationDtoSchema.partial();

// USER
export const CreateUserDtoSchema = z.object({
  organization_id: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(6),
  email: z.string().email(),
  full_name: z.string().min(1),
  phone: z.string().optional(),
  role_id: z.string().min(1),
});
export const UpdateUserDtoSchema = CreateUserDtoSchema.omit({ password: true }).partial().extend({
  password: z.string().min(6).optional(),
  status: UserStatusEnum.optional(),
});

// ROLE
export const CreateRoleDtoSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});
export const UpdateRoleDtoSchema = CreateRoleDtoSchema.partial();

// PERMISSION
export const CreatePermissionDtoSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});
export const UpdatePermissionDtoSchema = CreatePermissionDtoSchema.partial();

// ROLE PERMISSION
export const CreateRolePermissionDtoSchema = z.object({
  role_id: z.string().min(1),
  permission_id: z.string().min(1),
});

// SESSION
export const CreateSessionDtoSchema = z.object({
  user_id: z.string().min(1),
  token: z.string().min(1),
  expires_at: z.coerce.date(),
});
export const UpdateSessionDtoSchema = z.object({
  is_active: z.boolean().optional(),
  expires_at: z.coerce.date().optional(),
});

// VEHICLE
export const CreateVehicleDtoSchema = z.object({
  plate_number: z.string().min(1),
  model: z.string().min(1),
  manufacturer: z.string().min(1),
  year: z.number().int(),
  capacity: z.number().optional(),
  odometer: z.number().optional(),
  status: VehicleStatusEnum.optional(),
  fuel_type: z.string().optional(),
  last_service_date: z.coerce.date().optional(),
  organization_id: z.string().min(1),
});
export const UpdateVehicleDtoSchema = CreateVehicleDtoSchema.omit({ plate_number: true }).partial();

// REQUEST
export const CreateRequestDtoSchema = z.object({
  vehicle_id: z.string().optional(),
  trip_purpose: z.string().min(1),
  start_location: z.string().min(1),
  end_location: z.string().min(1),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  comments: z.string().optional(),
  requester_id: z.string().min(1),
});
export const UpdateRequestDtoSchema = z.object({
  vehicle_id: z.string().optional(),
  trip_purpose: z.string().optional(),
  start_location: z.string().optional(),
  end_location: z.string().optional(),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
  status: RequestStatusEnum.optional(),
  reviewed_at: z.coerce.date().optional(),
  comments: z.string().optional(),
  reviewed_by: z.string().optional(),
});

// TRIP
export const CreateTripDtoSchema = z.object({
  request_id: z.string().optional(),
  vehicle_id: z.string().min(1),
  start_odometer: z.number(),
  start_time: z.coerce.date(),
  driver_id: z.string().min(1),
});
export const UpdateTripDtoSchema = z.object({
  end_odometer: z.number().optional(),
  end_time: z.coerce.date().optional(),
  fuel_used: z.number().optional(),
  trip_notes: z.string().optional(),
});

// REPORT
export const CreateReportDtoSchema = z.object({
  generated_by: z.string().min(1),
  organization_id: z.string().min(1),
  report_type: z.string().min(1), // or use ReportTypeEnum
  file_url: z.string().optional(),
  description: z.string().optional(),
});
export const UpdateReportDtoSchema = z.object({
  file_url: z.string().optional(),
  description: z.string().optional(),
});

// AUTH
export const LoginCredentialsSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(6),
});
export const ChangePasswordDtoSchema = z.object({
  current_password: z.string().min(6),
  new_password: z.string().min(6),
});

// PAGINATION & FILTERS
export const PaginationParamsSchema = z.object({
  page: z.number().int().optional(),
  limit: z.number().int().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export const VehicleFilterParamsSchema = PaginationParamsSchema.extend({
  status: VehicleStatusEnum.optional(),
  manufacturer: z.string().optional(),
  year: z.number().optional(),
  fuel_type: z.string().optional(),
});

export const TripFilterParamsSchema = PaginationParamsSchema.extend({
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
  driver_id: z.string().optional(),
  vehicle_id: z.string().optional(),
});

export const RequestFilterParamsSchema = PaginationParamsSchema.extend({
  status: RequestStatusEnum.optional(),
  requester_id: z.string().optional(),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
});

export const ReportFilterParamsSchema = PaginationParamsSchema.extend({
  report_type: z.string().optional(),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
});

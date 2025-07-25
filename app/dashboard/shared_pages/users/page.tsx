"use client";
import React, { useState, useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Plus,
  Edit,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  useUsers,
  useCreateUser,
  useUnitPositions,
  useOrganizations,
  useOrganizationUnitsByOrgId,
  useUser,
  useUpdateUser,
  useOrganizationUnits,
} from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

// Define the type for CreateUserDto
import type {
  CreateUserDto,
  PositionWithUnitOrg,
  UserWithPositions,
  UpdateUserDto,
  UserRow,
} from "@/types/next-auth";
import { SkeletonUsersTable } from "@/components/ui/skeleton";



function CreateUserModal({
  open,
  onClose,
  onCreate,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: CreateUserDto) => void;
  isLoading: boolean;
}) {
  const { user } = useAuth();
  const canViewOrganizations =
    !!user?.position?.position_access?.organizations?.view;
  const userOrganizationId = user?.organization?.organization_id;
  const userUnitId = user?.unit?.unit_id;
  // For normal users, get all units in their organization
  const { data: allUnitsInOrg = [] } = useOrganizationUnits();
  const userOrgUnits = useMemo(() => {
    if (!userOrganizationId) return [];
    return allUnitsInOrg.filter((unit) => unit.organization_id === userOrganizationId);
  }, [allUnitsInOrg, userOrganizationId]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>(
    canViewOrganizations ? "" : userOrganizationId || ""
  );
  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    canViewOrganizations ? "" : userUnitId || ""
  );
  const [selectedPositionId, setSelectedPositionId] = useState<string>("");

  // Fetch orgs/units/positions
  const { data: orgData, isLoading: orgsLoading } = useOrganizations(1, 100);
  const allOrganizations = orgData?.organizations || [];
  const { data: orgUnitsRaw, isLoading: unitsLoading } =
    useOrganizationUnitsByOrgId(selectedOrgId);
  const orgUnits = orgUnitsRaw || [];
  const { data: positions, isLoading: loadingPositions } =
    useUnitPositions(selectedUnitId);

  // Set default org/unit/position if only one
  React.useEffect(() => {
    if (
      canViewOrganizations &&
      allOrganizations.length === 1 &&
      !selectedOrgId
    ) {
      setSelectedOrgId(allOrganizations[0].organization_id);
    }
  }, [canViewOrganizations, allOrganizations, selectedOrgId]);

  React.useEffect(() => {
    if (canViewOrganizations && orgUnits.length === 1 && !selectedUnitId) {
      setSelectedUnitId(orgUnits[0].unit_id);
    } else if (!canViewOrganizations && userOrgUnits.length === 1 && !selectedUnitId) {
      setSelectedUnitId(userOrgUnits[0].unit_id);
    }
  }, [canViewOrganizations, orgUnits, userOrgUnits, selectedUnitId]);

  React.useEffect(() => {
    if (positions && positions.length === 1 && !selectedPositionId) {
      setSelectedPositionId(positions[0].position_id);
    }
  }, [positions, selectedPositionId]);

  // Form state
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    user_nid: "",
    user_phone: "",
    user_gender: "MALE",
    user_dob: "",
    street_address: "",
    position_id: "",
    email: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Sync form.position_id with selectedPositionId
  React.useEffect(() => {
    setForm((f) => ({ ...f, position_id: selectedPositionId }));
  }, [selectedPositionId]);

  // Validation (add org/unit/position required)
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.first_name.trim())
      newErrors.first_name = "First name is required";
    if (!form.last_name.trim()) newErrors.last_name = "Last name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Email is invalid";
    if (!form.user_nid.trim()) newErrors.user_nid = "National ID is required";
    if (!form.user_phone.trim()) newErrors.user_phone = "Phone is required";
    if (!form.user_dob) newErrors.user_dob = "Date of birth is required";
    if (!form.street_address.trim())
      newErrors.street_address = "Street address is required";
    if (!selectedOrgId) newErrors.organization_id = "Organization is required";
    if (!selectedUnitId) newErrors.unit_id = "Unit is required";
    if (!selectedPositionId) newErrors.position_id = "Position is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };
  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
  };
  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    // Include ALL required fields in touched state
    const allTouchedFields = {
      ...Object.keys(form).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
      organization_id: true,
      unit_id: true,
      position_id: true
    };
    setTouched(allTouchedFields);
    if (!validateForm()) {
      console.log('Validation failed:', errors); // Debug log
      return;
    }
    try {
      await onCreate({ ...form, position_id: selectedPositionId });
      setForm({
        first_name: "",
        last_name: "",
        user_nid: "",
        user_phone: "",
        user_gender: "MALE",
        user_dob: "",
        street_address: "",
        position_id: "",
        email: "",
      });
      setSelectedOrgId(
        canViewOrganizations ? "" : userOrganizationId || ""
      );
      setSelectedUnitId(
        canViewOrganizations ? "" : userUnitId || ""
      );
      setSelectedPositionId("");
      setErrors({});
      setTouched({});
    } catch (error) {
      console.error('Create user error:', error);
    }
  };
  const handleClose = () => {
    setForm({
      first_name: "",
      last_name: "",
      user_nid: "",
      user_phone: "",
      user_gender: "MALE",
      user_dob: "",
      street_address: "",
      position_id: "",
      email: "",
    });
    setSelectedOrgId(
      canViewOrganizations ? "" : userOrganizationId || ""
    );
    setSelectedUnitId(
      canViewOrganizations ? "" : userUnitId || ""
    );
    setSelectedPositionId("");
    setErrors({});
    setTouched({});
    onClose();
  };
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto relative animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 rounded-t-xl">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-[#0872b3] transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
            onClick={handleClose}
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-[#0872b3] pr-10">
            Create New User
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Fill in the details to create a new user account
          </p>
        </div>
        {/* Form Content */}
        <div className="p-6">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Organization/Unit/Position Dropdowns */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#0872b3] border-b border-[#0872b3]/20 pb-2">
                Assignment
              </h3>
              {canViewOrganizations && (
                <div>
                  <label className="block text-sm font-medium text-[#0872b3] mb-2">
                    Organization
                  </label>
                  <select
                    value={selectedOrgId}
                    onChange={(e) => {
                      setSelectedOrgId(e.target.value);
                      setSelectedUnitId("");
                      setSelectedPositionId("");
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#0872b3] focus:border-[#0872b3] transition-colors duration-200 bg-white"
                    disabled={orgsLoading || isLoading}
                  >
                    <option value="">Select organization</option>
                    {allOrganizations.map((org) => (
                      <option
                        key={org.organization_id}
                        value={org.organization_id}
                      >
                        {org.organization_name}
                      </option>
                    ))}
                  </select>
                  {errors.organization_id && touched.organization_id && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.organization_id}
                    </p>
                  )}
                </div>
              )}
              {!canViewOrganizations && (
                <div>
                  <label className="block text-sm font-medium text-[#0872b3] mb-2">
                    Organization
                  </label>
                  <input
                    type="text"
                    value={user?.organization?.organization_name || ""}
                    disabled
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[#0872b3] mb-2">
                  Unit
                </label>
                <select
                  value={selectedUnitId}
                  onChange={(e) => {
                    setSelectedUnitId(e.target.value);
                    setSelectedPositionId("");
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#0872b3] focus:border-[#0872b3] transition-colors duration-200 bg-white"
                  disabled={
                    isLoading ||
                    (canViewOrganizations
                      ? unitsLoading || !selectedOrgId || orgUnits.length === 0
                      : true)
                  }
                >
                  <option value="">Select unit</option>
                  {canViewOrganizations
                    ? orgUnits.map((unit) => (
                        <option key={unit.unit_id} value={unit.unit_id}>
                          {unit.unit_name}
                        </option>
                      ))
                    : userOrgUnits.map((unit) => (
                        <option key={unit.unit_id} value={unit.unit_id}>
                          {unit.unit_name}
                        </option>
                      ))}
                </select>
                {errors.unit_id && touched.unit_id && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.unit_id}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0872b3] mb-2">
                  Position
                </label>
                <select
                  value={selectedPositionId}
                  onChange={(e) => setSelectedPositionId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#0872b3] focus:border-[#0872b3] transition-colors duration-200 bg-white"
                  disabled={
                    loadingPositions ||
                    isLoading ||
                    !selectedUnitId ||
                    !positions ||
                    positions.length === 0
                  }
                >
                  <option value="">Select position</option>
                  {positions && positions.length > 0
                    ? positions.map((pos) => (
                        <option key={pos.position_id} value={pos.position_id}>
                          {pos.position_name}
                        </option>
                      ))
                    : !loadingPositions && (
                        <option value="">No positions available</option>
                      )}
                </select>
                {errors.position_id && touched.position_id && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.position_id}
                  </p>
                )}
              </div>
            </div>
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#0872b3] border-b border-[#0872b3]/20 pb-2">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#0872b3] mb-2">
                    First Name
                  </label>
                  <Input
                    name="first_name"
                    placeholder="Enter first name"
                    value={form.first_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3] transition-colors duration-200 ${
                      errors.first_name && touched.first_name
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                    disabled={isLoading}
                  />
                  {errors.first_name && touched.first_name && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.first_name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0872b3] mb-2">
                    Last Name
                  </label>
                  <Input
                    name="last_name"
                    placeholder="Enter last name"
                    value={form.last_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3] transition-colors duration-200 ${
                      errors.last_name && touched.last_name
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                    disabled={isLoading}
                  />
                  {errors.last_name && touched.last_name && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.last_name}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0872b3] mb-2">
                  Email Address
                </label>
                <Input
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3] transition-colors duration-200 ${
                    errors.email && touched.email
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  disabled={isLoading}
                />
                {errors.email && touched.email && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#0872b3] mb-2">
                    National ID
                  </label>
                  <Input
                    name="user_nid"
                    placeholder="Enter National ID"
                    value={form.user_nid}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3] transition-colors duration-200 ${
                      errors.user_nid && touched.user_nid
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                    disabled={isLoading}
                  />
                  {errors.user_nid && touched.user_nid && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.user_nid}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0872b3] mb-2">
                    Phone Number
                  </label>
                  <Input
                    name="user_phone"
                    placeholder="Enter phone number"
                    value={form.user_phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3] transition-colors duration-200 ${
                      errors.user_phone && touched.user_phone
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                    disabled={isLoading}
                  />
                  {errors.user_phone && touched.user_phone && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.user_phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#0872b3] mb-2">
                    Gender
                  </label>
                  <select
                    name="user_gender"
                    value={form.user_gender}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#0872b3] focus:border-[#0872b3] transition-colors duration-200 bg-white"
                    disabled={isLoading}
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0872b3] mb-2">
                    Date of Birth
                  </label>
                  <Input
                    name="user_dob"
                    type="date"
                    value={form.user_dob}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3] transition-colors duration-200 ${
                      errors.user_dob && touched.user_dob
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                    disabled={isLoading}
                  />
                  {errors.user_dob && touched.user_dob && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.user_dob}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Address & Position */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#0872b3] border-b border-[#0872b3]/20 pb-2">
                Address & Position
              </h3>

              <div>
                <label className="block text-sm font-medium text-[#0872b3] mb-2">
                  Street Address
                </label>
                <Input
                  name="street_address"
                  placeholder="Enter street address"
                  value={form.street_address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3] transition-colors duration-200 ${
                    errors.street_address && touched.street_address
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  disabled={isLoading}
                />
                {errors.street_address && touched.street_address && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.street_address}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0872b3] mb-2">
                  Position
                </label>
                <select
                  name="position_id"
                  value={form.position_id}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#0872b3] focus:border-[#0872b3] transition-colors duration-200 bg-white"
                  disabled={
                    isLoading ||
                    loadingPositions ||
                    !positions ||
                    positions.length === 0
                  }
                >
                  {loadingPositions && <option>Loading positions...</option>}
                  {positions && positions.length > 0
                    ? positions.map((pos) => (
                        <option key={pos.position_id} value={pos.position_id}>
                          {pos.position_name}
                        </option>
                      ))
                    : !loadingPositions && (
                        <option value="">No positions available</option>
                      )}
                </select>
                {errors.position_id && touched.position_id && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.position_id}
                  </p>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 rounded-b-xl">
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </Button>
            <Button
            type="submit"
              onClick={handleSubmit}
              disabled={
                isLoading ||
                loadingPositions ||
                !positions ||
                positions.length === 0
              }
              className="min-w-[120px] bg-[#0872b3] hover:bg-[#065a8f] text-white transition-colors duration-200"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </span>
              ) : (
                "Create User"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditUserModal({
  open,
  onClose,
  userId,
  onUpdated,
}: {
  open: boolean;
  onClose: () => void;
  userId: string | null;
  onUpdated: () => void;
}) {
  const { data: user, isLoading } = useUser(userId || "");
  const updateUser = useUpdateUser(userId || "");
  const [form, setForm] = useState<UpdateUserDto>({});
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (user && open) {
      setForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        user_nid: "",
        user_phone: user.user_phone || "",
        user_gender: user.user_gender || "",
        user_dob: user.user_dob || "",
        street_address: user.street_address || "",
      });
    }
  }, [user, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((f: UpdateUserDto) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateUser.mutateAsync(form);
      onClose();
      onUpdated();
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto relative animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 rounded-t-xl flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#0872b3]">Edit User</h2>
          <button
            className="text-gray-400 hover:text-[#0872b3] p-1 rounded-full hover:bg-gray-100"
            onClick={onClose}
            disabled={submitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form className="p-6 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0872b3] mb-2">
                First Name
              </label>
              <Input
                name="first_name"
                value={form.first_name || ""}
                onChange={handleChange}
                className="w-full"
                required
                disabled={isLoading || submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0872b3] mb-2">
                Last Name
              </label>
              <Input
                name="last_name"
                value={form.last_name || ""}
                onChange={handleChange}
                className="w-full"
                required
                disabled={isLoading || submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0872b3] mb-2">
                Phone
              </label>
              <Input
                name="user_phone"
                value={form.user_phone || ""}
                onChange={handleChange}
                className="w-full"
                disabled={isLoading || submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0872b3] mb-2">
                Gender
              </label>
              <select
                name="user_gender"
                value={form.user_gender || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                disabled={isLoading || submitting}
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0872b3] mb-2">
                Date of Birth
              </label>
              <Input
                name="user_dob"
                type="date"
                value={form.user_dob || ""}
                onChange={handleChange}
                className="w-full"
                disabled={isLoading || submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0872b3] mb-2">
                Street Address
              </label>
              <Input
                name="street_address"
                value={form.street_address || ""}
                onChange={handleChange}
                className="w-full"
                disabled={isLoading || submitting}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#0872b3] text-white min-w-[120px]"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [unitFilter, setUnitFilter] = useState<string>("");
  const [positionFilter, setPositionFilter] = useState<string>("");
  const [organizationFilter, setOrganizationFilter] = useState<string>("");
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const { user } = useAuth();
  const canViewAll = !!user?.position?.position_access?.organizations?.view;
  const {
    data: usersData,
    isLoading,
    isError,
  } = useUsers() as {
    data: UserWithPositions[] | undefined;
    isLoading: boolean;
    isError: boolean;
  };
  const createUser = useCreateUser();
  const router = useRouter();

  // Flatten users: one row per user-position
  const users: UserRow[] = useMemo(() => {
    if (!usersData) return [];
    const rows: UserRow[] = [];
    usersData.forEach((user: UserWithPositions) => {
      (user.positions || []).forEach((position: PositionWithUnitOrg) => {
        rows.push({
          user_id: user.user_id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          user_gender: user.user_gender,
          user_phone: user.user_phone,
          position_id: position.position_id,
          position_name: position.position_name,
          unit_id: position.unit?.unit_id,
          unit_name: position.unit?.unit_name,
          organization_id: position.unit?.organization?.organization_id,
          organization_name: position.unit?.organization?.organization_name,
        });
      });
    });
    return rows;
  }, [usersData]);

  // For dropdowns
  const allUnits = useMemo(() => {
    const map = new Map<string, string>();
    users.forEach((u: UserRow) => {
      if (u.unit_id && u.unit_name && !map.has(u.unit_id)) {
        map.set(u.unit_id, u.unit_name);
      }
    });
    return Array.from(map, ([unit_id, unit_name]: [string, string]) => ({
      unit_id,
      unit_name,
    }));
  }, [users]);

  const allPositions = useMemo(() => {
    const map = new Map<string, string>();
    users.forEach((u: UserRow) => {
      if (u.position_id && u.position_name && !map.has(u.position_id)) {
        map.set(u.position_id, u.position_name);
      }
    });
    return Array.from(
      map,
      ([position_id, position_name]: [string, string]) => ({
        position_id,
        position_name,
      })
    );
  }, [users]);

  // Compute all organizations from users
  const allOrganizations = useMemo(() => {
    const map = new Map<string, string>();
    users.forEach((u: UserRow) => {
      if (
        u.organization_id &&
        u.organization_name &&
        !map.has(u.organization_id)
      ) {
        map.set(u.organization_id, u.organization_name);
      }
    });
    return Array.from(
      map,
      ([organization_id, organization_name]: [string, string]) => ({
        organization_id,
        organization_name,
      })
    );
  }, [users]);

  // Filter units by selected organization
  const filteredUnits = useMemo(() => {
    if (!organizationFilter) return allUnits;
    return users
      .filter((u: UserRow) => u.organization_id === organizationFilter)
      .reduce((acc: { unit_id: string; unit_name: string }[], u: UserRow) => {
        if (
          u.unit_id &&
          u.unit_name &&
          !acc.some((unit: { unit_id: string }) => unit.unit_id === u.unit_id)
        ) {
          acc.push({ unit_id: u.unit_id, unit_name: u.unit_name });
        }
        return acc;
      }, []);
  }, [users, allUnits, organizationFilter]);

  // Filter positions by selected unit
  const filteredPositions = useMemo(() => {
    if (!unitFilter) return allPositions;
    return users
      .filter((u: UserRow) => u.unit_id === unitFilter)
      .reduce(
        (acc: { position_id: string; position_name: string }[], u: UserRow) => {
          if (
            u.position_id &&
            u.position_name &&
            !acc.some(
              (pos: { position_id: string }) =>
                pos.position_id === u.position_id
            )
          ) {
            acc.push({
              position_id: u.position_id,
              position_name: u.position_name,
            });
          }
          return acc;
        },
        []
      );
  }, [users, allPositions, unitFilter]);

  // Filtering
  const filteredUsers = useMemo(() => {
    let filtered = users;
    if (!canViewAll && user?.organization?.organization_id) {
      filtered = filtered.filter(
        (u: UserRow) => u.organization_id === user.organization.organization_id
      );
    }
    if (organizationFilter) {
      filtered = filtered.filter(
        (u: UserRow) => u.organization_id === organizationFilter
      );
    }
    if (unitFilter) {
      filtered = filtered.filter((u: UserRow) => u.unit_id === unitFilter);
    }
    if (positionFilter) {
      filtered = filtered.filter(
        (u: UserRow) => u.position_id === positionFilter
      );
    }
    if (globalFilter) {
      const search = globalFilter.toLowerCase();
      filtered = filtered.filter((u: UserRow) =>
        (
          u.first_name +
          " " +
          u.last_name +
          " " +
          u.email +
          " " +
          (u.unit_name || "") +
          " " +
          (u.position_name || "") +
          " " +
          (u.organization_name || "")
        )
          .toLowerCase()
          .includes(search)
      );
    }
    return filtered;
  }, [
    users,
    canViewAll,
    user,
    organizationFilter,
    unitFilter,
    positionFilter,
    globalFilter,
  ]);

  const columns: ColumnDef<UserRow>[] = useMemo(
    () => [
      {
        id: "number",
        header: () => (
          <span className="text-xs font-semibold uppercase tracking-wider px-3">
            #
          </span>
        ),
        cell: ({ row }) => {
          // Calculate the row number based on pagination
          const pageIndex = table.getState().pagination.pageIndex;
          const pageSize = table.getState().pagination.pageSize;
          return (
            <span className="text-xs text-gray-700 font-semibold px-3">
              {pageIndex * pageSize + row.index + 1}
            </span>
          );
        },
        size: 30,
      },
      {
        id: "name",
        header: () => (
          <span className="text-xs font-semibold uppercase tracking-wider">
            Name
          </span>
        ),
        cell: ({ row }) => (
          <span className="text-xs text-gray-900 font-medium">
            {row.original.first_name} {row.original.last_name}
          </span>
        ),
      },
      {
        accessorKey: "email",
        header: () => (
          <span className="text-xs font-semibold uppercase tracking-wider">
            Email
          </span>
        ),
        cell: ({ row }) => (
          <a
            href={`mailto:${row.getValue("email")}`}
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
          >
            {row.getValue("email")}
          </a>
        ),
      },
      {
        accessorKey: "user_gender",
        header: () => (
          <span className="text-xs font-semibold uppercase tracking-wider">
            Gender
          </span>
        ),
        cell: ({ row }) => (
          <span
            className={`px-2 py-0.5 text-[10px] rounded-full ${
              row.getValue("user_gender") === "MALE"
                ? "bg-blue-100 text-blue-800"
                : "bg-pink-100 text-pink-800"
            }`}
          >
            {row.getValue("user_gender")}
          </span>
        ),
      },
      {
        accessorKey: "user_phone",
        header: () => (
          <span className="text-xs font-semibold uppercase tracking-wider">
            Phone
          </span>
        ),
        cell: ({ row }) => (
          <a
            href={`tel:${row.getValue("user_phone")}`}
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
          >
            {row.getValue("user_phone")}
          </a>
        ),
      },
      {
        accessorKey: "position_name",
        header: () => (
          <span className="text-xs font-semibold uppercase tracking-wider">
            Position
          </span>
        ),
        cell: ({ row }) => (
          <span className="px-2 py-0.5 text-[10px] bg-gray-100 text-gray-800 rounded-full">
            {row.getValue("position_name")}
          </span>
        ),
      },
      {
        accessorKey: "unit_name",
        header: () => (
          <span className="text-xs font-semibold uppercase tracking-wider">
            Unit
          </span>
        ),
        cell: ({ row }) => (
          <span className="px-2 py-0.5 text-[10px] bg-green-100 text-green-800 rounded-full">
            {row.getValue("unit_name")}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => (
          <span className="text-xs font-semibold uppercase tracking-wider">
            Actions
          </span>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <button
              className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setEditUserId(row.original.user_id);
              }}
              aria-label="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable<UserRow>({
    data: filteredUsers,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const handleCreateUser = async (formData: CreateUserDto) => {
    try {
      await createUser.mutateAsync(formData);
      setShowCreate(false);
    } catch {
      // handled by mutation
    }
  };

  if (isLoading) {
    return <SkeletonUsersTable rows={10} />;
  }

  if (isError) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <p className="mt-4 text-red-600">Failed to load users</p>
            <p className="text-gray-500 text-sm mt-2">
              An error occurred while fetching users
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage your organization&apos;s users and their permissions
          </p>
        </div>
        <Button
          className="flex text-white items-center gap-2 bg-[#0872b3] hover:bg-blue-700"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="w-4 h-4" /> Add User
        </Button>
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {/* Search and Filters */}
          <div className="px-4 py-3 border-b border-gray-200 flex flex-wrap items-center gap-3 justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>
            {/* Filters */}
            <div className="flex items-center gap-2 mb-2">
              {canViewAll && (
                <select
                  className="border rounded px-2 py-2 text-xs text-gray-700"
                  value={organizationFilter}
                  onChange={(e) => {
                    setOrganizationFilter(e.target.value);
                    setUnitFilter("");
                    setPositionFilter("");
                  }}
                >
                  <option value="">All Organizations</option>
                  {allOrganizations.map((org) => (
                    <option
                      key={org.organization_id}
                      value={org.organization_id}
                    >
                      {org.organization_name}
                    </option>
                  ))}
                </select>
              )}
              <select
                className="border rounded px-2 py-2 text-xs text-gray-700"
                value={unitFilter}
                onChange={(e) => {
                  setUnitFilter(e.target.value);
                  setPositionFilter("");
                }}
              >
                <option value="">All Units</option>
                {filteredUnits.map((unit) => (
                  <option key={unit.unit_id} value={unit.unit_id}>
                    {unit.unit_name}
                  </option>
                ))}
              </select>
              <select
                className="border rounded px-2 py-2 text-xs text-gray-700"
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
              >
                <option value="">All Positions</option>
                {filteredPositions.map((pos) => (
                  <option key={pos.position_id} value={pos.position_id}>
                    {pos.position_name}
                  </option>
                ))}
              </select>
              <span className="text-xs text-gray-500">
                {table.getFilteredRowModel().rows.length} of{" "}
                {filteredUsers.length} users
              </span>
            </div>
          </div>
          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="px-3 py-6 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.original.user_id}
                      className="hover:bg-blue-50 cursor-pointer border-b border-gray-100 transition-colors"
                      onClick={() => {
                        setEditUserId(null);
                        router.push(
                          `/dashboard/shared_pages/users/${row.original.user_id}`
                        );
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="px-3 py-6 whitespace-nowrap text-xs text-gray-900"
                        >
                          {cell.column.id === "actions" ? (
                            <div className="flex items-center gap-1">
                              <button
                                className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditUserId(row.original.user_id);
                                }}
                                aria-label="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="px-3 py-6 text-center text-gray-500"
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* Pagination */}
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-700">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Create User Modal */}
      <CreateUserModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        isLoading={createUser.isPending}
        onCreate={handleCreateUser}
      />
      <EditUserModal
        open={!!editUserId}
        userId={editUserId}
        onClose={() => setEditUserId(null)}
        onUpdated={() => {}}
      />
    </div>
  );
}

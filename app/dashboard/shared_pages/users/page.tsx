"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
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
import { Plus, Search, X, AlertCircle, ChevronDown } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  useOrganizationUsers,
  useOrganizationCreateUser,
  useOrganizationUser,
  // useOrganizationUpdateUser,
} from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import NoPermissionUI from "@/components/NoPermissionUI";

// Define the type for CreateUserDto
import type {
  CreateUserDto,
  PositionWithUnitOrg,
  UserWithPositions,
  UpdateUserDto,
  UserRow,
} from "@/types/next-auth";
import { SkeletonUsersTable } from "@/components/ui/skeleton";
import ErrorUI from "@/components/ErrorUI";

// Searchable Dropdown Component
function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder,
  className = "",
}: {
  options: Array<{ [key: string]: string }>;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get the display field name (organization_name, unit_name, or position_name)
  const displayField =
    options.length > 0
      ? Object.keys(options[0]).find((key) => key.includes("name")) ||
        Object.keys(options[0])[0]
      : "";

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option[displayField]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected option name
  const selectedOption = options.find((option) => {
    const idField =
      Object.keys(option).find((key) => key.includes("id")) ||
      Object.keys(option)[0];
    return option[idField] === value;
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: { [key: string]: string }) => {
    const idField =
      Object.keys(option).find((key) => key.includes("id")) ||
      Object.keys(option)[0];
    onChange(option[idField]);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className="flex items-center justify-between w-full px-3 py-2 text-sm border border-gray-300 rounded-lg cursor-pointer bg-white hover:border-gray-400 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? "text-gray-900" : "text-gray-500"}>
          {selectedOption ? selectedOption[displayField] : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {value && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={`Search ${placeholder.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                {searchTerm
                  ? `No ${placeholder.toLowerCase()} found`
                  : `No ${placeholder.toLowerCase()} available`}
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const idField =
                  Object.keys(option).find((key) => key.includes("id")) ||
                  Object.keys(option)[0];
                return (
                  <div
                    key={option[idField] || index}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 transition-colors ${
                      option[idField] === value
                        ? "bg-blue-100 text-blue-900"
                        : "text-gray-900"
                    }`}
                    onClick={() => handleSelect(option)}
                  >
                    {option[displayField]}
                  </div>
                );
              })
            )}
          </div>

          {/* Results count */}
          {searchTerm && (
            <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-200 bg-gray-50">
              {filteredOptions.length} of {options.length}{" "}
              {placeholder.toLowerCase()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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

  // Get all users data to extract organizations, units, and positions
  const { data: usersData } = useOrganizationUsers();

  // Extract organizations from users data
  const allOrganizations = useMemo(() => {
    if (!usersData) return [];
    const orgMap = new Map<
      string,
      { organization_id: string; organization_name: string }
    >();
    usersData.forEach((user: UserWithPositions) => {
      user.positions?.forEach((position: PositionWithUnitOrg) => {
        if (position.unit?.organization) {
          const org = position.unit.organization;
          if (!orgMap.has(org.organization_id)) {
            orgMap.set(org.organization_id, {
              organization_id: org.organization_id,
              organization_name: org.organization_name,
            });
          }
        }
      });
    });
    return Array.from(orgMap.values());
  }, [usersData]);

  // Extract units from users data
  const allUnits = useMemo(() => {
    if (!usersData) return [];
    const unitMap = new Map<
      string,
      { unit_id: string; unit_name: string; organization_id: string }
    >();
    usersData.forEach((user: UserWithPositions) => {
      user.positions?.forEach((position: PositionWithUnitOrg) => {
        if (position.unit) {
          const unit = position.unit;
          if (!unitMap.has(unit.unit_id)) {
            unitMap.set(unit.unit_id, {
              unit_id: unit.unit_id,
              unit_name: unit.unit_name,
              organization_id: unit.organization.organization_id,
            });
          }
        }
      });
    });
    return Array.from(unitMap.values());
  }, [usersData]);

  // Extract positions from users data
  const allPositions = useMemo(() => {
    if (!usersData) return [];
    const positionMap = new Map<
      string,
      { position_id: string; position_name: string; unit_id: string }
    >();
    usersData.forEach((user: UserWithPositions) => {
      user.positions?.forEach((position: PositionWithUnitOrg) => {
        if (!positionMap.has(position.position_id)) {
          positionMap.set(position.position_id, {
            position_id: position.position_id,
            position_name: position.position_name,
            unit_id: position.unit.unit_id,
          });
        }
      });
    });
    return Array.from(positionMap.values());
  }, [usersData]);

  const [selectedOrgId, setSelectedOrgId] = useState<string>(
    canViewOrganizations ? "" : userOrganizationId || ""
  );
  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    canViewOrganizations ? "" : userUnitId || ""
  );
  const [selectedPositionId, setSelectedPositionId] = useState<string>("");

  // Filter units by selected organization
  const filteredUnits = useMemo(() => {
    if (!selectedOrgId) return allUnits;
    return allUnits.filter((unit) => unit.organization_id === selectedOrgId);
  }, [allUnits, selectedOrgId]);

  // Filter positions by selected unit
  const filteredPositions = useMemo(() => {
    if (!selectedUnitId) return allPositions;
    return allPositions.filter(
      (position) => position.unit_id === selectedUnitId
    );
  }, [allPositions, selectedUnitId]);

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
    if (canViewOrganizations && filteredUnits.length === 1 && !selectedUnitId) {
      setSelectedUnitId(filteredUnits[0].unit_id);
    }
  }, [canViewOrganizations, filteredUnits, selectedUnitId]);

  React.useEffect(() => {
    if (
      filteredPositions &&
      filteredPositions.length === 1 &&
      !selectedPositionId
    ) {
      setSelectedPositionId(filteredPositions[0].position_id);
    }
  }, [filteredPositions, selectedPositionId]);

  // Auto-select user's unit and organization for non-super admin users
  React.useEffect(() => {
    if (!canViewOrganizations && userOrganizationId && !selectedOrgId) {
      setSelectedOrgId(userOrganizationId);
    }
  }, [canViewOrganizations, userOrganizationId, selectedOrgId]);

  React.useEffect(() => {
    if (!canViewOrganizations && userUnitId && !selectedUnitId) {
      setSelectedUnitId(userUnitId);
    }
  }, [canViewOrganizations, userUnitId, selectedUnitId]);

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
      position_id: true,
    };
    setTouched(allTouchedFields);
    if (!validateForm()) {
      console.log("Validation failed:", errors); // Debug log
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
      setSelectedOrgId(canViewOrganizations ? "" : userOrganizationId || "");
      setSelectedUnitId(canViewOrganizations ? "" : userUnitId || "");
      setSelectedPositionId("");
      setErrors({});
      setTouched({});
    } catch (error) {
      console.error("Create user error:", error);
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
    setSelectedOrgId(canViewOrganizations ? "" : userOrganizationId || "");
    setSelectedUnitId(canViewOrganizations ? "" : userUnitId || "");
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
                    Organization <span className="text-red-500">*</span>
                  </label>
                  <SearchableDropdown
                    options={allOrganizations}
                    value={selectedOrgId}
                    onChange={(value) => {
                      setSelectedOrgId(value);
                      setSelectedUnitId("");
                      setSelectedPositionId("");
                    }}
                    placeholder="Select organization"
                    className="w-full"
                  />
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
                  Unit <span className="text-red-500">*</span>
                </label>
                <SearchableDropdown
                  options={filteredUnits}
                  value={selectedUnitId}
                  onChange={(value) => {
                    setSelectedUnitId(value);
                    setSelectedPositionId("");
                  }}
                  placeholder="Select unit"
                  className="w-full"
                />
                {errors.unit_id && touched.unit_id && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.unit_id}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0872b3] mb-2">
                  Position <span className="text-red-500">*</span>
                </label>
                <SearchableDropdown
                  options={filteredPositions}
                  value={selectedPositionId}
                  onChange={setSelectedPositionId}
                  placeholder="Select position"
                  className="w-full"
                />
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
                    !selectedUnitId ||
                    filteredPositions.length === 0
                  }
                >
                  {filteredPositions.length > 0 ? (
                    filteredPositions.map((pos) => (
                      <option key={pos.position_id} value={pos.position_id}>
                        {pos.position_name}
                      </option>
                    ))
                  ) : (
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
                isLoading || !selectedUnitId || filteredPositions.length === 0
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
  const { data: user, isLoading } = useOrganizationUser(userId || "");
  // const updateUser = useOrganizationUpdateUser(userId || "");
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
      // await updateUser.mutateAsync(form);
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
  const { user, isLoading: authLoading } = useAuth();

  // Call all hooks unconditionally at the top
  const {
    data: usersData,
    isLoading,
    isError,
  } = useOrganizationUsers() as {
    data: UserWithPositions[] | undefined;
    isLoading: boolean;
    isError: boolean;
  };
  const createUser = useOrganizationCreateUser();
  const router = useRouter();

  // Permission checks
  const canView = !!user?.position?.position_access?.users?.view;
  const canCreate = !!user?.position?.position_access?.users?.create;
  const canUpdate = !!user?.position?.position_access?.users?.update;

  const allOrganizations = useMemo(() => {
    if (!usersData) return [];
    const orgMap = new Map<
      string,
      { organization_id: string; organization_name: string }
    >();

    // Process ALL users in the dataset, including those with empty positions
    usersData.forEach((user: UserWithPositions) => {
      // Handle users with positions
      if (user.positions && user.positions.length > 0) {
        user.positions.forEach((position: PositionWithUnitOrg) => {
          if (position.unit?.organization) {
            const org = position.unit.organization;
            if (!orgMap.has(org.organization_id)) {
              orgMap.set(org.organization_id, {
                organization_id: org.organization_id,
                organization_name: org.organization_name,
              });
            }
          }
        });
      }
    });
    return Array.from(orgMap.values());
  }, [usersData]);

  const allUnits = useMemo(() => {
    if (!usersData) return [];
    const unitMap = new Map<
      string,
      { unit_id: string; unit_name: string; organization_id: string }
    >();

    usersData.forEach((user: UserWithPositions) => {
      if (user.positions && user.positions.length > 0) {
        user.positions.forEach((position: PositionWithUnitOrg) => {
          if (position.unit) {
            const unit = position.unit;
            if (!unitMap.has(unit.unit_id)) {
              unitMap.set(unit.unit_id, {
                unit_id: unit.unit_id,
                unit_name: unit.unit_name,
                organization_id: unit.organization.organization_id,
              });
            }
          }
        });
      }
    });
    return Array.from(unitMap.values());
  }, [usersData]);

  const allPositions = useMemo(() => {
    if (!usersData) return [];
    const positionMap = new Map<
      string,
      { position_id: string; position_name: string; unit_id: string }
    >();

    usersData.forEach((user: UserWithPositions) => {
      if (user.positions && user.positions.length > 0) {
        user.positions.forEach((position: PositionWithUnitOrg) => {
          if (!positionMap.has(position.position_id)) {
            positionMap.set(position.position_id, {
              position_id: position.position_id,
              position_name: position.position_name,
              unit_id: position.unit.unit_id,
            });
          }
        });
      }
    });
    return Array.from(positionMap.values());
  }, [usersData]);

  // Process users for display - this can be restricted based on permissions
  const users: UserRow[] = useMemo(() => {
    if (!usersData) return [];
    const rows: UserRow[] = [];

    usersData.forEach((user: UserWithPositions) => {
      // Apply any user-level restrictions here if needed
      // For example, if you need to filter users based on current user's permissions:
      // if (!canViewThisUser(user)) return; // Skip this user

      if (!user.positions || user.positions.length === 0) {
        rows.push({
          user_id: user.user_id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          user_gender: user.user_gender,
          user_phone: user.user_phone,
          position_id: "",
          position_name: "No Position Assigned",
          unit_id: "",
          unit_name: "No Unit Assigned",
          organization_id: "",
          organization_name: "No Organization Assigned",
        });
      } else {
        const firstPosition = user.positions[0];
        const positionNames = user.positions
          .map((p) => p.position_name)
          .join(", ");
        const unitNames = [
          ...new Set(
            user.positions.map((p) => p.unit?.unit_name).filter(Boolean)
          ),
        ].join(", ");
        const orgNames = [
          ...new Set(
            user.positions
              .map((p) => p.unit?.organization?.organization_name)
              .filter(Boolean)
          ),
        ].join(", ");

        rows.push({
          user_id: user.user_id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          user_gender: user.user_gender,
          user_phone: user.user_phone,
          position_id: firstPosition.position_id,
          position_name: positionNames,
          unit_id: firstPosition.unit?.unit_id || "",
          unit_name: unitNames || "No Unit Assigned",
          organization_id:
            firstPosition.unit?.organization?.organization_id || "",
          organization_name: orgNames || "No Organization Assigned",
        });
      }
    });
    return rows;
  }, [usersData]);

  // Filter dropdown options based on selections
  const filteredUnits = useMemo(() => {
    if (!organizationFilter) return allUnits;
    return allUnits.filter(
      (unit) => unit.organization_id === organizationFilter
    );
  }, [allUnits, organizationFilter]);

  const filteredPositions = useMemo(() => {
    if (!unitFilter) return allPositions;
    return allPositions.filter((position) => position.unit_id === unitFilter);
  }, [allPositions, unitFilter]);

  // Apply filters to displayed users
  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Filter by organization
    if (organizationFilter) {
      filtered = filtered.filter(
        (u: UserRow) => u.organization_id === organizationFilter
      );
    }

    // Filter by unit
    if (unitFilter) {
      filtered = filtered.filter((u: UserRow) => u.unit_id === unitFilter);
    }

    // Filter by position
    if (positionFilter) {
      filtered = filtered.filter(
        (u: UserRow) => u.position_id === positionFilter
      );
    }

    // Global search filter
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
  }, [users, organizationFilter, unitFilter, positionFilter, globalFilter]);

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
        cell: ({ row }) => {
          const positionName = row.getValue("position_name") as string;
          const positions = positionName.split(", ");
          return (
            <div className="flex flex-wrap gap-1">
              {positions.map((pos, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 text-[10px] bg-gray-100 text-gray-800 rounded-full"
                >
                  {pos}
                </span>
              ))}
            </div>
          );
        },
      },
      {
        accessorKey: "unit_name",
        header: () => (
          <span className="text-xs font-semibold uppercase tracking-wider">
            Unit
          </span>
        ),
        cell: ({ row }) => {
          const unitName = row.getValue("unit_name") as string;
          const units = unitName.split(", ");
          return (
            <div className="flex flex-wrap gap-1">
              {units.map((unit, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 text-[10px] bg-green-100 text-green-800 rounded-full"
                >
                  {unit}
                </span>
              ))}
            </div>
          );
        },
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
            <a
              href={`/dashboard/shared_pages/users/${row.original.user_id}`}
              className="text-blue-600 font-semibold hover:underline px-2 py-1 rounded"
              onClick={(e) => {
                e.stopPropagation();
                router.push(
                  `/dashboard/shared_pages/users/${row.original.user_id}`
                );
                e.preventDefault();
              }}
              tabIndex={0}
            >
              View
            </a>
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

  if (authLoading) {
    return <SkeletonUsersTable rows={10} />;
  }

  // Check if user has any relevant permissions
  const hasAnyPermission = canView || canCreate || canUpdate;
  if (!hasAnyPermission) {
    return <NoPermissionUI resource="users" />;
  }

  if (isLoading) {
    return <SkeletonUsersTable rows={10} />;
  }

  // Only show error UI if user has view permission and there's an actual error
  if (isError && canView) {
    return (
      <ErrorUI
        resource="users"
        onRetry={() => {
          // re-fetch your data
          window.location.reload();
        }}
        onBack={() => {
          router.back();
        }}
      />
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
        {canCreate && (
          <Button
            className="flex text-white items-center gap-2 bg-[#0872b3] hover:bg-blue-700"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="w-4 h-4" /> Add User
          </Button>
        )}
      </div>
      {/* Main Content */}
      {canView ? (
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
                <SearchableDropdown
                  options={allOrganizations}
                  value={organizationFilter}
                  onChange={(value) => {
                    setOrganizationFilter(value);
                    setUnitFilter("");
                    setPositionFilter("");
                  }}
                  placeholder="All Organizations"
                  className="w-48"
                />
                <SearchableDropdown
                  options={filteredUnits}
                  value={unitFilter}
                  onChange={(value) => {
                    setUnitFilter(value);
                    setPositionFilter("");
                  }}
                  placeholder="All Units"
                  className="w-48"
                />
                <SearchableDropdown
                  options={filteredPositions}
                  value={positionFilter}
                  onChange={setPositionFilter}
                  placeholder="All Positions"
                  className="w-48"
                />
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
                            className={`px-3 py-6 whitespace-nowrap text-xs text-gray-900 ${
                              cell.column.id === "actions"
                                ? "!cursor-default group-hover:bg-transparent"
                                : ""
                            }`}
                            onClick={
                              cell.column.id === "actions"
                                ? (e) => e.stopPropagation()
                                : undefined
                            }
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
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
            <div className="px-4 py-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2 bg-white">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  {"<<"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  {">>"}
                </Button>
              </div>
              <span className="text-xs text-gray-700">
                Page{" "}
                <strong>
                  {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </strong>
              </span>
              <span className="text-xs text-gray-700">
                Go to page:{" "}
                <input
                  type="number"
                  min={1}
                  max={table.getPageCount()}
                  value={table.getState().pagination.pageIndex + 1}
                  onChange={(e) => {
                    const page = e.target.value
                      ? Number(e.target.value) - 1
                      : 0;
                    table.setPageIndex(
                      Math.max(0, Math.min(page, table.getPageCount() - 1))
                    );
                  }}
                  className="w-16 border rounded px-2 py-1 text-xs"
                />
              </span>
              <select
                className="border rounded px-2 py-1 text-xs"
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value));
                  table.setPageIndex(0);
                }}
              >
                {[10, 20, 30, 40, 50].map((size) => (
                  <option key={size} value={size}>
                    Show {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ) : (
        // Show message when user can't view but has other permissions
        <div className="flex-1 overflow-auto p-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Access to View Users
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                You don&apos;t have permission to view existing users, but you
                can create new ones if you have the appropriate permissions.
              </p>
              {canCreate && (
                <button
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm text-white bg-[#0872b3] rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setShowCreate(true)}
                >
                  <Plus className="w-5 h-5" />
                  Create New User
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Create User Modal */}
      <CreateUserModal
        open={showCreate && canCreate}
        onClose={() => setShowCreate(false)}
        isLoading={createUser.isPending}
        onCreate={handleCreateUser}
      />
      {editUserId && canUpdate && (
        <EditUserModal
          open={!!editUserId}
          userId={editUserId}
          onClose={() => setEditUserId(null)}
          onUpdated={() => {}}
        />
      )}
    </div>
  );
}

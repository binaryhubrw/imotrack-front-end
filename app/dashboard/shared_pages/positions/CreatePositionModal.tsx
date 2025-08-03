import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOrganizationUsers } from "@/lib/queries";
import type { position_accesses } from "@/types/next-auth";

// Define defaultPermissions at the top of the file
const defaultPermissions: position_accesses = {
  organizations: {
    create: false,
    view: false,
    update: false,
    delete: false,
  },
  units: { create: false, view: false, update: false, delete: false },
  positions: {
    create: false,
    view: false,
    update: false,
    delete: false,
    assignUser: false,
  },
  users: { create: false, view: false, update: false, delete: false },
  vehicleModels: {
    create: false,
    view: false,
    viewSingle: false,
    update: false,
    delete: false,
  },
  vehicles: {
    create: false,
    view: false,
    viewSingle: false,
    update: false,
    delete: false,
  },
  reservations: {
    create: false,
    view: false,
    update: false,
    delete: false,
    cancel: false,
    approve: false,
    assignVehicle: false,
    odometerFuel: false,
    updateReason: false,
    start: false,
    complete: false,
    viewOwn: false,
  },
  vehicleIssues: { report: false, view: false, update: false, delete: false },
};

export function CreatePositionModal({
  open,
  onClose,
  onCreate,
  unitId,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: {
    position_name: string;
    position_description: string;
    unit_id: string;
    position_access: position_accesses;
    user_ids: string[];
  }) => Promise<void>;
  unitId: string;
}) {
  const [form, setForm] = useState({
    position_name: "",
    position_description: "",
    position_access: { ...defaultPermissions },
    user_ids: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);
  const { data: users = [] } = useOrganizationUsers();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, multiple } = e.target;
    if (name === "user_ids" && multiple) {
      const options = (e.target as HTMLSelectElement).options;
      const selected = Array.from(options)
        .filter((o) => (o as HTMLOptionElement).selected)
        .map((o) => (o as HTMLOptionElement).value);
      // If 'ALL' is selected, select all user_ids
      if (selected.includes("ALL")) {
        setForm((f) => ({ ...f, user_ids: users.map((u) => u.user_id) }));
      } else {
        setForm((f) => ({ ...f, user_ids: selected }));
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Update handleAccessChange to use string for module and index with as keyof position_accesses
  const handleAccessChange = (module: string, perm: string) => {
    setForm((prev) => {
      const perms = {
        ...(prev.position_access as Record<string, Record<string, boolean>>)[
          module
        ],
      };
      perms[perm] = !perms[perm];
      return {
        ...prev,
        position_access: {
          ...prev.position_access,
          [module]: perms,
        },
      };
    });
  };

  // Add function to handle selecting/deselecting all permissions for a module
  const handleSelectAllPermissions = (module: string) => {
    setForm((prev) => {
      const currentPerms = (
        prev.position_access as Record<string, Record<string, boolean>>
      )[module];
      const allSelected = Object.values(currentPerms).every(Boolean);

      // If all are selected, deselect all. Otherwise, select all.
      const newPerms = Object.keys(currentPerms).reduce((acc, perm) => {
        acc[perm] = !allSelected;
        return acc;
      }, {} as Record<string, boolean>);

      return {
        ...prev,
        position_access: {
          ...prev.position_access,
          [module]: newPerms,
        },
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const positionData = {
        position_name: form.position_name,
        position_description: form.position_description,
        unit_id: unitId,
        position_access: form.position_access,
        user_ids: form.user_ids,
      };

      await onCreate(positionData);

      // Reset form
      setForm({
        position_name: "",
        position_description: "",
        position_access: { ...defaultPermissions },
        user_ids: [],
      });
      onClose();
    } catch (error) {
      console.error("Error creating position:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      position_name: "",
      position_description: "",
      position_access: { ...defaultPermissions },
      user_ids: [],
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col relative animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 bg-white border-b border-gray-100 p-6 rounded-t-xl relative z-10">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-[#0872b3] transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
            onClick={handleClose}
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-[#0872b3] pr-10">
            Create Position
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Define a new position with specific permissions
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#0872b3] border-b border-[#0872b3]/20 pb-2">
                  Basic Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-[#0872b3] mb-2">
                    Position Name
                  </label>
                  <Input
                    name="position_name"
                    placeholder="Enter position name"
                    value={form.position_name}
                    onChange={handleChange}
                    required
                    className="border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3] transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0872b3] mb-2">
                    Description
                  </label>
                  <textarea
                    name="position_description"
                    placeholder="Enter position description"
                    value={form.position_description}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        position_description: e.target.value,
                      }))
                    }
                    required
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#0872b3] focus:border-[#0872b3] transition-colors duration-200 resize-none"
                  />
                </div>
              </div>

              {/* Permissions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#0872b3] border-b border-[#0872b3]/20 pb-2">
                  Permissions
                </h3>

                <div className="space-y-4">
                  {Object.entries(form.position_access)
                    .filter(([module]) => module !== "organizations")
                    .map(([module, permissions]) => {
                      const perms = permissions as Record<string, boolean>;
                      const allSelected = Object.values(perms).every(Boolean);
                      const someSelected = Object.values(perms).some(Boolean);

                      return (
                        <div
                          key={String(module)}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold capitalize text-[#0872b3] flex items-center gap-2">
                              <div className="w-2 h-2 bg-[#0872b3] rounded-full"></div>
                              {String(module)}
                            </h4>
                            <button
                              type="button"
                              onClick={() => handleSelectAllPermissions(module)}
                              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-200 ${
                                allSelected
                                  ? "bg-[#0872b3] text-white hover:bg-[#065a8f]"
                                  : someSelected
                                  ? "bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-300"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300"
                              }`}
                            >
                              {allSelected ? "Deselect All" : "Select All"}
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-3">
                            {Object.entries(perms).map(
                              ([perm, isChecked]: [string, boolean]) => (
                                <label
                                  key={perm}
                                  className="flex items-center space-x-3 text-sm cursor-pointer group"
                                >
                                  <div className="relative">
                                    <input
                                      type="checkbox"
                                      checked={!!isChecked}
                                      onChange={() =>
                                        handleAccessChange(module, perm)
                                      }
                                      className="sr-only"
                                    />
                                    <div
                                      className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                                        isChecked
                                          ? "bg-[#0872b3] border-[#0872b3]"
                                          : "border-gray-300 group-hover:border-[#0872b3]"
                                      }`}
                                    >
                                      {isChecked && (
                                        <svg
                                          className="w-3 h-3 text-white absolute top-0.5 left-0.5"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      )}
                                    </div>
                                  </div>
                                  <span
                                    className={`capitalize transition-colors duration-200 ${
                                      isChecked
                                        ? "text-[#0872b3] font-medium"
                                        : "text-gray-700 group-hover:text-[#0872b3]"
                                    }`}
                                  >
                                    {perm}
                                  </span>
                                </label>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="flex-shrink-0 bg-white border-t border-gray-100 p-6 rounded-b-xl relative z-10">
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={submitting}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="min-w-[140px] bg-[#0872b3] hover:bg-[#065a8f] text-white transition-colors duration-200"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </span>
                  ) : (
                    "Create Position"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
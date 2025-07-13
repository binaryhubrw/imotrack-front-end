"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Define modules/pages and actions
const MODULES = [
  { key: "organizations", label: "Organizations" },
  { key: "units", label: "Units" },
  { key: "positions", label: "Positions" },
  { key: "users", label: "Users" },
  { key: "vehicles", label: "Vehicles" },
  { key: "vehicleRequests", label: "Vehicle Requests" },
  { key: "issues", label: "Issues" },
  { key: "notifications", label: "Notifications" },
  { key: "profile", label: "Profile" },
  // Add more as needed
];

const ACTIONS = [
  { key: "view", label: "View" },
  { key: "create", label: "Create" },
  { key: "edit", label: "Edit" },
  { key: "delete", label: "Delete" },
];

const roleSchema = z.object({
  name: z.string().min(2, "Role name is required"),
  description: z.string().optional(),
  permissions: z.record(z.record(z.boolean())),
});

type RoleFormData = z.infer<typeof roleSchema>;

export default function CreateRolePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default permissions: all false
  const defaultPermissions = MODULES.reduce((acc, mod) => {
    acc[mod.key] = ACTIONS.reduce((a, act) => {
      a[act.key] = false;
      return a;
    }, {} as Record<string, boolean>);
    return acc;
  }, {} as Record<string, Record<string, boolean>>);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: defaultPermissions,
    },
  });

  const permissions = watch("permissions");

  const onSubmit = async (data: RoleFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1200));
      toast.success("Role created successfully!", {
        description: `Role '${data.name}' has been created and permissions assigned.`,
      });
      reset();
      router.push("/dashboard/shared_pages/roles"); // Or wherever you list roles
    } catch {
      toast.error("Failed to create role", {
        description: "An error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Select/Deselect all for a module
  const handleModuleToggle = (moduleKey: string, checked: boolean) => {
    ACTIONS.forEach((action) => {
      setValue(`permissions.${moduleKey}.${action.key}`, checked, { shouldDirty: true });
    });
  };

  // Select/Deselect all for an action
  const handleActionToggle = (actionKey: string, checked: boolean) => {
    MODULES.forEach((mod) => {
      setValue(`permissions.${mod.key}.${actionKey}`, checked, { shouldDirty: true });
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0872b3]/10 to-white py-10 px-2 flex items-center justify-center">
      <Card className="w-full max-w-3xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Create New Role</CardTitle>
            <CardDescription>
              Define a new role and assign permissions for each module/page. Roles are fully dynamic and can be used across any sector or department.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Role Name */}
            <div>
              <label htmlFor="role-name" className="block text-[#0872b3] font-medium mb-1">
                Role Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="role-name"
                placeholder="e.g. HR Manager, Fleet Supervisor, Custom Role"
                {...register("name")}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>
            {/* Description */}
            <div>
              <label htmlFor="role-description" className="block text-[#0872b3] font-medium mb-1">
                Description
              </label>
              <Input
                id="role-description"
                placeholder="Optional description for this role"
                {...register("description")}
                disabled={isSubmitting}
              />
            </div>
            {/* Permissions Matrix */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#0872b3] font-semibold">Permissions</span>
                <span className="text-xs text-gray-500">Select the actions this role can perform for each module/page.</span>
              </div>
              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Module/Page</th>
                      {ACTIONS.map((action) => (
                        <th key={action.key} className="px-4 py-2 text-center font-semibold text-gray-700">
                          <div className="flex flex-col items-center gap-1">
                            <span>{action.label}</span>
                            <Checkbox
                              checked={MODULES.every((mod) => permissions[mod.key]?.[action.key])}
                              onCheckedChange={(checked) => handleActionToggle(action.key, !!checked)}
                              aria-label={`Toggle all ${action.label}`}
                              className="border-[#0872b3]"
                            />
                          </div>
                        </th>
                      ))}
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {MODULES.map((mod) => (
                      <tr key={mod.key} className="border-t border-gray-100 hover:bg-blue-50/20">
                        <td className="px-4 py-2 font-medium text-gray-900">
                          {mod.label}
                        </td>
                        {ACTIONS.map((action) => (
                          <td key={action.key} className="px-4 py-2 text-center">
                            <Controller
                              name={`permissions.${mod.key}.${action.key}` as const}
                              control={control}
                              render={({ field }) => (
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  aria-label={`${mod.label} - ${action.label}`}
                                  className="border-[#0872b3]"
                                />
                              )}
                            />
                          </td>
                        ))}
                        <td className="px-4 py-2 text-center">
                          <Checkbox
                            checked={ACTIONS.every((action) => permissions[mod.key]?.[action.key])}
                            onCheckedChange={(checked) => handleModuleToggle(mod.key, !!checked)}
                            aria-label={`Toggle all for ${mod.label}`}
                            className="border-[#0872b3]"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#0872b3] text-white hover:bg-[#065d8f]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Create Role"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 
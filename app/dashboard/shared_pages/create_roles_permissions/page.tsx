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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <Card className="w-full max-w-6xl shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader className="pb-8">
            <CardTitle className="text-3xl font-bold text-gray-900">Create New Role</CardTitle>
            <CardDescription className="text-lg text-gray-600 mt-3">
              Define a new role and assign permissions for each module/page. Roles are fully dynamic and can be used across any sector or department.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Role Name */}
            <div>
              <label htmlFor="role-name" className="block text-[#0872b3] font-semibold mb-3 text-lg">
                Role Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="role-name"
                placeholder="e.g. HR Manager, Fleet Supervisor, Custom Role"
                {...register("name")}
                disabled={isSubmitting}
                className="h-12 text-lg px-4 border-0 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/30 rounded-lg transition-all duration-200"
              />
              {errors.name && (
                <p className="text-red-600 text-base mt-2">{errors.name.message}</p>
              )}
            </div>
            {/* Description */}
            <div>
              <label htmlFor="role-description" className="block text-[#0872b3] font-semibold mb-3 text-lg">
                Description
              </label>
              <Input
                id="role-description"
                placeholder="Optional description for this role"
                {...register("description")}
                disabled={isSubmitting}
                className="h-12 text-lg px-4 border-0 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/30 rounded-lg transition-all duration-200"
              />
            </div>
            {/* Permissions Matrix */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[#0872b3] font-bold text-xl">Permissions</span>
                <span className="text-sm text-gray-500">Select the actions this role can perform for each module/page.</span>
              </div>
              <div className="overflow-x-auto rounded-xl bg-white/60 backdrop-blur-sm shadow-lg">
                <table className="min-w-full text-base">
                  <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold text-gray-800 text-lg border-0">Module/Page</th>
                      {ACTIONS.map((action) => (
                        <th key={action.key} className="px-6 py-4 text-center font-bold text-gray-800 text-lg border-0">
                          <div className="flex flex-col items-center gap-3">
                            <span className="text-base">{action.label}</span>
                            <div className="scale-125">
                              <Checkbox
                                checked={MODULES.every((mod) => permissions[mod.key]?.[action.key])}
                                onCheckedChange={(checked) => handleActionToggle(action.key, !!checked)}
                                aria-label={`Toggle all ${action.label}`}
                                className="h-5 w-5 border-0 bg-white/70 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white rounded-md shadow-sm"
                              />
                            </div>
                          </div>
                        </th>
                      ))}
                      <th className="px-6 py-4 text-center font-bold text-gray-800 text-lg border-0">
                        <div className="flex flex-col items-center gap-3">
                          <span className="text-base">All</span>
                          <div className="scale-125">
                            <Checkbox
                              className="h-5 w-5 border-0 bg-white/70 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white rounded-md shadow-sm"
                              aria-label="Select all actions"
                            />
                          </div>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/30 divide-y divide-gray-100">
                    {MODULES.map((mod, index) => (
                      <tr key={mod.key} className={`hover:bg-white/50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white/20' : 'bg-white/10'}`}>
                        <td className="px-6 py-5 font-semibold text-gray-900 text-lg">
                          {mod.label}
                        </td>
                        {ACTIONS.map((action) => (
                          <td key={action.key} className="px-6 py-5 text-center">
                            <div className="flex justify-center">
                              <Controller
                                name={`permissions.${mod.key}.${action.key}` as const}
                                control={control}
                                render={({ field }) => (
                                  <div className="scale-125">
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      aria-label={`${mod.label} - ${action.label}`}
                                      className="h-5 w-5 border-0 bg-white/70 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white rounded-md shadow-sm"
                                    />
                                  </div>
                                )}
                              />
                            </div>
                          </td>
                        ))}
                        <td className="px-6 py-5 text-center">
                          <div className="flex justify-center">
                            <div className="scale-125">
                              <Checkbox
                                checked={ACTIONS.every((action) => permissions[mod.key]?.[action.key])}
                                onCheckedChange={(checked) => handleModuleToggle(mod.key, !!checked)}
                                aria-label={`Toggle all for ${mod.label}`}
                                className="h-5 w-5 border-0 bg-white/70 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white rounded-md shadow-sm"
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between gap-6 pt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="h-12 px-8 text-lg font-medium border-0 bg-gray-100/70 hover:bg-gray-200/70 text-gray-700 rounded-lg transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 h-12 px-8 text-lg font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
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
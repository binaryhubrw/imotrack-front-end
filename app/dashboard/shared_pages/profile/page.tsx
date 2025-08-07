"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Lock,
  Mail,
  Shield,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  Phone,
  MapPin,
  Calendar,
  Building,
  Activity,
  Check,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUpdatePassword } from "@/lib/queries";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { SkeletonUserProfilePage } from "@/components/ui/skeleton";

export default function UserProfilePage() {
  // Add router for manual navigation control
  const router = useRouter();

  // Add a state to track if we should show the page content
  const [shouldShowContent, setShouldShowContent] = useState(false);

  // Use auth hook without invalid parameters
  const { user, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editForm, setEditForm] = useState<
    Partial<{
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
      avatar: string;
      nid: string;
      gender: string;
      dob: string;
    }>
  >({});
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordChanged, setPasswordChanged] = useState(false);

  // Use the update password mutation
  const updatePasswordMutation = useUpdatePassword();

  // Handle authentication state changes
  useEffect(() => {
    if (!isLoading) {
      if (user?.user) {
        // User is authenticated, show content
        setShouldShowContent(true);
        setEditForm(user.user);
      } else if (!user) {
        // User is not authenticated, show login prompt instead of redirect
        setShouldShowContent(false);
      }
    }
  }, [user, isLoading]);

  const handleManualLogin = () => {
    // Manual navigation to login page
    router.push("/login");
  };

  const handleSaveProfile = async () => {
    try {
      // TODO: Implement profile update endpoint in backend
      toast.info(
        "Profile update feature is not yet implemented in the backend"
      );
      setIsEditing(false);
      // await api.put('/auth/profile', editForm);
      // refetch(); // Refetch the user data
      // toast.success('Profile updated successfully');
    } catch (error: unknown) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate that all fields are filled
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      // Use the actual mutation to update password with correct parameter names
      const response = await updatePasswordMutation.mutateAsync({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      // Clear the form on success
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordChanged(true);

      // Show success message - the mutation already handles the success toast
      console.log("Password update successful:", response);

      // Reset the success state after 3 seconds
      setTimeout(() => setPasswordChanged(false), 3000);
    } catch (error: unknown) {
      console.error("Password change error:", error);
      // Error handling is already done in the mutation, but we can add additional logging
      if (error instanceof Error) {
        console.error("Password change error details:", error.message);
      }
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";
  };

  // Show loading state while authentication is being checked
  if (isLoading) {
    return <SkeletonUserProfilePage />;
  }

  // Show login prompt instead of redirecting
  if (!shouldShowContent || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Authentication Required
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                You need to be logged in to access your profile page.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={handleManualLogin}
                  className="cursor-pointer bg-blue-600 hover:bg-blue-700"
                >
                  <User className="w-4 h-4 mr-2" />
                  Go to Login
                </Button>
                <Button variant="outline" onClick={() => router.push("/")}>
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const userProfile = user.user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Enhanced Header Section */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div className="relative">
                {userProfile.avatar ? (
                  <Image
                    width={24}
                    height={24}
                    src={userProfile.avatar}
                    alt={`${userProfile.first_name} ${userProfile.last_name}`}
                    className="rounded-full object-cover shadow-lg ring-4 ring-white"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4 ring-white">
                    {getInitials(userProfile.first_name, userProfile.last_name)}
                  </div>
                )}
              </div>
              <div className="text-center lg:text-left flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {userProfile.first_name} {userProfile.last_name}
                </h1>
                <p className="text-gray-600 mb-3 flex items-center justify-center lg:justify-start gap-2">
                  <Building className="w-4 h-4" />
                  {user.organization.organization_name}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: "profile" as const, icon: User, label: "Profile" },
            { id: "security" as const, icon: Lock, label: "Security" },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex cursor-pointer items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                activeTab === id
                  ? "bg-white shadow-md text-blue-600 border border-blue-100"
                  : "bg-white/50 hover:bg-white/80 text-gray-600 hover:text-gray-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {activeTab === "profile" && (
            <>
              {/* Profile Info */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      Personal Information
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (isEditing) {
                          setEditForm(userProfile);
                        }
                        setIsEditing(!isEditing);
                      }}
                      className="hover:bg-blue-50"
                    >
                      {isEditing ? (
                        <X className="w-4 h-4" />
                      ) : (
                        <Edit3 className="w-4 h-4" />
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          First Name
                        </Label>
                        {isEditing ? (
                          <Input
                            value={editForm.first_name || ""}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                first_name: e.target.value,
                              }))
                            }
                            className="bg-white"
                          />
                        ) : (
                          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-900">
                              {userProfile.first_name}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Last Name
                        </Label>
                        {isEditing ? (
                          <Input
                            value={editForm.last_name || ""}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                last_name: e.target.value,
                              }))
                            }
                            className="bg-white"
                          />
                        ) : (
                          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-900">
                              {userProfile.last_name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Email
                        </Label>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">
                            {userProfile.email}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Phone
                        </Label>
                        {isEditing ? (
                          <Input
                            value={editForm.phone || ""}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                phone: e.target.value,
                              }))
                            }
                            className="bg-white"
                          />
                        ) : (
                          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900">
                              {userProfile.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          National ID
                        </Label>
                        <div className="p-3 bg-gray-50 rounded-lg font-mono text-sm text-gray-600">
                          {userProfile.nid}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Date of Birth
                        </Label>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">
                            {formatDate(userProfile.dob)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Gender
                        </Label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-900 capitalize">
                            {userProfile.gender}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={handleSaveProfile}
                          className="cursor-pointer bg-blue-600 hover:bg-blue-700"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditForm(userProfile);
                            setIsEditing(false);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Side Panel */}
              <div className="space-y-4">
                <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Activity className="w-5 h-5" />
                      <h3 className="font-semibold">Account Status</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-100">Status</span>
                        <span className="capitalize font-medium">Active</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-blue-100">Position</span>
                        <span className="font-medium">
                          {user.position.position_name}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">
                        Organization
                      </h3>
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium text-gray-900">
                        {user.organization.organization_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {user.organization.organization_email}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">Unit</h3>
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium text-gray-900">
                        {user.unit.unit_name}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {activeTab === "security" && (
            <div className="lg:col-span-3">
              <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg overflow-hidden">
                {/* Enhanced Header with Better Visual Hierarchy */}
                <CardHeader className="bg-gradient-to-r from-[#0872b3]/5 to-[#0872b3]/10 border-b border-[#0872b3]/20">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0872b3]/10 rounded-lg flex items-center justify-center">
                      <Lock className="w-5 h-5 text-[#0872b3]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Change Password
                      </h3>
                      <p className="text-sm text-gray-600 font-normal">
                        Keep your account secure with a strong password
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-6">
                  {/* Security Tips Banner */}
                  <div className="mb-6 p-4 bg-[#0872b3]/5 border border-[#0872b3]/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-[#0872b3] mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-[#0872b3] mb-1">
                          Password Security Tips
                        </h4>
                        <ul className="text-xs text-[#0872b3]/80 space-y-1">
                          <li>
                            • Use at least 8 characters with mixed case,
                            numbers, and symbols
                          </li>
                          <li>
                            • Avoid using personal information or common words
                          </li>
                          <li>
                            • Don&apos;t reuse passwords from other accounts
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <form
                    onSubmit={handlePasswordChange}
                    className="space-y-6 max-w-md"
                  >
                    {/* Success Message */}
                    {passwordChanged && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-800">
                          <Check className="w-5 h-5 text-green-600" />
                          <span className="font-medium">
                            Password updated successfully!
                          </span>
                        </div>
                      </div>
                    )}
                    {/* Current Password with Enhanced UX */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="currentPassword"
                        className="text-sm font-medium text-[#0872b3] flex items-center gap-2"
                      >
                        Current Password
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative group">
                        <Input
                          id="currentPassword"
                          type={showPassword ? "text" : "password"}
                          value={passwordForm.currentPassword}
                          onChange={(e) =>
                            setPasswordForm((prev) => ({
                              ...prev,
                              currentPassword: e.target.value,
                            }))
                          }
                          className="px-4 py-5 transition-all duration-200 focus:ring-2 focus:ring-[#0872b3] focus:border-[#0872b3] group-hover:border-[#0872b3]/30"
                          placeholder="Enter current password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-[#0872b3]/60 hover:text-[#0872b3] transition-colors p-1 rounded"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* New Password with Strength Indicator */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="newPassword"
                        className="text-sm font-medium text-[#0872b3] flex items-center gap-2"
                      >
                        New Password
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative group">
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm((prev) => ({
                              ...prev,
                              newPassword: e.target.value,
                            }))
                          }
                          className="px-4 py-5 transition-all duration-200 focus:ring-2 focus:ring-[#0872b3] focus:border-[#0872b3] group-hover:border-[#0872b3]/30"
                          placeholder="Create a strong password"
                          minLength={8}
                          required
                        />
                      </div>

                      {/* Password Strength Indicator */}
                      {passwordForm.newPassword && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-600">
                              Password strength:
                            </span>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  passwordForm.newPassword.length < 8
                                    ? "bg-red-400 w-1/4"
                                    : passwordForm.newPassword.length < 12
                                    ? "bg-yellow-400 w-2/4"
                                    : "bg-green-400 w-full"
                                }`}
                              />
                            </div>
                            <span
                              className={`font-medium ${
                                passwordForm.newPassword.length < 8
                                  ? "text-red-600"
                                  : passwordForm.newPassword.length < 12
                                  ? "text-yellow-600"
                                  : "text-green-600"
                              }`}
                            >
                              {passwordForm.newPassword.length < 8
                                ? "Weak"
                                : passwordForm.newPassword.length < 12
                                ? "Good"
                                : "Strong"}
                            </span>
                          </div>

                          {/* Password Requirements Checklist */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div
                              className={`flex items-center gap-1 ${
                                passwordForm.newPassword.length >= 8
                                  ? "text-green-600"
                                  : "text-gray-400"
                              }`}
                            >
                              {passwordForm.newPassword.length >= 8 ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <X className="w-3 h-3" />
                              )}
                              8+ characters
                            </div>
                            <div
                              className={`flex items-center gap-1 ${
                                /[A-Z]/.test(passwordForm.newPassword)
                                  ? "text-green-600"
                                  : "text-gray-400"
                              }`}
                            >
                              {/[A-Z]/.test(passwordForm.newPassword) ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <X className="w-3 h-3" />
                              )}
                              Uppercase
                            </div>
                            <div
                              className={`flex items-center gap-1 ${
                                /[0-9]/.test(passwordForm.newPassword)
                                  ? "text-green-600"
                                  : "text-gray-400"
                              }`}
                            >
                              {/[0-9]/.test(passwordForm.newPassword) ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <X className="w-3 h-3" />
                              )}
                              Number
                            </div>
                            <div
                              className={`flex items-center gap-1 ${
                                /[!@#$%^&*]/.test(passwordForm.newPassword)
                                  ? "text-green-600"
                                  : "text-gray-400"
                              }`}
                            >
                              {/[!@#$%^&*]/.test(passwordForm.newPassword) ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <X className="w-3 h-3" />
                              )}
                              Symbol
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password with Real-time Validation */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="confirmPassword"
                        className="text-sm font-medium text-[#0872b3] flex items-center gap-2"
                      >
                        Confirm New Password
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative group">
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm((prev) => ({
                              ...prev,
                              confirmPassword: e.target.value,
                            }))
                          }
                          className={`px-4 py-5 transition-all duration-200 focus:ring-2 group-hover:border-[#0872b3]/30 ${
                            passwordForm.confirmPassword &&
                            passwordForm.newPassword !==
                              passwordForm.confirmPassword
                              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                              : passwordForm.confirmPassword &&
                                passwordForm.newPassword ===
                                  passwordForm.confirmPassword
                              ? "border-green-300 focus:ring-green-500 focus:border-green-500"
                              : "focus:ring-[#0872b3] focus:border-[#0872b3]"
                          }`}
                          placeholder="Confirm your new password"
                          required
                        />
                        {/* Validation Icons */}
                        {passwordForm.confirmPassword && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {passwordForm.newPassword ===
                            passwordForm.confirmPassword ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <X className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Real-time Validation Message */}
                      {passwordForm.confirmPassword &&
                        passwordForm.newPassword !==
                          passwordForm.confirmPassword && (
                          <div className="flex items-center gap-2 text-sm text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            Passwords don&apos;t match
                          </div>
                        )}
                      {passwordForm.confirmPassword &&
                        passwordForm.newPassword ===
                          passwordForm.confirmPassword && (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <Check className="w-4 h-4" />
                            Passwords match
                          </div>
                        )}
                    </div>

                    {/* Enhanced Submit Button */}
                    <div className="flex items-center gap-4 pt-4">
                      <Button
                        type="submit"
                        disabled={
                          updatePasswordMutation.isPending ||
                          !passwordForm.currentPassword ||
                          !passwordForm.newPassword ||
                          !passwordForm.confirmPassword ||
                          passwordForm.newPassword !==
                            passwordForm.confirmPassword ||
                          passwordForm.newPassword.length < 8
                        }
                        className=" cursor-pointer py-3 bg-[#0872b3] text-white rounded-md font-medium text-base flex items-center justify-center gap-2 transition hover:bg-[#065d8f] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                      >
                        {updatePasswordMutation.isPending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Changing Password...
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            Change Password
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

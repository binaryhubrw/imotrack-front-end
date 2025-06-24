'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Pencil 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import * as Yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';
import { useUserDetails } from '@/lib/queries';
import type { UserDetails } from '@/types/next-auth';

const ProfileSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

const PasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string().min(8, 'Password must be at least 8 characters').required('New password is required'),
  confirmPassword: Yup.string().oneOf([Yup.ref('newPassword')], 'Passwords must match').required('Confirm password is required'),
});

const staticUserDetails = {
  id: 'c7b5a3d4-7a5b-4b1e-9d2c-2a8b9e6f3e7a',
  organization_id: 'org_123',
  email: 'nzelabeatblack37@gmail.com',
  phone: '+250788123456',
  status: 'active' as 'active',
  created_at: new Date().toISOString(),
  role_id: 'role_fleet',
  role: 'Fleetmanager',
  dob: '1990-01-01',
  first_name: 'Emmy',
  last_name: 'Mugisha',
  nid: '1199080012345012',
  gender: 'MALE' as 'MALE',
  street_address: 'KN 7 Ave, Kigali',
};

// Windows-style toggle switch CSS
// Place this at the top of the file for global effect
export const ToggleSwitchStyle = () => (
  <style jsx global>{`
    .win-toggle {
      position: relative;
      width: 44px;
      height: 24px;
      display: inline-block;
      border-radius: 9999px;
      background: transparent;
      vertical-align: middle;
    }
    .win-toggle input {
      opacity: 0;
      width: 100%;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      margin: 0;
      cursor: pointer;
      z-index: 2;
    }
    .win-toggle .track {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 9999px;
      background: #e0e0e0;
      transition: background 0.2s;
      z-index: 0;
    }
    .win-toggle input:checked ~ .track {
      background: #0b72d9;
    }
    .win-toggle .slider {
      position: absolute;
      top: 4px;
      left: 4px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #222;
      transition: left 0.2s, background 0.2s;
      z-index: 1;
      box-shadow: 0 1px 2px rgba(0,0,0,0.08);
    }
    .win-toggle input:checked ~ .slider {
      left: 24px;
      background: #fff;
    }
  `}</style>
);

export default function UserProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    marketing: false,
    activityDigest: true,
  });
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<UserDetails>({ ...staticUserDetails });

  // Dynamic fetching logic (uncomment when API is ready)
  const { data: apiUserDetails, isLoading: isUserLoading, isError, error } = useUserDetails(user?.id ?? '');
  // Use static data as fallback for now
  const userDetails = apiUserDetails || staticUserDetails;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    setFormData({
      ...userDetails,
      phone: userDetails.phone || '',
    });
  }, [userDetails]);

  // Only allow editing email (readonly)
  const handleProfileUpdate = async (
    values: { email: string },
    formikHelpers: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    // Only allow updating email if needed (but usually email is readonly)
    toast.success('Profile is up to date.');
    formikHelpers.setSubmitting(false);
  };

  // Password change mutation (calls /auth/change-password)
  const handlePasswordChange = async (
    values: { currentPassword: string; newPassword: string; confirmPassword: string },
    formikHelpers: { setSubmitting: (isSubmitting: boolean) => void; resetForm: () => void }
  ) => {
    setIsChangingPassword(true);
    try {
      await api.post('/auth/change-password', {
        current_password: values.currentPassword,
        new_password: values.newPassword,
      });
      toast.success('Password changed successfully');
      formikHelpers.resetForm();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
        // @ts-expect-error: dynamic error shape from axios
        toast.error(error.response.data.message || 'Failed to change password');
      } else {
        toast.error('Failed to change password');
      }
    } finally {
      setIsChangingPassword(false);
      formikHelpers.setSubmitting(false);
    }
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
    toast.success(`${key} notifications ${value ? 'enabled' : 'disabled'}`);
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToggleSwitchStyle />
      <div className="container mx-auto py-8 px-4 md:px-6">
        <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-3">
            <Card className="shadow-none bg-white/90 border-0 md:shadow-sm md:rounded-2xl">
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-200 via-blue-100 to-white shadow-lg flex items-center justify-center text-4xl font-bold text-blue-700 ring-2 ring-blue-100 transition-all duration-300">
                      {userDetails.first_name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="text-center">
                    <h2 className="text-xl font-semibold">{`${userDetails.first_name} ${userDetails.last_name}`}</h2>
                    <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                      {userDetails.role.charAt(0).toUpperCase() + userDetails.role.slice(1)}
                    </div>
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  <Button variant={activeTab === 'profile' ? 'default' : 'ghost'} className="w-full justify-start text-cyan-900" onClick={() => setActiveTab('profile')}>
                    <User className="h-4 w-4 mr-2" /> Personal  Information
                  </Button>
                  <Button variant={activeTab === 'security' ? 'default' : 'ghost'} className="w-full justify-start text-cyan-900" onClick={() => setActiveTab('security')}>
                    <Lock className="h-4 w-4 mr-2" /> Security
                  </Button>
                  <Button variant={activeTab === 'notifications' ? 'default' : 'ghost'} className="w-full justify-start text-cyan-900" onClick={() => setActiveTab('notifications')}>
                    <Bell className="h-4 w-4 mr-2" /> Notifications
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Main Content */}
          <div className="md:col-span-9">
            {activeTab === 'profile' && (
              <Card className="bg-white/90 border-0 shadow-none md:shadow-sm md:rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>View your personal information</CardDescription>
                  </div>
                  {!editMode && (
                    <Button size="icon" variant="ghost" onClick={() => setEditMode(true)} title="Edit Personal Information" className="hover:bg-blue-50 transition-colors">
                      <Pencil className="w-5 h-5" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <Formik
                    initialValues={{
                      firstName: formData.first_name,
                      lastName: formData.last_name,
                      email: formData.email,
                      phone: formData.phone,
                      nid: formData.nid,
                      gender: formData.gender,
                      dob: formData.dob,
                      role: formData.role,
                      streetAddress: formData.street_address,
                    }}
                    enableReinitialize
                    onSubmit={(values) => {
                      setFormData({ ...formData, ...values });
                      setEditMode(false);
                      toast.success('Profile updated successfully!');
                    }}
                  >
                    {({ handleSubmit, resetForm }) => (
                      <Form className={`space-y-6 transition-all duration-300 ${editMode ? 'bg-blue-50/40 rounded-xl p-2' : ''}`} onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Field as={Input} name="firstName" readOnly={!editMode} className={editMode ? 'focus:ring-2 focus:ring-blue-300 shadow-sm border border-gray-200 transition-all' : 'bg-gray-50 border-0'} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Field as={Input} name="lastName" readOnly={!editMode} className={editMode ? 'focus:ring-2 focus:ring-blue-300 shadow-sm border border-gray-200 transition-all' : 'bg-gray-50 border-0'} />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Field as={Input} name="email" type="email" readOnly={!editMode} className={editMode ? 'focus:ring-2 focus:ring-blue-300 shadow-sm border border-gray-200 transition-all' : 'bg-gray-50 border-0'} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Field as={Input} name="phone" readOnly={!editMode} className={editMode ? 'focus:ring-2 focus:ring-blue-300 shadow-sm border border-gray-200 transition-all' : 'bg-gray-50 border-0'} />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <Label htmlFor="nid">National ID</Label>
                              <Field as={Input} name="nid" readOnly={!editMode} className={editMode ? 'focus:ring-2 focus:ring-blue-300 shadow-sm border border-gray-200 transition-all' : 'bg-gray-50 border-0'} />
                            </div>
                             <div className="space-y-2">
                              <Label htmlFor="gender">Gender</Label>
                              <Field as={Input} name="gender" readOnly={!editMode} className={editMode ? 'focus:ring-2 focus:ring-blue-300 shadow-sm border border-gray-200 transition-all' : 'bg-gray-50 border-0'} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="dob">Date of Birth</Label>
                            <Field as={Input} name="dob" type="date" readOnly={!editMode} className={editMode ? 'focus:ring-2 focus:ring-blue-300 shadow-sm border border-gray-200 transition-all' : 'bg-gray-50 border-0'} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Field as={Input} name="role" readOnly className="bg-gray-50 border-0" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="streetAddress">Street Address</Label>
                          <Field as={Input} name="streetAddress" readOnly={!editMode} className={editMode ? 'focus:ring-2 focus:ring-blue-300 shadow-sm border border-gray-200 transition-all' : 'bg-gray-50 border-0'} />
                        </div>
                        {editMode && (
                          <div className="flex gap-4 justify-end pt-2">
                            <Button type="button" variant="outline" onClick={() => { resetForm(); setEditMode(false); }} className="transition-all">Cancel</Button>
                            <Button type="submit" variant="default" className="transition-all">Save</Button>
                          </div>
                        )}
                      </Form>
                    )}
                  </Formik>
                </CardContent>
              </Card>
            )}
            {activeTab === 'security' && (
              <Card className="bg-white/90 border-0 shadow-none md:shadow-sm md:rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Change your password</CardDescription>
                </CardHeader>
                <CardContent>
                  <Formik
                    initialValues={{ currentPassword: '', newPassword: '', confirmPassword: '' }}
                    validationSchema={PasswordSchema}
                    onSubmit={handlePasswordChange}
                  >
                    {({ isSubmitting, errors, touched }) => (
                      <Form className="space-y-6 transition-all duration-300 bg-blue-50/0 rounded-xl p-2">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Field
                            as={Input}
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            className={`transition-all ${errors.currentPassword && touched.currentPassword ? 'border-red-500' : 'border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-300 shadow-sm'}`}
                            placeholder="Enter your current password"
                          />
                          <ErrorMessage name="currentPassword" component="div" className="text-sm text-red-500" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Field
                            as={Input}
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            className={`transition-all ${errors.newPassword && touched.newPassword ? 'border-red-500' : 'border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-300 shadow-sm'}`}
                            placeholder="Enter your new password"
                          />
                          <ErrorMessage name="newPassword" component="div" className="text-sm text-red-500" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Field
                            as={Input}
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            className={`transition-all ${errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : 'border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-300 shadow-sm'}`}
                            placeholder="Confirm your new password"
                          />
                          <ErrorMessage name="confirmPassword" component="div" className="text-sm text-red-500" />
                        </div>
                        <Button type="submit" className="mt-4 transition-all" disabled={isSubmitting || isChangingPassword}>
                          {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                        </Button>
                      </Form>
                    )}
                  </Formik>
                </CardContent>
              </Card>
            )}
            {activeTab === 'notifications' && (
              <Card className="bg-white/90 border-0 shadow-none md:shadow-sm md:rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Manage your notification preferences</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex flex-col space-y-4 py-2">
                    <div className="flex items-center justify-between px-4 py-2">
                      <div>
                        <Label htmlFor="email-notifications" className="font-semibold">Email Notifications</Label>
                        <p className="text-sm text-gray-500">Receive important updates via email.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-base font-medium w-8 text-right ${notifications.email ? 'text-gray-800' : 'text-gray-400'}`}>{notifications.email ? 'On' : 'Off'}</span>
                        <label className="win-toggle">
                          <input
                            type="checkbox"
                            id="email-notifications"
                            checked={notifications.email}
                            onChange={e => handleNotificationChange('email', e.target.checked)}
                          />
                          <span className="slider" />
                          <span className="track" />
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2">
                      <div>
                        <Label htmlFor="push-notifications" className="font-semibold">Push Notifications</Label>
                        <p className="text-sm text-gray-500">Get real-time alerts on your device.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-base font-medium w-8 text-right ${notifications.push ? 'text-gray-800' : 'text-gray-400'}`}>{notifications.push ? 'On' : 'Off'}</span>
                        <label className="win-toggle">
                          <input
                            type="checkbox"
                            id="push-notifications"
                            checked={notifications.push}
                            onChange={e => handleNotificationChange('push', e.target.checked)}
                          />
                          <span className="slider" />
                          <span className="track" />
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2">
                      <div>
                        <Label htmlFor="marketing-notifications" className="font-semibold">Marketing Communications</Label>
                        <p className="text-sm text-gray-500">Receive promotional offers and newsletters.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-base font-medium w-8 text-right ${notifications.marketing ? 'text-gray-800' : 'text-gray-400'}`}>{notifications.marketing ? 'On' : 'Off'}</span>
                        <label className="win-toggle">
                          <input
                            type="checkbox"
                            id="marketing-notifications"
                            checked={notifications.marketing}
                            onChange={e => handleNotificationChange('marketing', e.target.checked)}
                          />
                          <span className="slider" />
                          <span className="track" />
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2">
                      <div>
                        <Label htmlFor="activity-digest" className="font-semibold">Activity Digest</Label>
                        <p className="text-sm text-gray-500">Get a weekly summary of your account activity.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-base font-medium w-8 text-right ${notifications.activityDigest ? 'text-gray-800' : 'text-gray-400'}`}>{notifications.activityDigest ? 'On' : 'Off'}</span>
                        <label className="win-toggle">
                          <input
                            type="checkbox"
                            id="activity-digest"
                            checked={notifications.activityDigest}
                            onChange={e => handleNotificationChange('activityDigest', e.target.checked)}
                          />
                          <span className="slider" />
                          <span className="track" />
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 
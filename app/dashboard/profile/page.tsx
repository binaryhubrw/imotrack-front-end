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
  Bell 
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import * as Yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';

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

  // Using static data instead of fetching
  const userDetails = staticUserDetails;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

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
    <div className="container mx-auto py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-700">
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
                  <User className="h-4 w-4 mr-2" /> Profile Information
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
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>View your account information</CardDescription>
              </CardHeader>
              <CardContent>
                <Formik
                  initialValues={{
                    firstName: userDetails.first_name,
                    lastName: userDetails.last_name,
                    email: userDetails.email,
                    phone: userDetails.phone,
                    nid: userDetails.nid,
                    gender: userDetails.gender,
                    dob: userDetails.dob,
                    role: userDetails.role,
                    streetAddress: userDetails.street_address,
                  }}
                  onSubmit={() => {}}
                  enableReinitialize
                >
                  {() => (
                    <Form className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Field as={Input} name="firstName" readOnly className="bg-gray-100 cursor-not-allowed" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Field as={Input} name="lastName" readOnly className="bg-gray-100 cursor-not-allowed" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Field as={Input} name="email" type="email" readOnly className="bg-gray-100 cursor-not-allowed" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Field as={Input} name="phone" readOnly className="bg-gray-100 cursor-not-allowed" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                          <Label htmlFor="nid">National ID</Label>
                          <Field as={Input} name="nid" readOnly className="bg-gray-100 cursor-not-allowed" />
                        </div>
                         <div className="space-y-2">
                          <Label htmlFor="gender">Gender</Label>
                          <Field as={Input} name="gender" readOnly className="bg-gray-100 cursor-not-allowed" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="dob">Date of Birth</Label>
                          <Field as={Input} name="dob" type="date" readOnly className="bg-gray-100 cursor-not-allowed" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                          <Field as={Input} name="role" readOnly className="bg-gray-100 cursor-not-allowed" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="streetAddress">Street Address</Label>
                        <Field as={Input} name="streetAddress" readOnly className="bg-gray-100 cursor-not-allowed" />
                      </div>
                    </Form>
                  )}
                </Formik>
              </CardContent>
            </Card>
          )}
          {activeTab === 'security' && (
            <Card>
              <CardHeader>
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
                    <Form className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Field
                          as={Input}
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          className={errors.currentPassword && touched.currentPassword ? 'border-red-500' : ''}
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
                          className={errors.newPassword && touched.newPassword ? 'border-red-500' : ''}
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
                          className={errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : ''}
                          placeholder="Confirm your new password"
                        />
                        <ErrorMessage name="confirmPassword" component="div" className="text-sm text-red-500" />
                      </div>
                      <Button type="submit" className="mt-4" disabled={isSubmitting || isChangingPassword}>
                        {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                      </Button>
                    </Form>
                  )}
                </Formik>
              </CardContent>
            </Card>
          )}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <Label htmlFor="email-notifications" className="font-semibold">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive important updates via email.</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notifications.email}
                    onCheckedChange={(value) => handleNotificationChange('email', value)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <Label htmlFor="push-notifications" className="font-semibold">Push Notifications</Label>
                    <p className="text-sm text-gray-500">Get real-time alerts on your device.</p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={notifications.push}
                    onCheckedChange={(value) => handleNotificationChange('push', value)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <Label htmlFor="marketing-notifications" className="font-semibold">Marketing Communications</Label>
                    <p className="text-sm text-gray-500">Receive promotional offers and newsletters.</p>
                  </div>
                  <Switch
                    id="marketing-notifications"
                    checked={notifications.marketing}
                    onCheckedChange={(value) => handleNotificationChange('marketing', value)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <Label htmlFor="activity-digest" className="font-semibold">Activity Digest</Label>
                    <p className="text-sm text-gray-500">Get a weekly summary of your account activity.</p>
                  </div>
                  <Switch
                    id="activity-digest"
                    checked={notifications.activityDigest}
                    onCheckedChange={(value) => handleNotificationChange('activityDigest', value)}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 

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
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-semibold">{user.email}</h2>
                  <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
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
                  initialValues={{ email: user.email }}
                  validationSchema={ProfileSchema}
                  onSubmit={handleProfileUpdate}
                  enableReinitialize
                >
                  {() => (
                    <Form className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                          <Field
                            as={Input}
                            id="email"
                            name="email"
                            type="email"
                            readOnly
                            className="pl-10 bg-gray-100 cursor-not-allowed"
                            placeholder="Your email address"
                          />
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                        <ErrorMessage name="email" component="div" className="text-sm text-red-500" />
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
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
                    </div>
                    <Switch checked={notifications.email} onCheckedChange={(checked) => handleNotificationChange('email', checked)} className={cn('data-[state=checked]:bg-cyan-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700', 'h-6 w-11')} />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications on your device</p>
                    </div>
                    <Switch checked={notifications.push} onCheckedChange={(checked) => handleNotificationChange('push', checked)} className={cn('data-[state=checked]:bg-cyan-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700', 'h-6 w-11')} />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div>
                      <p className="font-medium">Marketing Emails</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive marketing and promotional emails</p>
                    </div>
                    <Switch checked={notifications.marketing} onCheckedChange={(checked) => handleNotificationChange('marketing', checked)} className={cn('data-[state=checked]:bg-cyan-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700', 'h-6 w-11')} />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div>
                      <p className="font-medium">Activity Digest</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive weekly digest of account activity</p>
                    </div>
                    <Switch checked={notifications.activityDigest} onCheckedChange={(checked) => handleNotificationChange('activityDigest', checked)} className={cn('data-[state=checked]:bg-cyan-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700', 'h-6 w-11')} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 
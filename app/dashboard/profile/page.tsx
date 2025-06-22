'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as Yup from 'yup';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Bell, 
  Shield, 
  Upload,
  Camera
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const ProfileSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name is too short')
    .max(50, 'Name is too long')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^[0-9+\-\s()]*$/, 'Invalid phone number'),
});

const PasswordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required('Current password is required'),
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required'),
});

// Update the default avatar path to match backend
const DEFAULT_AVATAR = '/uploads/default-avatar.png';

export default function UserProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    marketing: false,
    activityDigest: true,
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleProfileUpdate = async (values: any, { setSubmitting }: any) => {
    try {
      setIsUpdating(true);
      
      // Format the data according to validation requirements
      const profileData = {
        name: values.name?.trim(),
        email: values.email?.trim().toLowerCase(),
        phone: values.phone?.trim() || undefined // Only send if it exists and is not empty
      };

      // Call the API to update the user profile
      const response = await customerApi.updateProfile(profileData);
      
      if (response.data.success) {
        // Update the user in context
        const updatedUser = {
          ...user,
          ...profileData
        };
        
        // Update local storage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        toast.success('Profile updated successfully');
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        validationErrors.forEach((err: any) => {
          toast.error(err.msg);
        });
      } else {
        toast.error(error.response?.data?.message || error.message || 'Failed to update profile');
      }
    } finally {
      setIsUpdating(false);
      setSubmitting(false);
    }
  };

  const handlePasswordChange = async (values: any, { setSubmitting, resetForm }: any) => {
    try {
      setIsUpdating(true);
      
      // Call the API to change the password
      const response = await auth.changePassword(values.currentPassword, values.newPassword);
      
      if (response.data.success) {
        toast.success('Password changed successfully');
        resetForm();
      } else {
        throw new Error(response.data.message || 'Failed to change password');
      }
    } catch (error: any) {
      console.error('Password change error:', error);
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        validationErrors.forEach((err: any) => {
          toast.error(err.msg);
        });
      } else {
        toast.error(error.response?.data?.message || error.message || 'Failed to change password');
      }
    } finally {
      setIsUpdating(false);
      setSubmitting(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    
    try {
      setIsUploadingAvatar(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      
      // Call the API to upload avatar
      const response = await customerApi.updateProfile(formData);
      
      if (response.data.success) {
        // Update the user in context
        const updatedUser = {
          ...user,
          avatar: response.data.data.avatar
        };
        
        // Update local storage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        toast.success('Avatar uploaded successfully');
        setAvatarFile(null); // Clear the file after successful upload
        setAvatarPreview(null); // Clear the preview
      } else {
        throw new Error(response.data.message || 'Failed to upload avatar');
      }
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Here you would call your API to update notification preferences
    toast.success(`${key} notifications ${value ? 'enabled' : 'disabled'}`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
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
                  <Avatar className="h-24 w-24">
                    <AvatarImage 
                      src={avatarPreview || (user?.avatar ? `${process.env.NEXT_PUBLIC_API_URL}${user.avatar}` : DEFAULT_AVATAR)} 
                      alt={user?.name || 'User'} 
                    />
                    <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <label 
                    htmlFor="avatar-upload" 
                    className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                    <input 
                      id="avatar-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleAvatarChange} 
                    />
                  </label>
                </div>
                {avatarFile && (
                  <Button 
                    size="sm" 
                    onClick={handleAvatarUpload}
                    disabled={isUploadingAvatar}
                    className="mt-2"
                  >
                    {isUploadingAvatar ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Avatar
                      </>
                    )}
                  </Button>
                )}
                <div className="text-center">
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-2">
                <Button 
                  variant={activeTab === 'profile' ? 'default' : 'ghost'} 
                  className="w-full justify-start text-cyan-900" 
                  onClick={() => setActiveTab('profile')}
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile Information
                </Button>
                <Button 
                  variant={activeTab === 'security' ? 'default' : 'ghost'} 
                  className="w-full justify-start text-cyan-900" 
                  onClick={() => setActiveTab('security')}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Security
                </Button>
                <Button 
                  variant={activeTab === 'notifications' ? 'default' : 'ghost'} 
                  className="w-full justify-start text-cyan-900" 
                  onClick={() => setActiveTab('notifications')}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
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
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Formik
                  initialValues={{
                    name: user.name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                  }}
                  validationSchema={ProfileSchema}
                  onSubmit={handleProfileUpdate}
                >
                  {({ isSubmitting, errors, touched }) => (
                    <Form className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <div className="relative">
                          <Field
                            as={Input}
                            id="name"
                            name="name"
                            className={errors.name && touched.name ? "pl-10 border-red-500" : "pl-10"}
                            placeholder="Your full name"
                          />
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                        <ErrorMessage name="name" component="div" className="text-sm text-red-500" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                          <Field
                            as={Input}
                            id="email"
                            name="email"
                            type="email"
                            className={errors.email && touched.email ? "pl-10 border-red-500" : "pl-10"}
                            placeholder="Your email address"
                          />
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                        <ErrorMessage name="email" component="div" className="text-sm text-red-500" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number (Optional)</Label>
                        <div className="relative">
                          <Field
                            as={Input}
                            id="phone"
                            name="phone"
                            className={errors.phone && touched.phone ? "pl-10 border-red-500" : "pl-10"}
                            placeholder="Your phone number"
                          />
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                        <ErrorMessage name="phone" component="div" className="text-sm text-red-500" />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="mt-4"
                        disabled={isSubmitting || isUpdating}
                      >
                        {isUpdating ? 'Saving Changes...' : 'Save Changes'}
                      </Button>
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
                <CardDescription>
                  Update your password and security preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Formik
                  initialValues={{
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  }}
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
                          className={errors.currentPassword && touched.currentPassword ? "border-red-500" : ""}
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
                          className={errors.newPassword && touched.newPassword ? "border-red-500" : ""}
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
                          className={errors.confirmPassword && touched.confirmPassword ? "border-red-500" : ""}
                          placeholder="Confirm your new password"
                        />
                        <ErrorMessage name="confirmPassword" component="div" className="text-sm text-red-500" />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="mt-4"
                        disabled={isSubmitting || isUpdating}
                      >
                        {isUpdating ? 'Changing Password...' : 'Change Password'}
                      </Button>
                    </Form>
                  )}
                </Formik>
                
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Two-factor authentication</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Button variant="outline">
                      <Shield className="h-4 w-4 mr-2" />
                      Setup 2FA
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Manage how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.email} 
                      onCheckedChange={(checked) => handleNotificationChange('email', checked)} 
                      className={cn(
                        "data-[state=checked]:bg-cyan-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700",
                        "h-6 w-11"
                      )}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive notifications on your device
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.push} 
                      onCheckedChange={(checked) => handleNotificationChange('push', checked)} 
                      className={cn(
                        "data-[state=checked]:bg-cyan-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700",
                        "h-6 w-11"
                      )}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div>
                      <p className="font-medium">Marketing Emails</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive marketing and promotional emails
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.marketing} 
                      onCheckedChange={(checked) => handleNotificationChange('marketing', checked)} 
                      className={cn(
                        "data-[state=checked]:bg-cyan-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700",
                        "h-6 w-11"
                      )}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div>
                      <p className="font-medium">Activity Digest</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive weekly digest of account activity
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.activityDigest} 
                      onCheckedChange={(checked) => handleNotificationChange('activityDigest', checked)} 
                      className={cn(
                        "data-[state=checked]:bg-cyan-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700",
                        "h-6 w-11"
                      )}
                    />
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
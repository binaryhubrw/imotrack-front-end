import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Building, MapPin, Search, Filter, Save, RotateCcw, Eye, Edit, Trash2, Plus } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

// Type for the position access structure
type PositionAccess = {
  organizations: { create: boolean; view: boolean; update: boolean; delete: boolean };
  units: { create: boolean; view: boolean; update: boolean; delete: boolean };
  positions: { create: boolean; view: boolean; update: boolean; delete: boolean };
  users: { create: boolean; view: boolean; update: boolean; delete: boolean };
};

const PermissionAccessPage = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<PositionAccess>({
    organizations: { create: false, view: true, update: false, delete: false },
    units: { create: false, view: true, update: false, delete: false },
    positions: { create: false, view: true, update: false, delete: false },
    users: { create: false, view: true, update: false, delete: false }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isModified, setIsModified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load current user's position access on component mount
  useEffect(() => {
    if (user?.position?.position_access) {
      setPermissions(user.position.position_access);
    }
  }, [user]);

  const moduleConfig = {
    organizations: {
      icon: Building,
      title: 'Organizations',
      description: 'Manage organizational structures and hierarchy',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      route: '/dashboard/shared_pages/organizations'
    },
    units: {
      icon: MapPin,
      title: 'Units',
      description: 'Handle operational units and departments',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      route: '/dashboard/shared_pages/units'
    },
    positions: {
      icon: Shield,
      title: 'Positions',
      description: 'Configure roles and position hierarchies',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      route: '/dashboard/shared_pages/position_access'
    },
    users: {
      icon: Users,
      title: 'Users',
      description: 'Manage user accounts and profiles',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      route: '/dashboard/shared_pages/users'
    }
  };

  const actionConfig = {
    create: { 
      label: 'Create', 
      color: 'bg-green-100 text-green-800',
      icon: Plus,
      description: 'Add new records'
    },
    view: { 
      label: 'View', 
      color: 'bg-blue-100 text-blue-800',
      icon: Eye,
      description: 'Read and browse data'
    },
    update: { 
      label: 'Update', 
      color: 'bg-yellow-100 text-yellow-800',
      icon: Edit,
      description: 'Modify existing records'
    },
    delete: { 
      label: 'Delete', 
      color: 'bg-red-100 text-red-800',
      icon: Trash2,
      description: 'Remove records'
    }
  };

  const handlePermissionChange = (module: keyof PositionAccess, action: string, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: value
      }
    }));
    setIsModified(true);
  };

  const handleSelectAll = (module: keyof PositionAccess, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [module]: {
        create: value,
        view: value,
        update: value,
        delete: value
      }
    }));
    setIsModified(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to save permissions
      // await updatePositionPermissions(user.position.position_id, permissions);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Permissions updated successfully!');
      setIsModified(false);
    } catch (error) {
      console.error('Failed to save permissions:', error);
      toast.error('Failed to save permissions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (user?.position?.position_access) {
      setPermissions(user.position.position_access);
    } else {
      setPermissions({
        organizations: { create: false, view: true, update: false, delete: false },
        units: { create: false, view: true, update: false, delete: false },
        positions: { create: false, view: true, update: false, delete: false },
        users: { create: false, view: true, update: false, delete: false }
      });
    }
    setIsModified(false);
  };

  const filteredModules = Object.entries(moduleConfig).filter(([, config]) =>
    config.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const PermissionCard = ({ moduleKey, config }: { moduleKey: keyof PositionAccess, config: typeof moduleConfig[keyof typeof moduleConfig] }) => {
    const Icon = config.icon;
    const modulePermissions = permissions[moduleKey];
    const hasAllPermissions = Object.values(modulePermissions).every(Boolean);
    const hasAnyPermission = Object.values(modulePermissions).some(Boolean);
    const permissionCount = Object.values(modulePermissions).filter(Boolean).length;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${config.bgColor} ${config.color}`}>
              <Icon size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{config.title}</h3>
              <p className="text-sm text-gray-500">{config.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={hasAnyPermission ? "default" : "secondary"}>
              {permissionCount}/4 permissions
            </Badge>
            <div className="flex items-center gap-2">
              <Label htmlFor={`select-all-${moduleKey}`} className="text-sm font-medium">
                Select All
              </Label>
              <Switch
                id={`select-all-${moduleKey}`}
                checked={hasAllPermissions}
                onCheckedChange={(checked) => handleSelectAll(moduleKey, checked)}
              />
            </div>
          </div>
        </div>

        <Separator className="mb-4" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(actionConfig).map(([action, actionData]) => {
            const ActionIcon = actionData.icon;
            return (
              <div key={action} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <ActionIcon size={16} className="text-gray-600" />
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${actionData.color}`}>
                      {actionData.label}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{actionData.description}</p>
                  </div>
                </div>
                <Switch
                  checked={modulePermissions[action as keyof typeof modulePermissions]}
                  onCheckedChange={(checked) => handlePermissionChange(moduleKey, action, checked)}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${(permissionCount / 4) * 100}%` }}
            />
          </div>
          <span className="text-sm text-gray-600 font-medium">
            {permissionCount}/4
          </span>
        </div>
      </motion.div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <Skeleton className="h-8 w-80 mb-2" />
                <Skeleton className="h-4 w-64 mb-2" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </div>

          {/* Controls Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-10 w-48 mb-6" />
            <div className="flex flex-col sm:flex-row gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>

          {/* Permission Cards Skeleton */}
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div>
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="w-10 h-6 rounded" />
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, actionIndex) => (
                      <div key={actionIndex} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-4 h-4" />
                          <div>
                            <Skeleton className="h-4 w-16 mb-1" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                        <Skeleton className="w-10 h-6 rounded" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Skeleton className="flex-1 h-2 rounded-full" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="text-blue-600" size={32} />
                Permission Access Management
              </h1>
              <p className="text-gray-600 mt-2">
                Configure permissions for <span className="font-semibold text-blue-600">{user.position.position_name}</span> position
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>Organization: {user.organization.organization_name}</span>
                <span>Unit: {user.unit.unit_name}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isModified && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-amber-600"
                >
                  <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Unsaved changes</span>
                </motion.div>
              )}
              <Button variant="outline" onClick={handleReset} disabled={isLoading}>
                <RotateCcw size={16} className="mr-2" />
                Reset
              </Button>
              <Button 
                onClick={handleSave} 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!isModified || isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Tabs defaultValue="permissions" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-3">
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="audit">Audit Log</TabsTrigger>
            </TabsList>
            
            <TabsContent value="permissions" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    placeholder="Search modules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter size={16} />
                  Filter
                </Button>
              </div>

              {/* Permission Cards */}
              <div className="grid gap-6">
                {filteredModules.map(([moduleKey, config]) => (
                  <PermissionCard 
                    key={moduleKey} 
                    moduleKey={moduleKey as keyof PositionAccess} 
                    config={config} 
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(moduleConfig).map(([moduleKey, config]) => {
                  const modulePermissions = permissions[moduleKey as keyof PositionAccess];
                  const permissionCount = Object.values(modulePermissions).filter(Boolean).length;
                  const Icon = config.icon;
                  
                  return (
                    <Card key={moduleKey} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${config.bgColor} ${config.color}`}>
                            <Icon size={20} />
                          </div>
                          <CardTitle className="text-lg">{config.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Active Permissions</span>
                            <Badge variant="outline">{permissionCount}/4</Badge>
                          </div>
                          <div className="space-y-2">
                            {Object.entries(actionConfig).map(([action, actionData]) => {
                              const isEnabled = modulePermissions[action as keyof typeof modulePermissions];
                              return (
                                <div key={action} className="flex items-center justify-between text-sm">
                                  <span className={isEnabled ? "text-gray-900" : "text-gray-400"}>
                                    {actionData.label}
                                  </span>
                                  <div className={`w-2 h-2 rounded-full ${isEnabled ? "bg-green-500" : "bg-gray-300"}`} />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="audit" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Permission Change History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Shield size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>Audit trail will be available here once permission changes are implemented.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default PermissionAccessPage;
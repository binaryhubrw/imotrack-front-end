"use client";

import React from "react";
import {
  Car,
  FileText,
  TrendingUp,
  Calendar,
  Users,
  AlertCircle,
  Clock,
  Building,
  MapPin,
  Shield,
  Settings,
  Activity,
  Plus,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkeletonDashboard } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useDashboard } from "@/hooks/DashboardContext";
import { useRouter } from "next/navigation";

// Icon mapping
const iconMap = {
  Building,
  MapPin,
  Users,
  Shield,
  Car,
  Settings,
  FileText,
  Activity,
  Plus,
  Eye,
  AlertTriangle,
};

type StatCardProps = {
  icon: React.ElementType;
  title: string;
  value: string | number;
  subtitle?: string;
  bgColor: string;
  textColor: string;
  trend?: string;
  onClick?: () => void;
};

const StatCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  bgColor,
  textColor,
  trend,
  onClick,
}: StatCardProps) => (
  <div
    className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer group transform hover:-translate-y-1"
    onClick={onClick}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`w-5 h-5 ${textColor}`} />
          <p className="text-gray-600 text-sm font-medium">{title}</p>
        </div>
        <p className={`text-3xl font-bold ${textColor} mb-1`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span className="text-xs text-green-600 font-medium">{trend}</span>
          </div>
        )}
      </div>
      <div
        className={`p-3 rounded-xl ${bgColor} group-hover:scale-110 transition-transform duration-200`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const ActivityIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'user_created':
      return <Users className="w-4 h-4" />;
    case 'vehicle_added':
      return <Car className="w-4 h-4" />;
    case 'organization_updated':
      return <Building className="w-4 h-4" />;
    case 'position_assigned':
      return <Shield className="w-4 h-4" />;
    case 'unit_created':
      return <MapPin className="w-4 h-4" />;
    case 'vehicle_issue_reported':
      return <AlertTriangle className="w-4 h-4" />;
    default:
      return <Activity className="w-4 h-4" />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'user_created':
      return 'text-blue-600';
    case 'vehicle_added':
      return 'text-green-600';
    case 'organization_updated':
      return 'text-purple-600';
    case 'position_assigned':
      return 'text-orange-600';
    case 'unit_created':
      return 'text-teal-600';
    case 'vehicle_issue_reported':
      return 'text-yellow-600';
    default:
      return 'text-gray-600';
  }
};

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return past.toLocaleDateString();
};

export default function MainDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { stats, recentActivity, quickActions, isLoading, error } = useDashboard();
  const router = useRouter();

  // Map stat card titles to routes
  const statCardRoutes: Record<string, string> = {
    "Total Users": "/dashboard/shared_pages/users",
    "Organizations": "/dashboard/shared_pages/organizations",
    "Units": "/dashboard/shared_pages/units",
    "Positions": "/dashboard/shared_pages/positions",
    "Fleet Vehicles": "/dashboard/shared_pages/vehicles",
    "Vehicle Models": "/dashboard/shared_pages/vehicle-models",
    "Reservations": "/dashboard/shared_pages/reservations",
    "Vehicle Issues": "/dashboard/shared_pages/vehicle-issues",
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-7xl mx-auto">
          <SkeletonDashboard />
        </div>
      </div>
    );
  }

  if (error) {
    toast.error(`Dashboard error: ${error}`);
  }

  const getDashboardCards = () => {
    const cards = [];
    const positionAccess = user.position.position_access;

    // Always show users if they have access
    if (positionAccess.users?.view) {
      cards.push({
        icon: Users,
        title: "Total Users",
        value: stats.totalUsers,
        bgColor: "bg-blue-600",
        textColor: "text-blue-600",
        subtitle: "Active users in system",
      });
    }

    // Organizations
    if (positionAccess.organizations?.view) {
      cards.push({
        icon: Building,
        title: "Organizations",
        value: stats.totalOrganizations,
        bgColor: "bg-purple-600",
        textColor: "text-purple-600",
        subtitle: "Registered organizations",
      });
    }

    // Units
    if (positionAccess.units?.view) {
      cards.push({
        icon: MapPin,
        title: "Units",
        value: stats.totalUnits,
        bgColor: "bg-green-600",
        textColor: "text-green-600",
        subtitle: "Organizational units",
      });
    }

    // Positions
    if (positionAccess.positions?.view) {
      cards.push({
        icon: Shield,
        title: "Positions",
        value: stats.totalPositions,
        bgColor: "bg-orange-600",
        textColor: "text-orange-600",
        subtitle: "Total positions",
      });
    }

    // Vehicles
    if (positionAccess.vehicles?.view) {
      cards.push({
        icon: Car,
        title: "Fleet Vehicles",
        value: stats.totalVehicles,
        bgColor: "bg-indigo-600",
        textColor: "text-indigo-600",
        subtitle: `${stats.activeVehicles} active, ${stats.inactiveVehicles} inactive`,
      });
    }

    // Vehicle Models
    if (positionAccess.vehicleModels?.view) {
      cards.push({
        icon: Settings,
        title: "Vehicle Models",
        value: stats.totalVehicleModels,
        bgColor: "bg-teal-600",
        textColor: "text-teal-600",
        subtitle: "Available models",
      });
    }

    if (positionAccess.vehicleIssues?.view) {
      cards.push({
        icon: AlertCircle,
        title: "Vehicle Issues",
        value: stats.totalVehicleIssues,
        bgColor: "bg-red-600",
        textColor: "text-red-600",
        subtitle: "Total issues",
      });
    }

    // Reservations
    if (positionAccess.reservations?.view) {
      cards.push({
        icon: FileText,
        title: "Reservations",
        value: stats.totalReservations,
        bgColor: "bg-pink-600",
        textColor: "text-pink-600",
        subtitle: "Total reservations",
      });
    }

    return cards;
  };

  const dashboardCards = getDashboardCards();

  // Check if user has any permissions at all
  const hasAnyPermissions = Object.values(user.position.position_access as Record<string, Record<string, boolean>>).some(
    (module) => Object.values(module).some(Boolean)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user.user.first_name}!
            </h1>
            <p className="text-gray-600 mt-1">
              {user.position.position_name} • {user.organization.organization_name} • {user.unit.unit_name}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {dashboardCards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardCards.map((card, index) => (
              <StatCard
                key={index}
                {...card}
                onClick={() => {
                  const route = statCardRoutes[card.title];
                  if (route) router.push(route);
                }}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <Shield className="w-16 h-16 text-gray-300" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Dashboard Access</h3>
                <p className="text-gray-600">
                  You don&apos;t have permission to view any dashboard statistics. 
                  Contact your administrator to get access to relevant modules.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Loading overlay for stats */}
        {isLoading && dashboardCards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Content Grid - Only show if user has any permissions */}
        {hasAnyPermissions && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {quickActions.length > 0 ? (
                    quickActions.map((action) => {
                      const IconComponent = iconMap[action.icon as keyof typeof iconMap] || Activity;
                      return (
                        <button
                          key={action.id}
                          onClick={() => router.push(action.href)}
                          className="block w-full text-left p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors bg-white hover:bg-gray-50"
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${action.color}`}>
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{action.title}</h4>
                              <p className="text-sm text-gray-500">{action.description}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No quick actions available</p>
                      <p className="text-sm">Check your position permissions</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                          <div className={`p-2 rounded-lg bg-white ${getActivityColor(activity.type)}`}>
                            <ActivityIcon type={activity.type} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                            <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No recent activity</p>
                      <p className="text-sm">Activity will appear here as changes are made</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Position Access Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Your Position Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasAnyPermissions ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(user.position.position_access as Record<string, Record<string, boolean>>).map(([module, permissions]) => {
                  const permissionCount = Object.values(permissions).filter(Boolean).length;
                  const totalPermissions = Object.keys(permissions).length;
                  const hasAnyPermission = permissionCount > 0;
                  
                  return (
                    <div key={module} className={`p-4 rounded-lg border ${hasAnyPermission ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 capitalize">{module}</h4>
                        <Badge variant={hasAnyPermission ? "default" : "secondary"}>
                          {permissionCount}/{totalPermissions}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {Object.entries(permissions).map(([action, hasPermission]) => (
                          <div key={action} className="flex items-center justify-between text-sm">
                            <span className={hasPermission ? "text-gray-900" : "text-gray-400"}>
                              {action}
                            </span>
                            <div className={`w-2 h-2 rounded-full ${hasPermission ? "bg-green-500" : "bg-gray-300"}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Permissions Assigned</h3>
                <p className="text-gray-600">
                  Your position doesn&apos;t have any permissions assigned. 
                  Contact your administrator to get the appropriate access levels.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
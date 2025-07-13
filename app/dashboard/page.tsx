"use client";

import React from "react";
import {
  Car,
  FileText,
  TrendingUp,
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  Building,
  MapPin,
  Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type StatCardProps = {
  icon: React.ElementType;
  title: string;
  value: string;
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

export default function MainDashboard() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Skeleton className="w-5 h-5 rounded" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-8 w-16 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="w-12 h-12 rounded-xl" />
                </div>
              </div>
            ))}
          </div>

          {/* Content Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                        <Skeleton className="w-8 h-8 rounded-lg" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-48 mb-1" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Position Access Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                    <div className="space-y-1">
                      {Array.from({ length: 4 }).map((_, actionIndex) => (
                        <div key={actionIndex} className="flex items-center justify-between">
                          <Skeleton className="h-3 w-12" />
                          <Skeleton className="w-2 h-2 rounded-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Sample data based on user's position access
  const getDashboardStats = () => {
    const positionAccess = user.position.position_access;
    const stats = [];

    // Always show basic stats
    stats.push({
      icon: Users,
      title: "Total Users",
      value: "1,234",
      bgColor: "bg-blue-600",
      textColor: "text-blue-600",
      trend: "+12 this month",
    });

    if (positionAccess.organizations.view) {
      stats.push({
        icon: Building,
        title: "Organizations",
        value: "5",
        bgColor: "bg-purple-600",
        textColor: "text-purple-600",
        trend: "+1 this quarter",
      });
    }

    if (positionAccess.units.view) {
      stats.push({
        icon: MapPin,
        title: "Units",
        value: "25",
        bgColor: "bg-green-600",
        textColor: "text-green-600",
        trend: "+3 this month",
      });
    }

    if (positionAccess.positions.view) {
      stats.push({
        icon: Shield,
        title: "Positions",
        value: "15",
        bgColor: "bg-orange-600",
        textColor: "text-orange-600",
        trend: "+2 this month",
      });
    }

    // Add vehicle-related stats for fleet managers
    if (user.position.position_name.toLowerCase().includes('fleet')) {
      stats.push({
        icon: Car,
        title: "Total Vehicles",
        value: "45",
        bgColor: "bg-indigo-600",
        textColor: "text-indigo-600",
        trend: "+5 this month",
      });
    }

    // Add request-related stats for staff
    if (user.position.position_name.toLowerCase().includes('staff')) {
      stats.push({
        icon: FileText,
        title: "My Requests",
        value: "8",
        bgColor: "bg-teal-600",
        textColor: "text-teal-600",
        trend: "+2 this week",
      });
    }

    return stats;
  };

  const getRecentActivity = () => {
    const activities = [
      {
        id: 1,
        type: "user_login",
        message: "User logged in successfully",
        time: "2 minutes ago",
        icon: CheckCircle,
        color: "text-green-600",
      },
      {
        id: 2,
        type: "permission_update",
        message: "Position access permissions updated",
        time: "1 hour ago",
        icon: Shield,
        color: "text-blue-600",
      },
      {
        id: 3,
        type: "data_access",
        message: "Accessed organizations module",
        time: "3 hours ago",
        icon: Building,
        color: "text-purple-600",
      },
    ];

    return activities;
  };

  const getQuickActions = () => {
    const actions = [];
    const positionAccess = user.position.position_access;

    if (positionAccess.organizations.create) {
      actions.push({
        title: "Add Organization",
        description: "Create a new organization",
        icon: Building,
        href: "/dashboard/shared_pages/organizations",
        color: "bg-blue-100 text-blue-800",
      });
    }

    if (positionAccess.users.create) {
      actions.push({
        title: "Add User",
        description: "Create a new user account",
        icon: Users,
        href: "/dashboard/shared_pages/users",
        color: "bg-green-100 text-green-800",
      });
    }

    if (positionAccess.positions.view) {
      actions.push({
        title: "Manage Permissions",
        description: "Configure position access",
        icon: Shield,
        href: "/dashboard/shared_pages/position_access",
        color: "bg-purple-100 text-purple-800",
      });
    }

    return actions;
  };

  const stats = getDashboardStats();
  const activities = getRecentActivity();
  const quickActions = getQuickActions();

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
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Main Content Grid */}
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
                  quickActions.map((action, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${action.color}`}>
                          <action.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{action.title}</h4>
                          <p className="text-sm text-gray-500">{action.description}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No quick actions available for your position</p>
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
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <div className={`p-2 rounded-lg bg-white ${activity.color}`}>
                        <activity.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Position Access Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Your Position Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(user.position.position_access).map(([module, permissions]) => {
                const permissionCount = Object.values(permissions).filter(Boolean).length;
                const totalPermissions = Object.keys(permissions).length;
                
                return (
                  <div key={module} className="p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 capitalize">{module}</h4>
                      <Badge variant="outline">{permissionCount}/{totalPermissions}</Badge>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

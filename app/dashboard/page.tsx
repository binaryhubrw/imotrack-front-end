"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Car,
  FileText,
  TrendingUp,
  TrendingDown,
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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { SkeletonDashboard } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useDashboard } from "@/hooks/DashboardContext";
import { useRouter } from "next/navigation";

/* Staggered load animation config */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: i * 0.05 },
  }),
  exit: { opacity: 0 },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};
const slideInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};
const slideInRight = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

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
  /** Tailwind gradient classes e.g. "from-orange-400 to-rose-500" */
  gradient: string;
  trend?: string;
  trendUp?: boolean;
  onClick?: () => void;
};

/** Decorative circles overlay for gradient cards */
const CardDecoration = () => (
  <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
    <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
    <div className="absolute top-1/2 -left-8 w-24 h-24 rounded-full bg-white/10" />
    <div className="absolute -bottom-4 right-1/3 w-20 h-20 rounded-full bg-white/5" />
    <div className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full bg-white/8" />
  </div>
);

const StatCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  gradient,
  trend,
  trendUp = true,
  onClick,
}: StatCardProps) => (
  <div
    className={`relative rounded-xl shadow-lg p-6 overflow-hidden bg-gradient-to-br ${gradient} transition-all duration-300 cursor-pointer group hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.99]`}
    onClick={onClick}
  >
    <CardDecoration />
    <div className="relative flex flex-col h-full min-h-[120px]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-white/95 text-sm font-medium">{title}</p>
        <div className="flex-shrink-0 p-2 rounded-lg bg-white/20 backdrop-blur-sm">
          <Icon className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
      </div>
      <p className="text-white text-2xl sm:text-3xl font-bold mt-3 tracking-tight">
        {value}
      </p>
      <div className="mt-auto pt-3 space-y-0.5">
        {subtitle && (
          <p className="text-white/80 text-xs font-medium">{subtitle}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1">
            {trendUp ? (
              <TrendingUp className="w-3.5 h-3.5 text-white/90" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-white/90" />
            )}
            <span className="text-xs font-medium text-white/90">{trend}</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

const ActivityIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "user_created":
      return <Users className="w-4 h-4" />;
    case "vehicle_added":
      return <Car className="w-4 h-4" />;
    case "organization_updated":
      return <Building className="w-4 h-4" />;
    case "position_assigned":
      return <Shield className="w-4 h-4" />;
    case "unit_created":
      return <MapPin className="w-4 h-4" />;
    case "vehicle_issue_reported":
      return <AlertTriangle className="w-4 h-4" />;
    default:
      return <Activity className="w-4 h-4" />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case "user_created":
      return "text-blue-600";
    case "vehicle_added":
      return "text-green-600";
    case "organization_updated":
      return "text-purple-600";
    case "position_assigned":
      return "text-orange-600";
    case "unit_created":
      return "text-teal-600";
    case "vehicle_issue_reported":
      return "text-yellow-600";
    default:
      return "text-gray-600";
  }
};

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return past.toLocaleDateString();
};

export default function MainDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { stats, recentActivity, quickActions, isLoading, error } =
    useDashboard();
  const router = useRouter();
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 5;

  // Map stat card titles to routes
  const statCardRoutes: Record<string, string> = {
    "Total Users": "/dashboard/shared_pages/users",
    Organizations: "/dashboard/shared_pages/organizations",
    Units: "/dashboard/shared_pages/units",
    Positions: "/dashboard/shared_pages/positions",
    "Fleet Vehicles": "/dashboard/shared_pages/vehicles",
    "Vehicle Models": "/dashboard/shared_pages/vehicle-model",
    Reservations: "/dashboard/shared_pages/reservations",
    "Vehicle Issues": "/dashboard/shared_pages/vehicle-issues",
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen w-full min-w-0 max-w-full overflow-x-hidden bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-7xl mx-auto w-full min-w-0">
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
        gradient: "from-sky-400 to-blue-600",
        subtitle: "Active users in system",
      });
    }

    // Organizations
    if (positionAccess.organizations?.view) {
      cards.push({
        icon: Building,
        title: "Organizations",
        value: stats.totalOrganizations,
        gradient: "from-violet-400 to-purple-600",
        subtitle: "Registered organizations",
      });
    }

    // Units
    if (positionAccess.units?.view) {
      cards.push({
        icon: MapPin,
        title: "Units",
        value: stats.totalUnits,
        gradient: "from-emerald-400 to-teal-600",
        subtitle: "Organizational units",
      });
    }

    // Positions
    if (positionAccess.positions?.view) {
      cards.push({
        icon: Shield,
        title: "Positions",
        value: stats.totalPositions,
        gradient: "from-amber-400 to-orange-500",
        subtitle: "Total positions",
      });
    }

    // Vehicles
    if (positionAccess.vehicles?.view) {
      cards.push({
        icon: Car,
        title: "Fleet Vehicles",
        value: stats.totalVehicles,
        gradient: "from-indigo-400 to-indigo-600",
        subtitle: `${stats.activeVehicles} active, ${stats.inactiveVehicles} inactive`,
      });
    }

    // Vehicle Models
    if (positionAccess.vehicleModels?.view) {
      cards.push({
        icon: Settings,
        title: "Vehicle Models",
        value: stats.totalVehicleModels,
        gradient: "from-cyan-400 to-teal-600",
        subtitle: "Available models",
      });
    }

    if (positionAccess.vehicleIssues?.view) {
      cards.push({
        icon: AlertCircle,
        title: "Vehicle Issues",
        value: stats.totalVehicleIssues,
        gradient: "from-rose-400 to-red-600",
        subtitle: "Total issues",
      });
    }

    // Reservations
    if (positionAccess.reservations?.view) {
      cards.push({
        icon: FileText,
        title: "Reservations",
        value: stats.totalReservations,
        gradient: "from-pink-400 to-rose-500",
        subtitle: "Total reservations",
      });
    }

    return cards;
  };

  const dashboardCards = getDashboardCards();

  // Check if user has any permissions at all
  const hasAnyPermissions = Object.values(
    user.position.position_access as Record<string, Record<string, boolean>>
  ).some((module) => Object.values(module).some(Boolean));

  return (
    <motion.div
      className="min-h-screen w-full min-w-0 max-w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/40 p-4 md:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <div className="max-w-7xl mx-auto w-full min-w-0 space-y-6">
        {/* Header - animate on load */}
        <motion.div
          className="flex flex-wrap items-center justify-between gap-4"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Welcome back, {user.user.first_name}!
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              {user.position.position_name} •{" "}
              {user.organization.organization_name} • {user.unit.unit_name}
            </p>
          </div>
          <motion.div
            className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-gray-100 shadow-md"
            whileHover={{ scale: 1.02, boxShadow: "0 10px 40px -10px rgba(0,0,0,0.12)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium text-gray-700">
              {new Date().toLocaleDateString()}
            </span>
          </motion.div>
        </motion.div>

        {/* Stats Cards - stagger on load (cards themselves unchanged) */}
        {dashboardCards.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {dashboardCards.map((card, index) => (
              <motion.div key={index} variants={itemVariants}>
                <StatCard
                  {...card}
                  onClick={() => {
                    const route = statCardRoutes[card.title];
                    if (route) router.push(route);
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Card className="p-8 text-center border border-gray-200 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-2xl bg-gray-100/80">
                  <Shield className="w-16 h-16 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Dashboard Access
                  </h3>
                  <p className="text-gray-600 text-sm max-w-md mx-auto">
                    You don&apos;t have permission to view any dashboard
                    statistics. Contact your administrator to get access to
                    relevant modules.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Loading overlay for stats */}
        {isLoading && dashboardCards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-pulse"
              >
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

        {/* Main Content Grid - animate in, hover effects */}
        {hasAnyPermissions && (
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 min-w-0"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Recent Activity - slide in from left (now first) */}
            <motion.div className="lg:col-span-1 min-w-0 flex flex-col min-h-0" variants={slideInLeft}>
              <Card className="flex flex-col border border-gray-200 bg-white/95 backdrop-blur-sm shadow-lg h-full min-h-0 rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 flex-shrink-0 border-b border-gray-100/80">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <span className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                      <AlertCircle className="w-5 h-5" />
                    </span>
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 flex flex-col overflow-hidden">
                  {recentActivity.length > 0 ? (
                    <>
                      <div className="space-y-3 overflow-y-auto min-h-0 flex-1 pr-1">
                        {recentActivity
                          .slice(
                            (currentPage - 1) * itemsPerPage,
                            currentPage * itemsPerPage
                          )
                          .map((activity, idx) => (
                            <motion.div
                              key={activity.id}
                              className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50/80 border border-gray-100 shadow-sm min-w-0 cursor-default"
                              initial={{ opacity: 0, x: 8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 + idx * 0.03, duration: 0.25 }}
                              whileHover={{
                                backgroundColor: "rgb(255 255 255 / 0.95)",
                                borderColor: "rgb(229 231 235)",
                                boxShadow: "0 4px 12px -4px rgba(0,0,0,0.08)",
                              }}
                            >
                              <div
                                className={`p-2 rounded-lg bg-white shadow-sm flex-shrink-0 ${getActivityColor(
                                  activity.type
                                )}`}
                              >
                                <ActivityIcon type={activity.type} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {activity.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {formatTimeAgo(activity.timestamp)}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                      </div>
                      {Math.ceil(recentActivity.length / itemsPerPage) > 1 && (
                        <motion.div
                          className="mt-4 border-t border-gray-100 pt-4 flex-shrink-0"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <Pagination>
                            <PaginationContent className="gap-1">
                              <PaginationItem>
                                <PaginationPrevious
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    if (currentPage > 1)
                                      setCurrentPage(currentPage - 1);
                                  }}
                                  className={
                                    currentPage === 1
                                      ? "pointer-events-none opacity-50"
                                      : "rounded-lg transition-colors hover:bg-gray-100"
                                  }
                                />
                              </PaginationItem>
                              {Array.from(
                                {
                                  length: Math.ceil(
                                    recentActivity.length / itemsPerPage
                                  ),
                                },
                                (_, i) => i + 1
                              ).map((page) => (
                                <PaginationItem key={page}>
                                  <PaginationLink
                                    href="#"
                                    isActive={currentPage === page}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setCurrentPage(page);
                                    }}
                                    className="rounded-lg transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                                  >
                                    {page}
                                  </PaginationLink>
                                </PaginationItem>
                              ))}
                              <PaginationItem>
                                <PaginationNext
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    if (
                                      currentPage <
                                      Math.ceil(
                                        recentActivity.length / itemsPerPage
                                      )
                                    )
                                      setCurrentPage(currentPage + 1);
                                  }}
                                  className={
                                    currentPage ===
                                    Math.ceil(
                                      recentActivity.length / itemsPerPage
                                    )
                                      ? "pointer-events-none opacity-50"
                                      : "rounded-lg transition-colors hover:bg-gray-100"
                                  }
                                />
                              </PaginationItem>
                            </PaginationContent>
                          </Pagination>
                        </motion.div>
                      )}
                    </>
                  ) : (
                    <motion.div
                      className="text-center py-10 text-gray-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15 }}
                    >
                      <div className="p-3 rounded-2xl bg-gray-100/80 inline-flex mb-4">
                        <Activity className="w-12 h-12 text-gray-400" />
                      </div>
                      <p className="font-medium text-gray-700">No recent activity</p>
                      <p className="text-sm mt-1">
                        Activity will appear here as changes are made
                      </p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions - slide in from right (now second) */}
            <motion.div className="lg:col-span-1 min-w-0" variants={slideInRight}>
              <Card className="border border-gray-200 bg-white/95 backdrop-blur-sm shadow-lg h-full rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-gray-100/80">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <span className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                      <Clock className="w-5 h-5" />
                    </span>
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  {quickActions.length > 0 ? (
                    quickActions.map((action) => {
                      const IconComponent =
                        iconMap[action.icon as keyof typeof iconMap] ||
                        Activity;
                      return (
                        <motion.button
                          key={action.id}
                          onClick={() => router.push(action.href)}
                          className="block w-full text-left p-3.5 rounded-xl border border-gray-100 bg-white shadow-sm min-w-0 cursor-pointer group"
                          whileHover={{
                            scale: 1.01,
                            boxShadow: "0 8px 24px -8px rgba(99, 102, 241, 0.35)",
                            borderColor: "rgb(224 231 255)",
                            backgroundColor: "rgb(238 242 255 / 0.8)",
                          }}
                          whileTap={{ scale: 0.99 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <motion.div
                              className={`p-2.5 rounded-lg shadow-sm flex-shrink-0 ${action.color}`}
                              whileHover={{ scale: 1.08 }}
                              transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            >
                              <IconComponent className="w-4 h-4 text-white" />
                            </motion.div>
                            <div className="min-w-0">
                              <h4 className="font-medium text-gray-900 truncate group-hover:text-indigo-700 transition-colors">
                                {action.title}
                              </h4>
                              <p className="text-sm text-gray-500 truncate">
                                {action.description}
                              </p>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })
                  ) : (
                    <motion.div
                      className="text-center py-8 text-gray-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="p-3 rounded-2xl bg-gray-100/80 inline-flex mb-4">
                        <Shield className="w-12 h-12 text-gray-400" />
                      </div>
                      <p className="font-medium text-gray-700">No quick actions available</p>
                      <p className="text-sm mt-1">Check your position permissions</p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Position Access Overview */}
        {/* <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Your Position Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasAnyPermissions ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(
                  user.position.position_access as Record<
                    string,
                    Record<string, boolean>
                  >
                ).map(([module, permissions]) => {
                  const permissionCount =
                    Object.values(permissions).filter(Boolean).length;
                  const totalPermissions = Object.keys(permissions).length;
                  const hasAnyPermission = permissionCount > 0;

                  return (
                    <div
                      key={module}
                      className={`p-4 rounded-lg border ${
                        hasAnyPermission
                          ? "border-green-200 bg-green-50"
                          : "border-indigo-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 capitalize">
                          {module}
                        </h4>
                        <Badge
                          variant={hasAnyPermission ? "default" : "secondary"}
                        >
                          {permissionCount}/{totalPermissions}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {Object.entries(permissions).map(
                          ([action, hasPermission]) => (
                            <div
                              key={action}
                              className="flex items-center justify-between text-sm"
                            >
                              <span
                                className={
                                  hasPermission
                                    ? "text-gray-900"
                                    : "text-gray-400"
                                }
                              >
                                {action}
                              </span>
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  hasPermission ? "bg-green-500" : "bg-gray-300"
                                }`}
                              />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Permissions Assigned
                </h3>
                <p className="text-gray-600">
                  Your position doesn&apos;t have any permissions assigned.
                  Contact your administrator to get the appropriate access
                  levels.
                </p>
              </div>
            )}
          </CardContent>
        </Card> */}
      </div>
    </motion.div>
  );
}

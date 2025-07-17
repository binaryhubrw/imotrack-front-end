import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const skeletonVariants = cva(
  "relative overflow-hidden rounded-md bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100",
  {
    variants: {
      variant: {
        default: "animate-pulse",
        shimmer: "animate-shimmer",
      },
      size: {
        sm: "h-4 w-24",
        default: "h-6 w-32",
        lg: "h-8 w-40",
        xl: "h-10 w-48"
      },
      shape: {
        rectangle: "rounded-md",
        circle: "rounded-full aspect-square",
        pill: "rounded-full",
        square: "rounded-md aspect-square"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "rectangle"
    }
  }
)

interface SkeletonProps 
  extends React.ComponentProps<"div">,
    VariantProps<typeof skeletonVariants> {
  lines?: number
  spacing?: "tight" | "normal" | "loose"
}

function Skeleton({ 
  className, 
  variant, 
  size, 
  shape, 
  lines = 1,
  spacing = "normal",
  ...props 
}: SkeletonProps) {
  const spacingClasses = {
    tight: "space-y-1",
    normal: "space-y-2",
    loose: "space-y-3"
  }

  if (lines > 1) {
    return (
      <div className={cn("w-full", spacingClasses[spacing])}>
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            data-slot="skeleton"
            className={cn(
              skeletonVariants({ variant, size, shape }),
              i === lines - 1 && "w-3/4", // Last line shorter
              "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-[#0872b3]/10 before:to-transparent before:animate-shimmer",
              className
            )}
            {...props}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      data-slot="skeleton"
      className={cn(
        skeletonVariants({ variant, size, shape }),
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-[#0872b3]/10 before:to-transparent before:animate-shimmer",
        className
      )}
      {...props}
    />
  )
}

// Preset skeleton components for common UI patterns
function SkeletonAvatar({ size = "default", className, ...props }: Omit<SkeletonProps, "shape">) {
  return (
    <Skeleton
      shape="circle"
      size={size}
      className={cn("flex-shrink-0", className)}
      {...props}
    />
  )
}

function SkeletonText({ 
  lines = 3, 
  className, 
  ...props 
}: Pick<SkeletonProps, "lines" | "className" | "spacing" | "variant">) {
  return (
    <Skeleton
      lines={lines}
      className={cn("w-full", className)}
      {...props}
    />
  )
}

function SkeletonCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("space-y-3 p-4 border border-gray-200 rounded-lg bg-white", className)} {...props}>
      <div className="flex items-center space-x-3">
        <SkeletonAvatar size="default" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonText lines={2} spacing="tight" />
    </div>
  )
}

// Enhanced Organizations Table Skeleton
function SkeletonOrganizationsTable({ 
  rows = 6, 
  className, 
  ...props 
}: { 
  rows?: number
  className?: string
}) {
  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 shadow-sm", className)} {...props}>
      {/* Header Controls Skeleton */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Skeleton className="h-10 w-48" />
          </div>
        </div>
      </div>

      {/* Table Header Skeleton */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className="border-b border-gray-100">
            <div className="flex items-center px-4 py-4">
              <div className="flex-1">
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="w-24">
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
          
          {/* Table Rows Skeleton */}
          <div className="divide-y divide-gray-100">
            {Array.from({ length: rows }, (_, rowIndex) => (
              <div key={rowIndex} className="flex items-center px-4 py-4 hover:bg-gray-50">
                {/* Name Column */}
                <div className="flex-1">
                  <Skeleton className="h-5 w-20" />
                </div>
                
                {/* Email Column */}
                <div className="flex-1">
                  <Skeleton className="h-5 w-36" />
                </div>
                
                {/* Phone Column */}
                <div className="flex-1">
                  <Skeleton className="h-5 w-28" />
                </div>
                
                {/* Status Column */}
                <div className="flex-1">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                
                {/* Created Column */}
                <div className="flex-1">
                  <Skeleton className="h-4 w-20" />
                </div>
                
                {/* Actions Column */}
                <div className="w-24 flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded" />
                  <Skeleton className="h-6 w-6 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
        <div>
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-16" />
        </div>
      </div>
    </div>
  )
}



// Users Table Skeleton
function SkeletonUsersTable({ 
  rows = 5, 
  className, 
  showPagination = true,
  ...props 
}: { 
  rows?: number
  className?: string
  showPagination?: boolean
}) {
  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 shadow-sm", className)} {...props}>
      {/* Header Controls Skeleton */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-64" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      </div>

      {/* Table Header Skeleton */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className="border-b border-gray-100">
            <div className="flex items-center px-4 py-4">
              <div className="flex-1">
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-4 w-8" />
              </div>
              <div className="w-24">
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
          
          {/* Table Rows Skeleton */}
          <div className="divide-y divide-gray-100">
            {Array.from({ length: rows }, (_, rowIndex) => (
              <div key={rowIndex} className="flex items-center px-4 py-4 hover:bg-gray-50">
                {/* First Name Column */}
                <div className="flex-1">
                  <Skeleton className="h-5 w-20" />
                </div>
                
                {/* Last Name Column */}
                <div className="flex-1">
                  <Skeleton className="h-5 w-24" />
                </div>
                
                {/* Email Column */}
                <div className="flex-1">
                  <Skeleton className="h-5 w-40" />
                </div>
                
                {/* Gender Column */}
                <div className="flex-1">
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
                
                {/* Phone Column */}
                <div className="flex-1">
                  <Skeleton className="h-5 w-28" />
                </div>
                
                {/* Position Column */}
                <div className="flex-1">
                  <Skeleton className="h-5 w-20" />
                </div>
                
                {/* Unit Column */}
                <div className="flex-1">
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                
                {/* Actions Column */}
                <div className="w-24 flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded" />
                  <Skeleton className="h-6 w-6 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Skeleton */}
      {showPagination && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div>
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-9 w-16" />
          </div>
        </div>
      )}
    </div>
  )
}

// Units Table Skeleton
function SkeletonUnitsTable({ 
  rows = 5, 
  className, 
  showExport = true,
  ...props 
}: { 
  rows?: number
  className?: string
  showExport?: boolean
}) {
  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 shadow-sm", className)} {...props}>
      {/* Header Controls Skeleton */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-64" />
          </div>
          <div className="flex items-center gap-2">
            {showExport && <Skeleton className="h-9 w-20" />}
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      </div>

      {/* Table Header Skeleton */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className="border-b border-gray-100">
            <div className="flex items-center px-4 py-4">
              <div className="flex-1">
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="w-24">
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
          
          {/* Table Rows Skeleton */}
          <div className="divide-y divide-gray-100">
            {Array.from({ length: rows }, (_, rowIndex) => (
              <div key={rowIndex} className="flex items-center px-4 py-4 hover:bg-gray-50">
                {/* Unit Name Column */}
                <div className="flex-1">
                  <Skeleton className="h-5 w-24" />
                </div>
                
                {/* Status Column */}
                <div className="flex-1">
                  <div className="inline-flex items-center gap-1">
                    <Skeleton className="h-2 w-2 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                
                {/* Created Column */}
                <div className="flex-1">
                  <Skeleton className="h-4 w-20" />
                </div>
                
                {/* Organization ID Column */}
                <div className="flex-1">
                  <Skeleton className="h-4 w-20" />
                </div>
                
                {/* Positions Column */}
                <div className="flex-1">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
                
                {/* Position Names Column */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                
                {/* Actions Column */}
                <div className="w-24 flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded" />
                  <Skeleton className="h-6 w-6 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-end">
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  )
}

// Positions Cards Skeleton
function SkeletonPositionsCards({ 
  cards = 3, 
  className, 
  showUnitSelector = true,
  ...props 
}: { 
  cards?: number
  className?: string
  showUnitSelector?: boolean
}) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {/* Unit Selector Skeleton */}
      {showUnitSelector && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-40" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
      )}

      {/* Position Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: cards }, (_, cardIndex) => (
          <div key={cardIndex} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            {/* Position Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-24" />
                <div className="inline-flex items-center gap-1">
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded" />
                <Skeleton className="h-6 w-6 rounded" />
              </div>
            </div>

            {/* Position Details */}
            <div className="space-y-2 mb-4">
              <Skeleton className="h-4 w-full" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>

            {/* Assigned User */}
            <div className="space-y-2 mb-4">
              <Skeleton className="h-4 w-24" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>

            {/* Permissions Grid */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-12" />
                  <div className="flex flex-wrap gap-1">
                    <Skeleton className="h-6 w-12 rounded" />
                    <Skeleton className="h-6 w-16 rounded" />
                    <Skeleton className="h-6 w-14 rounded" />
                    <Skeleton className="h-6 w-16 rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-12" />
                  <div className="flex flex-wrap gap-1">
                    <Skeleton className="h-6 w-12 rounded" />
                    <Skeleton className="h-6 w-16 rounded" />
                    <Skeleton className="h-6 w-14 rounded" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <div className="flex flex-wrap gap-1">
                    <Skeleton className="h-6 w-12 rounded" />
                    <Skeleton className="h-6 w-16 rounded" />
                    <Skeleton className="h-6 w-14 rounded" />
                    <Skeleton className="h-6 w-16 rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <div className="flex flex-wrap gap-1">
                    <Skeleton className="h-6 w-16 rounded" />
                    <Skeleton className="h-6 w-14 rounded" />
                    <Skeleton className="h-6 w-16 rounded" />
                    <Skeleton className="h-6 w-14 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
// function SkeletonOrganizationsTable({ 
//   rows = 6, 
//   className, 
//   ...props 
// }: { 
//   rows?: number
//   className?: string
// }) {
//   return (
//     <div className={cn("bg-white rounded-lg border border-gray-200 shadow-sm", className)} {...props}>
//       {/* Header Controls Skeleton */}
//       <div className="px-4 py-3 border-b border-gray-200">
//         <div className="flex items-center gap-3">
//           <div className="relative">
//             <Skeleton className="h-10 w-48" />
//           </div>
//         </div>
//       </div>

//       {/* Table Header Skeleton */}
//       <div className="overflow-x-auto">
//         <div className="min-w-full">
//           <div className="border-b border-gray-100">
//             <div className="flex items-center px-4 py-4">
//               <div className="flex-1">
//                 <Skeleton className="h-4 w-16" />
//               </div>
//               <div className="flex-1">
//                 <Skeleton className="h-4 w-16" />
//               </div>
//               <div className="flex-1">
//                 <Skeleton className="h-4 w-16" />
//               </div>
//               <div className="flex-1">
//                 <Skeleton className="h-4 w-16" />
//               </div>
//               <div className="flex-1">
//                 <Skeleton className="h-4 w-16" />
//               </div>
//               <div className="w-24">
//                 <Skeleton className="h-4 w-16" />
//               </div>
//             </div>
//           </div>
          
//           {/* Table Rows Skeleton */}
//           <div className="divide-y divide-gray-100">
//             {Array.from({ length: rows }, (_, rowIndex) => (
//               <div key={rowIndex} className="flex items-center px-4 py-4 hover:bg-gray-50">
//                 {/* Name Column */}
//                 <div className="flex-1">
//                   <Skeleton className="h-5 w-20" />
//                 </div>
                
//                 {/* Email Column */}
//                 <div className="flex-1">
//                   <Skeleton className="h-5 w-36" />
//                 </div>
                
//                 {/* Phone Column */}
//                 <div className="flex-1">
//                   <Skeleton className="h-5 w-28" />
//                 </div>
                
//                 {/* Status Column */}
//                 <div className="flex-1">
//                   <Skeleton className="h-6 w-16 rounded-full" />
//                 </div>
                
//                 {/* Created Column */}
//                 <div className="flex-1">
//                   <Skeleton className="h-4 w-20" />
//                 </div>
                
//                 {/* Actions Column */}
//                 <div className="w-24 flex items-center gap-2">
//                   <Skeleton className="h-6 w-6 rounded" />
//                   <Skeleton className="h-6 w-6 rounded" />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Footer Skeleton */}
//       <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
//         <div>
//           <Skeleton className="h-4 w-32" />
//         </div>
//         <div className="flex items-center gap-2">
//           <Skeleton className="h-9 w-20" />
//           <Skeleton className="h-9 w-16" />
//         </div>
//       </div>
//     </div>
//   )
// }
// Generic improved table skeleton
function SkeletonTable({ 
  rows = 5, 
  columns = 4, 
  className, 
  showHeader = true,
  showFooter = false,
  ...props 
}: { 
  rows?: number
  columns?: number
  className?: string
  showHeader?: boolean
  showFooter?: boolean
}) {
  return (
    <div className={cn("space-y-0", className)} {...props}>
      {/* Header */}
      {showHeader && (
        <div className="flex gap-2 pb-2 border-b border-gray-200">
          {Array.from({ length: columns }, (_, i) => (
            <div key={i} className="flex-1">
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      )}
      
      {/* Rows */}
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className="flex gap-2 py-3">
            {Array.from({ length: columns }, (_, colIndex) => (
              <div key={colIndex} className="flex-1">
                <Skeleton 
                  className={cn(
                    "h-5",
                    colIndex === 0 ? "w-4/5" : "w-3/4"
                  )}
                  variant="shimmer"
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      {showFooter && (
        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      )}
    </div>
  )
}

// Dashboard Skeleton Component
function SkeletonDashboard({ 
  className, 
  showMetrics = true,
  showCharts = true,
  showRecentActivity = true,
  showQuickActions = true,
  ...props 
}: { 
  className?: string
  showMetrics?: boolean
  showCharts?: boolean
  showRecentActivity?: boolean
  showQuickActions?: boolean
}) {
  return (
    <div className={cn("space-y-6", className)} {...props}>
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>

      {/* Key Metrics Cards */}
      {showMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-6 w-6 rounded" />
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts Section */}
      {showCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="space-y-4">
              <div className="flex items-end gap-2 h-48">
                {Array.from({ length: 7 }, (_, index) => (
                  <div key={index} className="flex-1 flex flex-col justify-end">
                    <Skeleton 
                      className="w-full rounded-t" 
                      style={{ height: `${Math.random() * 80 + 20}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                {Array.from({ length: 7 }, (_, index) => (
                  <Skeleton key={index} className="h-3 w-8" />
                ))}
              </div>
            </div>
          </div>

          {/* Chart 2 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-2">
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="flex items-center justify-center h-48">
              <div className="relative">
                <Skeleton className="h-32 w-32 rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-1">
                    <Skeleton className="h-6 w-12 mx-auto" />
                    <Skeleton className="h-3 w-16 mx-auto" />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        {showRecentActivity && (
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {Array.from({ length: 5 }, (_, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="h-3 w-64" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions / Stats */}
        {showQuickActions && (
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="space-y-4">
                <Skeleton className="h-6 w-28" />
                <div className="space-y-3">
                  {Array.from({ length: 4 }, (_, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Items Card */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="space-y-3">
                  {Array.from({ length: 5 }, (_, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Status Badge Skeleton
function SkeletonStatusBadge({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("inline-flex items-center gap-1", className)} {...props}>
      <Skeleton className="h-1.5 w-1.5 rounded-full" />
      <Skeleton className="h-4 w-14 rounded-full" />
    </div>
  )
}

export { 
  Skeleton, 
  SkeletonAvatar, 
  SkeletonText, 
  SkeletonCard, 
  SkeletonTable,
  SkeletonOrganizationsTable,
  SkeletonUnitsTable,
  SkeletonUsersTable,
  SkeletonPositionsCards,
  SkeletonStatusBadge,
  SkeletonDashboard,
  skeletonVariants 
}
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

// Enhanced Vehicle Models Table Skeleton
function SkeletonVehicleModelsTable({ 
  rows = 10, 
  className, 
  ...props 
}: { 
  rows?: number
  className?: string
}) {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton shape="square" className="w-8 h-8" />
            <div>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48 mt-1" />
            </div>
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 overflow-auto p-4">
        <div className={cn("bg-white rounded-lg border border-gray-200 shadow-sm", className)} {...props}>
          {/* Search and Filters Skeleton */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="relative">
                <Skeleton className="h-10 w-64" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>

          {/* Table Skeleton */}
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Table Header Skeleton */}
              <div className="bg-gray-50 border-b border-gray-100">
                <div className="flex items-center px-4 py-3">
                  <div className="flex-1">
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24" />
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
                    {/* Model Name Column */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Skeleton shape="square" className="w-8 h-8" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                    </div>
                    
                    {/* Manufacturer Column */}
                    <div className="flex-1">
                      <Skeleton className="h-5 w-20" />
                    </div>
                    
                    {/* Type Column */}
                    <div className="flex-1">
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    
                    {/* Created Column */}
                    <div className="flex-1">
                      <Skeleton className="h-4 w-20" />
                    </div>
                    
                    {/* Actions Column */}
                    <div className="w-24 flex items-center gap-1">
                      <Skeleton className="h-6 w-6 rounded" />
                      <Skeleton className="h-6 w-6 rounded" />
                      <Skeleton className="h-6 w-6 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pagination Skeleton */}
          <div className="px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-16" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


// Enhanced Vehicles Table Skeleton
function SkeletonVehiclesTable({ 
  rows = 10, 
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
            <Skeleton className="h-10 w-64" />
          </div>
        </div>
      </div>

      {/* Table Header Skeleton */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className="border-b border-gray-100">
            <div className="flex items-center px-4 py-4 bg-blue-50">
              <div className="w-10">
                <Skeleton className="h-4 w-8" />
              </div>
              <div className="flex-1 ml-4">
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-4 w-14" />
              </div>
              <div className="w-24">
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
          
          {/* Table Rows Skeleton */}
          <div className="divide-y divide-gray-100">
            {Array.from({ length: rows }, (_, rowIndex) => (
              <div key={rowIndex} className="flex items-center px-4 py-4 hover:bg-blue-50">
                {/* Photo Column */}
                <div className="w-10 h-10 mr-4">
                  <Skeleton shape="square" className="w-10 h-10 rounded-lg" />
                </div>
                
                {/* Plate Number Column */}
                <div className="flex-1">
                  <Skeleton className="h-5 w-24" />
                </div>
                
                {/* Type Column */}
                <div className="flex-1">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                
                {/* Model Column */}
                <div className="flex-1">
                  <Skeleton className="h-4 w-32" />
                </div>
                
                {/* Status Column */}
                <div className="flex-1">
                  <Skeleton className="h-6 w-18 rounded-full" />
                </div>
                
                {/* Actions Column */}
                <div className="w-24 flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="flex items-center justify-between mt-4 px-4 pb-4">
        <div>
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-16 rounded" />
          <Skeleton className="h-8 w-16 rounded" />
        </div>
      </div>
    </div>
  )
}

// Add this to your skeleton.tsx file



// Individual Reservation Card Skeleton
function SkeletonReservationCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col gap-2", className)} {...props}>
      {/* Header with title and status */}
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-6 w-32" /> {/* Title */}
        <Skeleton className="h-5 w-20 rounded-full" /> {/* Status badge */}
      </div>
      
      {/* Location and date info */}
      <div className="space-y-1">
        <Skeleton className="h-4 w-40" /> {/* From location */}
        <Skeleton className="h-4 w-36" /> {/* To location */}
        <Skeleton className="h-4 w-44" /> {/* Departure date */}
        <Skeleton className="h-4 w-42" /> {/* Return date */}
      </div>
      
      {/* Vehicle info (sometimes present) */}
      <Skeleton className="h-4 w-28" />
      
      {/* Created date and user info */}
      <div className="space-y-1 mt-2">
        <Skeleton className="h-3 w-36" /> {/* Created date */}
        <Skeleton className="h-3 w-32" /> {/* User info */}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-1 mt-3">
        <Skeleton className="h-8 w-20 rounded" /> {/* Action button 1 */}
        <Skeleton className="h-8 w-24 rounded" /> {/* Action button 2 */}
        <Skeleton className="h-8 w-18 rounded" /> {/* Action button 3 */}
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

// Generic Entity Details Page Skeleton
function SkeletonEntityDetails({ 
  className, 
  showRelatedSection = true,
  relatedItemsCount = 4,
  contactFieldsCount = 4,
  detailFieldsCount = 3,
  ...props 
}: { 
  className?: string
  showRelatedSection?: boolean
  relatedItemsCount?: number
  contactFieldsCount?: number
  detailFieldsCount?: number
}) {
  return (
    <div className={cn("min-h-screen bg-gray-50", className)} {...props}>
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-6 rounded bg-white/20" />
            <Skeleton className="h-7 w-48 bg-white/20" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-16 rounded bg-white/20" />
            <Skeleton className="h-9 w-20 rounded bg-red-500/80" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Entity Info Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          {/* Entity Icon and Name */}
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0">
              <Skeleton className="h-12 w-12 rounded-lg" />
            </div>
            <div className="flex-1">
              <Skeleton className="h-8 w-32 mb-2" />
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            </div>
          </div>

          {/* Entity Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {Array.from({ length: detailFieldsCount }, (_, index) => (
              <div key={index} className="space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton 
                  className={cn(
                    "h-5",
                    index === 1 ? "w-20 rounded-full" : "w-36"
                  )}
                />
              </div>
            ))}
          </div>

          {/* Contact Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: contactFieldsCount }, (_, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton 
                  className={cn(
                    "h-4",
                    index === 0 ? "w-48" : // Email - wider
                    index === 1 ? "w-32" : // Address - medium
                    index === 2 ? "w-28" : // Phone - smaller
                    "w-16" // Logo/other - smallest
                  )}
                />
                {index === 3 && (
                  <Skeleton className="h-8 w-16 rounded" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Related Items Section */}
        {showRelatedSection && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-6 w-24" />
            </div>

            {/* Related Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: relatedItemsCount }, (_, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    {/* Item Name */}
                    <Skeleton className="h-5 w-24" />
                    
                    {/* Item ID */}
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-8" />
                      <Skeleton className="h-4 w-40" />
                    </div>

                    {/* Additional Item Info */}
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
  SkeletonVehiclesTable,
  SkeletonStatusBadge,
  SkeletonVehicleModelsTable,
  SkeletonDashboard,
  SkeletonEntityDetails,
  SkeletonReservationCard,
  skeletonVariants 
}
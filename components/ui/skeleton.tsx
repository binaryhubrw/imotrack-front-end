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

function SkeletonTable({ 
  rows = 5, 
  columns = 4, 
  className, 
  ...props 
}: { 
  rows?: number
  columns?: number
  className?: string
}) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {/* Header */}
      <div className="flex space-x-2">
        {Array.from({ length: columns }, (_, i) => (
          <Skeleton key={i} className="h-8 flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-2">
          {Array.from({ length: columns }, (_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              className="h-6 flex-1" 
              variant="shimmer"
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export { 
  Skeleton, 
  SkeletonAvatar, 
  SkeletonText, 
  SkeletonCard, 
  SkeletonTable,
  skeletonVariants 
}
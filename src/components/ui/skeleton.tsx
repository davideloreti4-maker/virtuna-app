import { cn } from "@/lib/utils/cn";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The shape of the skeleton
   * @default "rectangle"
   */
  variant?: "rectangle" | "circle" | "text";
  /**
   * Animation style
   * @default "pulse"
   */
  animation?: "pulse" | "shimmer" | "none";
}

function Skeleton({
  className,
  variant = "rectangle",
  animation = "pulse",
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-[var(--glass-bg)]",
        {
          "rounded-full": variant === "circle",
          "h-4 w-full": variant === "text",
          "animate-pulse": animation === "pulse",
          "animate-shimmer": animation === "shimmer",
        },
        className
      )}
      {...props}
    />
  );
}

/**
 * Pre-built skeleton for a card layout
 */
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("glass-panel p-4 space-y-3", className)}>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex items-center gap-3 mt-4">
        <Skeleton variant="circle" className="w-10 h-10" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
    </div>
  );
}

/**
 * Pre-built skeleton for a stat card
 */
function SkeletonStatCard({ className }: { className?: string }) {
  return (
    <div className={cn("glass-panel p-4 space-y-2", className)}>
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

/**
 * Pre-built skeleton for a chart
 */
function SkeletonChart({ className }: { className?: string }) {
  return (
    <div className={cn("glass-panel p-4", className)}>
      <Skeleton className="h-4 w-1/4 mb-4" />
      <div className="flex items-end gap-2 h-40">
        <Skeleton className="flex-1 h-[60%]" />
        <Skeleton className="flex-1 h-[80%]" />
        <Skeleton className="flex-1 h-[40%]" />
        <Skeleton className="flex-1 h-[90%]" />
        <Skeleton className="flex-1 h-[50%]" />
        <Skeleton className="flex-1 h-[70%]" />
      </div>
    </div>
  );
}

/**
 * Pre-built skeleton for a list item
 */
function SkeletonListItem({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 p-3", className)}>
      <Skeleton variant="circle" className="w-10 h-10" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-16" />
    </div>
  );
}

/**
 * Pre-built skeleton for the dashboard page
 */
function SkeletonDashboard() {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SkeletonChart />
        <SkeletonChart />
      </div>

      {/* Recent Activity */}
      <div className="glass-panel">
        <div className="p-4 border-b border-[var(--glass-border)]">
          <Skeleton className="h-5 w-36" />
        </div>
        <SkeletonListItem />
        <SkeletonListItem />
        <SkeletonListItem />
      </div>
    </div>
  );
}

/**
 * Pre-built skeleton for the analyze page
 */
function SkeletonAnalyze() {
  return (
    <div className="animate-fade-in space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>

      {/* Input */}
      <div className="glass-panel p-6 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Results placeholder */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-center">
          <Skeleton variant="circle" className="w-32 h-32" />
        </div>
        <div className="mt-6 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
    </div>
  );
}

/**
 * Pre-built skeleton for the library page
 */
function SkeletonLibrary() {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Search */}
      <Skeleton className="h-12 w-full" />

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

/**
 * Pre-built skeleton for the settings page
 */
function SkeletonSettings() {
  return (
    <div className="animate-fade-in space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Skeleton variant="circle" className="w-10 h-10" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>

      {/* Profile */}
      <div className="glass-panel p-5">
        <div className="flex items-center gap-4">
          <Skeleton variant="circle" className="w-16 h-16" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>

      {/* Plan */}
      <div className="glass-panel p-5 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Settings list */}
      <div className="glass-panel overflow-hidden">
        <SkeletonListItem />
        <SkeletonListItem />
        <SkeletonListItem />
      </div>
    </div>
  );
}

export {
  Skeleton,
  SkeletonCard,
  SkeletonStatCard,
  SkeletonChart,
  SkeletonListItem,
  SkeletonDashboard,
  SkeletonAnalyze,
  SkeletonLibrary,
  SkeletonSettings,
};

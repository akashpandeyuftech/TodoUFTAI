export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-surface rounded ${className}`} />
  );
}

export function TodoCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-5 h-5 rounded" />
        <Skeleton className="h-5 w-3/4" />
      </div>
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-3">
        <TodoCardSkeleton />
        <TodoCardSkeleton />
        <TodoCardSkeleton />
      </div>
    </div>
  );
}

import { Skeleton } from "@/app/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-xl p-6 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}

import { Skeleton } from "@/app/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
        <div className="lg:col-span-2">
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

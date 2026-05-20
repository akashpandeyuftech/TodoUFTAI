import { Skeleton } from "@/app/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="max-w-3xl space-y-4">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-10 w-64" />
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-20 rounded-lg" />
      ))}
    </div>
  );
}

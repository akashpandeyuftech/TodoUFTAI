import { Skeleton } from "@/app/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="max-w-2xl space-y-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

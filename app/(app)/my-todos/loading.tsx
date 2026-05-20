import { PageSkeleton } from "@/app/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="max-w-3xl">
      <PageSkeleton />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto animate-pulse space-y-4">
      <div className="h-8 w-32 bg-card rounded" />
      <div className="h-4 w-64 bg-card rounded" />
      <div className="h-40 bg-card rounded-xl" />
      <div className="h-24 bg-card rounded-xl" />
      <div className="h-24 bg-card rounded-xl" />
    </div>
  );
}

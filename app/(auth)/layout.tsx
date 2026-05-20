export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground tracking-wide">
            <span className="text-primary">UF</span>Tech Tasks
          </h1>
          <p className="text-muted text-sm mt-1">Team task management</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

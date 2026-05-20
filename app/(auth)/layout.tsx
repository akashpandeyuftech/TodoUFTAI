export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0d0d0d] p-4">
      <div className="w-full max-w-sm">
        <div className="bg-card border border-border rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
          <div className="px-8 pt-10 pb-6 text-center border-b border-border">
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-white">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-white tracking-tight">UFTech Tasks</h1>
            <p className="text-muted text-xs mt-1">Team task management</p>
          </div>
          <div className="px-8 py-7">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

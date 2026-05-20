"use client";

import { useRouter } from "next/navigation";

interface TopbarProps {
  teamName: string;
  userName: string;
}

export function Topbar({ teamName, userName }: TopbarProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <header className="h-14 bg-sidebar border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-3 pl-10 lg:pl-0">
        <span className="bg-primary/15 text-primary text-[11px] font-semibold px-3 py-1 rounded-full border border-primary/20">
          {teamName}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[11px] font-bold text-primary">
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-muted font-medium">{userName}</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-[12px] text-muted hover:text-danger transition-colors font-medium cursor-pointer"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

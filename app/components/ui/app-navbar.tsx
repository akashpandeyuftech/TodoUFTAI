"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Board" },
  { href: "/my-todos", label: "My Tasks" },
  { href: "/team-todos", label: "Team Tasks" },
  { href: "/members", label: "Members" },
  { href: "/history", label: "History" },
  { href: "/export", label: "Export" },
];

interface AppNavbarProps {
  teamName: string;
  userName: string;
}

export function AppNavbar({ teamName, userName }: AppNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-nav shrink-0">
      <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg border border-border text-foreground -ml-1"
            aria-label="Open navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {menuOpen ? <path d="M5 5l14 14M5 15L19 5" /> : <path d="M4 7h14M4 12h14M4 17h14" />}
            </svg>
          </button>
          <span className="text-sm font-semibold text-white tracking-tight truncate hidden sm:inline">
            UFTech Tasks
          </span>
          <span className="text-[10px] font-medium text-muted uppercase tracking-wider border border-border rounded-full px-2.5 py-1 truncate max-w-[140px] sm:max-w-[200px]">
            {teamName}
          </span>
        </div>

        <nav className="hidden lg:flex flex-1 items-center justify-center gap-1 mx-4">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  active
                    ? "bg-white/10 text-white border border-border"
                    : "text-muted hover:text-white border border-transparent"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-border flex items-center justify-center text-[11px] font-semibold text-white">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-muted font-medium max-w-[120px] truncate">{userName}</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="text-[12px] text-muted hover:text-white transition-colors font-medium cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-border px-3 py-2 pb-4 bg-[#161616]">
          <nav className="flex flex-col gap-0.5">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-[13px] font-medium ${
                    active ? "bg-white/10 text-white" : "text-muted hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}

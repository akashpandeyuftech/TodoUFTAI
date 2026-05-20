"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

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
  userEmail: string;
  canCreateTeam: boolean;
}

export function AppNavbar({ teamName, userName, userEmail, canCreateTeam }: AppNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!accountOpen) return;
    function handlePointerDown(e: MouseEvent | TouchEvent) {
      const el = accountRef.current;
      if (el && !el.contains(e.target as Node)) setAccountOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAccountOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [accountOpen]);

  async function handleLogout() {
    setAccountOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const initial = userName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-nav shrink-0">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg border border-border text-foreground -ml-1"
            aria-expanded={navOpen}
            aria-label={navOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setNavOpen(!navOpen)}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {navOpen ? <path d="M5 5l14 14M5 15L19 5" /> : <path d="M4 7h14M4 12h14M4 17h14" />}
            </svg>
          </button>
          {canCreateTeam ? (
            <Link
              href="/teams"
              className="text-sm font-semibold text-white tracking-tight truncate hidden sm:inline hover:text-white/80 transition-colors"
            >
              UFTech Tasks
            </Link>
          ) : (
            <span className="text-sm font-semibold text-white tracking-tight truncate hidden sm:inline">
              UFTech Tasks
            </span>
          )}
          <span className="text-[10px] font-medium text-muted uppercase tracking-wider border border-border rounded-full px-2.5 py-1 truncate max-w-[140px] sm:max-w-[200px]">
            {teamName}
          </span>
        </div>

        <nav className="hidden lg:flex flex-1 items-center justify-center gap-1 mx-4" aria-label="Main">
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

        <div className="relative shrink-0" ref={accountRef}>
          <button
            type="button"
            onClick={() => setAccountOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 hover:bg-white/[0.06] hover:border-border transition-colors cursor-pointer"
            aria-expanded={accountOpen}
            aria-haspopup="menu"
            aria-label="Account menu"
          >
            <div className="w-8 h-8 rounded-full bg-white/10 border border-border flex items-center justify-center text-[11px] font-semibold text-white">
              {initial}
            </div>
            <span className="text-sm text-foreground font-medium max-w-[140px] truncate hidden sm:inline">{userName}</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`text-muted shrink-0 transition-transform ${accountOpen ? "rotate-180" : ""}`}
              aria-hidden
            >
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {accountOpen && (
            <div
              role="menu"
              aria-orientation="vertical"
              className="absolute right-0 top-[calc(100%+6px)] z-[60] w-[min(calc(100vw-2rem),260px)] rounded-xl border border-border bg-[#161616] py-2 shadow-xl shadow-black/60"
            >
              <div className="px-3 pb-2 border-b border-border">
                <p className="text-sm font-semibold text-white truncate">{userName}</p>
                <p className="text-[12px] text-muted truncate mt-0.5" title={userEmail}>
                  {userEmail}
                </p>
              </div>
              {canCreateTeam && (
                <Link
                  href="/teams"
                  role="menuitem"
                  onClick={() => setAccountOpen(false)}
                  className="mt-1 flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] font-medium text-foreground hover:bg-white/[0.06] cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted" aria-hidden>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Manage Teams
                </Link>
              )}
              <button
                type="button"
                role="menuitem"
                onClick={() => handleLogout()}
                className={`${canCreateTeam ? "" : "mt-1 "}w-full px-3 py-2.5 text-left text-[13px] font-medium text-foreground hover:bg-white/[0.06] cursor-pointer`}
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>

      {navOpen && (
        <div className="border-t border-border bg-[#161616] lg:hidden">
          <div className="mx-auto w-full max-w-6xl px-5 py-2 pb-4 sm:px-8 lg:px-12">
            <nav className="flex flex-col gap-0.5" aria-label="Mobile main">
              {navItems.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setNavOpen(false)}
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
        </div>
      )}
    </header>
  );
}

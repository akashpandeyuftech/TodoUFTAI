"use client";

import { AppNavbar } from "@/app/components/ui/app-navbar";
import { ToastProvider } from "@/app/components/ui/toast";

interface AppShellProps {
  teamName: string;
  userName: string;
  children: React.ReactNode;
}

export function AppShell({ teamName, userName, children }: AppShellProps) {
  return (
    <ToastProvider>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
        <AppNavbar teamName={teamName} userName={userName} />
        <main className="flex-1 overflow-y-auto p-5">{children}</main>
      </div>
    </ToastProvider>
  );
}

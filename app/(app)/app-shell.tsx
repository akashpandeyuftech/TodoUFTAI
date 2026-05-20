"use client";

import { AppNavbar } from "@/app/components/ui/app-navbar";
import { ToastProvider } from "@/app/components/ui/toast";

interface AppShellProps {
  teamName: string;
  userName: string;
  userEmail: string;
  children: React.ReactNode;
}

export function AppShell({ teamName, userName, userEmail, children }: AppShellProps) {
  return (
    <ToastProvider>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
        <AppNavbar teamName={teamName} userName={userName} userEmail={userEmail} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
            {children}
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}

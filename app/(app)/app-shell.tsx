"use client";

import { Sidebar } from "@/app/components/ui/sidebar";
import { Topbar } from "@/app/components/ui/topbar";
import { ToastProvider } from "@/app/components/ui/toast";

interface AppShellProps {
  teamName: string;
  userName: string;
  children: React.ReactNode;
}

export function AppShell({ teamName, userName, children }: AppShellProps) {
  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar teamName={teamName} userName={userName} />
          <main className="flex-1 overflow-y-auto p-5">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}

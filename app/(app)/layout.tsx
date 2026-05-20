import { getCurrentUser } from "@/app/lib/auth/jwt";
import { db } from "@/app/lib/db";
import { users, teams } from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AppShell } from "./app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const auth = await getCurrentUser();
  if (!auth) redirect("/login");

  const [user] = await db.select().from(users).where(eq(users.id, auth.userId)).limit(1);
  if (!user) redirect("/login");

  let teamName = "No Team";
  if (user.teamId) {
    const [team] = await db.select().from(teams).where(eq(teams.id, user.teamId)).limit(1);
    if (team) teamName = team.name;
  }

  return (
    <div className="flex min-h-[100dvh] flex-col overflow-hidden">
      <AppShell teamName={teamName} userName={user.displayName}>
        {children}
      </AppShell>
    </div>
  );
}

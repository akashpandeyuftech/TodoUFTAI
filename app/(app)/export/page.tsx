import { getCurrentUser } from "@/app/lib/auth/jwt";
import { getTeamMembers } from "@/app/lib/actions/teams";
import { db } from "@/app/lib/db";
import { teams } from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ExportClient } from "./export-client";

export default async function ExportPage() {
  const user = await getCurrentUser();
  if (!user || !user.teamId) redirect("/login");

  const members = await getTeamMembers(user.teamId);
  const [team] = await db.select().from(teams).where(eq(teams.id, user.teamId)).limit(1);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Export to PDF</h1>
      <ExportClient
        userId={user.userId}
        teamId={user.teamId}
        teamName={team?.name ?? "Team"}
        userName={user.email}
        members={members}
      />
    </div>
  );
}

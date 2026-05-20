import { getCurrentUser } from "@/app/lib/auth/jwt";
import { getTeams } from "@/app/lib/actions/teams";
import { emailCanCreateTeams } from "@/app/lib/config/team-creators";
import { redirect } from "next/navigation";
import { TeamsDashboardClient } from "./teams-dashboard-client";

export default async function TeamsPage() {
  const auth = await getCurrentUser();
  if (!auth) redirect("/login");
  if (!emailCanCreateTeams(auth.email)) redirect("/dashboard");

  const teams = await getTeams();

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Teams</h1>
      <p className="text-sm text-muted mb-6">Create and manage teams across your organization.</p>
      <TeamsDashboardClient teams={teams} currentTeamId={auth.teamId ?? null} />
    </div>
  );
}

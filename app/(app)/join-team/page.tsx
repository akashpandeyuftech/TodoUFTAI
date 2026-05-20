import { getTeams } from "@/app/lib/actions/teams";
import { JoinTeamClient } from "./join-team-client";

export default async function JoinTeamPage() {
  const teams = await getTeams();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Join a Team</h1>
      <div className="bg-warning/10 border border-warning/20 text-warning rounded-lg p-4 mb-6 text-sm">
        <strong>Warning:</strong> You can only join one team. This cannot be changed.
      </div>
      <JoinTeamClient teams={teams} />
    </div>
  );
}

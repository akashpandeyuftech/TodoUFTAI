"use client";

import { useState, useTransition } from "react";
import { joinTeam } from "@/app/lib/actions/teams";

interface Team {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
}

export function JoinTeamClient({ teams }: { teams: Team[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState<string | null>(null);

  function handleJoin(teamId: string) {
    if (confirming !== teamId) {
      setConfirming(teamId);
      return;
    }
    setError("");
    const formData = new FormData();
    formData.set("team_id", teamId);
    startTransition(async () => {
      const result = await joinTeam(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-danger/10 text-danger text-sm px-4 py-3 rounded-lg border border-danger/20">{error}</div>
      )}
      {teams.length === 0 ? (
        <div className="text-center py-12 text-muted">
          <p className="text-lg font-medium">No teams available</p>
          <p className="text-sm mt-1">Ask an admin to create teams first</p>
        </div>
      ) : (
        teams.map((team) => (
          <div
            key={team.id}
            className="bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:bg-card-hover transition-colors"
          >
            <div>
              <h3 className="font-semibold text-foreground">{team.name}</h3>
              {team.description && <p className="text-sm text-muted mt-0.5">{team.description}</p>}
              <p className="text-xs text-muted mt-1">{team.memberCount} member(s)</p>
            </div>
            <button
              onClick={() => handleJoin(team.id)}
              disabled={isPending}
              className={`px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
                confirming === team.id
                  ? "bg-danger text-white hover:bg-danger/90"
                  : "bg-primary text-white hover:bg-primary-hover"
              } disabled:opacity-50`}
            >
              {isPending && confirming === team.id ? "Joining..." : confirming === team.id ? "Confirm Join" : "Join"}
            </button>
          </div>
        ))
      )}
    </div>
  );
}

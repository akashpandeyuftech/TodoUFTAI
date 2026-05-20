"use client";

import { useState, useTransition } from "react";
import { createTeam } from "@/app/lib/actions/teams";
import Link from "next/link";

interface Team {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
}

export function TeamsDashboardClient({
  teams,
  currentTeamId,
}: {
  teams: Team[];
  currentTeamId: string | null;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function handleCreate(formData: FormData) {
    setError("");
    setFieldErrors({});
    startTransition(async () => {
      const result = await createTeam(formData);
      if (result && "error" in result && result.error) {
        setError(result.error as string);
        const fe = (result as { fieldErrors?: Record<string, string[]> }).fieldErrors;
        if (fe) setFieldErrors(fe);
      } else {
        setShowCreate(false);
      }
    });
  }

  const input =
    "w-full px-3 py-2.5 bg-[#111] border border-border rounded-lg text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/25";

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-danger/10 text-danger text-sm px-4 py-3 rounded-lg border border-danger/20">
          {error}
        </div>
      )}

      {/* Create team section */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-sm font-semibold text-white">Create a new team</h2>
            <p className="text-xs text-muted mt-1">
              Teams are created without joining. Members join separately.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreate((v) => !v)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-card-hover cursor-pointer text-foreground whitespace-nowrap"
          >
            {showCreate ? "Close" : "New team"}
          </button>
        </div>

        {showCreate && (
          <form action={handleCreate} className="grid gap-3 pt-2 border-t border-border">
            <div>
              <label className="block text-[11px] font-medium text-muted mb-1 uppercase tracking-widest">
                Team name
              </label>
              <input
                name="name"
                required
                minLength={2}
                maxLength={80}
                className={input}
                placeholder="Engineering"
              />
              {fieldErrors.name && (
                <p className="text-danger text-xs mt-1">{fieldErrors.name[0]}</p>
              )}
            </div>
            <div>
              <label className="block text-[11px] font-medium text-muted mb-1 uppercase tracking-widest">
                Description
              </label>
              <textarea
                name="description"
                rows={2}
                maxLength={500}
                className={`${input} resize-none`}
                placeholder="Optional"
              />
              {fieldErrors.description && (
                <p className="text-danger text-xs mt-1">{fieldErrors.description[0]}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-white text-black text-sm font-semibold hover:bg-white/90 disabled:opacity-50 cursor-pointer"
            >
              {isPending ? "Creating…" : "Create team"}
            </button>
          </form>
        )}
      </div>

      {/* Teams list */}
      <div>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">
          All teams ({teams.length})
        </h2>

        <div className="space-y-3">
          {teams.length === 0 ? (
            <div className="text-center py-12 text-muted border border-border border-dashed rounded-xl">
              <p className="text-lg font-medium text-foreground">No teams yet</p>
              <p className="text-sm mt-1">Use the form above to create one.</p>
            </div>
          ) : (
            teams.map((team) => {
              const isMine = team.id === currentTeamId;
              return (
                <div
                  key={team.id}
                  className={`bg-card border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-card-hover transition-colors ${
                    isMine ? "border-white/20" : "border-border"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground truncate">{team.name}</h3>
                      {isMine && (
                        <span className="text-[10px] font-medium text-success bg-success/10 border border-success/20 rounded-full px-2 py-0.5 shrink-0">
                          Your team
                        </span>
                      )}
                    </div>
                    {team.description && (
                      <p className="text-sm text-muted mt-0.5 truncate">{team.description}</p>
                    )}
                    <p className="text-xs text-muted mt-1">
                      {team.memberCount} member{team.memberCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Link
                    href={`/teams/${team.id}`}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-white/10 transition-colors shrink-0 text-center"
                  >
                    View
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

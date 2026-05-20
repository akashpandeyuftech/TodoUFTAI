"use client";

import { useRouter } from "next/navigation";
import { HistoryEntry } from "@/app/components/history/history-entry";

interface Entry {
  id: string;
  todoId: string;
  action: string;
  previousState: unknown;
  newState: unknown;
  changedAt: string | Date;
  changedByName: string | null;
  changedById: string;
  todoTitle: string | null;
}

interface Member {
  id: string;
  displayName: string;
}

interface HistoryClientProps {
  entries: Entry[];
  totalPages: number;
  currentPage: number;
  mode: "mine" | "team" | "member";
  memberId: string | null;
  members: Member[];
}

export function HistoryClient({ entries, totalPages, currentPage, mode, memberId, members }: HistoryClientProps) {
  const router = useRouter();

  function navigate(params: Record<string, string>) {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v) sp.set(k, v);
    }
    router.push(`/history?${sp.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-0.5 bg-surface rounded-lg p-1 border border-border">
          {(["mine", "team", "member"] as const).map((m) => (
            <button
              key={m}
              onClick={() => navigate({ mode: m, page: "1" })}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-md capitalize cursor-pointer transition-colors ${
                mode === m ? "bg-primary/15 text-primary" : "text-muted hover:text-foreground"
              }`}
            >
              {m === "mine" ? "My History" : m === "team" ? "Team Tasks" : "Member"}
            </button>
          ))}
        </div>

        {mode === "member" && (
          <select
            value={memberId ?? ""}
            onChange={(e) => navigate({ mode: "member", member: e.target.value, page: "1" })}
            className="text-[11px] bg-surface border border-border rounded-lg px-3 py-1.5 text-muted"
          >
            <option value="">Select member...</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.displayName}</option>
            ))}
          </select>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-12 text-muted">
          <p className="text-lg font-medium">No history entries</p>
          <p className="text-sm mt-1">Actions on tasks will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <HistoryEntry key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <button
            disabled={currentPage <= 1}
            onClick={() => navigate({ mode, ...(memberId ? { member: memberId } : {}), page: String(currentPage - 1) })}
            className="px-3 py-1.5 text-sm bg-surface border border-border rounded-lg disabled:opacity-30 cursor-pointer text-muted hover:text-foreground"
          >
            Previous
          </button>
          <span className="px-3 py-1.5 text-sm text-muted">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => navigate({ mode, ...(memberId ? { member: memberId } : {}), page: String(currentPage + 1) })}
            className="px-3 py-1.5 text-sm bg-surface border border-border rounded-lg disabled:opacity-30 cursor-pointer text-muted hover:text-foreground"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

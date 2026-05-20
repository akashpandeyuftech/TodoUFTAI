interface HistoryEntryProps {
  entry: {
    id: string;
    action: string;
    changedByName: string | null;
    todoTitle: string | null;
    previousState: unknown;
    newState: unknown;
    changedAt: string | Date;
  };
}

const actionLabels: Record<string, { label: string; color: string }> = {
  created: { label: "Created", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  updated: { label: "Updated", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  completed: { label: "Completed", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  uncompleted: { label: "Uncompleted", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  deleted: { label: "Deleted", color: "bg-red-500/10 text-red-400 border-red-500/20" },
};

export function HistoryEntry({ entry }: HistoryEntryProps) {
  const { label, color } = actionLabels[entry.action] ?? { label: entry.action, color: "bg-surface text-muted border-border" };
  const date = new Date(entry.changedAt);

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:bg-card-hover transition-colors">
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${color}`}>
          {label}
        </span>
        <span className="text-sm font-medium text-foreground">{entry.todoTitle ?? "Deleted todo"}</span>
        <span className="text-[11px] text-muted ml-auto">
          {date.toLocaleDateString()} {date.toLocaleTimeString()}
        </span>
      </div>
      <p className="text-sm text-muted mt-2">
        by <span className="font-medium text-foreground">{entry.changedByName ?? "Unknown"}</span>
      </p>
      {entry.action === "updated" && !!entry.previousState && !!entry.newState && (
        <div className="mt-2 text-xs text-muted bg-surface rounded p-2.5 space-y-1 border border-border">
          <ChangeDiff prev={entry.previousState as Record<string, unknown>} next={entry.newState as Record<string, unknown>} />
        </div>
      )}
    </div>
  );
}

function ChangeDiff({ prev, next }: { prev: Record<string, unknown>; next: Record<string, unknown> }) {
  const changes: string[] = [];
  for (const key of Object.keys(next)) {
    if (JSON.stringify(prev[key]) !== JSON.stringify(next[key])) {
      changes.push(`${key}: "${String(prev[key] ?? "")}" → "${String(next[key] ?? "")}"`);
    }
  }
  if (changes.length === 0) return null;
  return (
    <>
      {changes.map((c, i) => (
        <div key={i}>{c}</div>
      ))}
    </>
  );
}

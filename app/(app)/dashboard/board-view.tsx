"use client";

import type { DragEvent } from "react";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { TodoCard } from "@/app/components/todos/todo-card";
import { TodoForm } from "@/app/components/todos/todo-form";
import Link from "next/link";
import { claimTeamTodo, releaseTeamTodoClaim } from "@/app/lib/actions/todos";
import { useToast } from "@/app/components/ui/toast";

export interface DashboardTodo {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  dueDate: string | Date | null;
  priority: "low" | "medium" | "high";
  ownerType: "member" | "team";
  ownerId: string;
  createdBy: string;
  creatorName: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  claimedByUserId: string | null;
  claimantDisplayName: string | null;
}

interface BoardViewProps {
  myTodos: DashboardTodo[];
  teamTodos: DashboardTodo[];
  memberCount: number;
  userId: string;
}

const DND_TEAM = "board/todo";
const TEAM_UNCLAIMED = "team/unclaimed";
const TEAM_MY_CLAIM = "team/my-claim";

export function BoardView({ myTodos, teamTodos, memberCount, userId }: BoardViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [dragOverMy, setDragOverMy] = useState(false);
  const [dragOverTeam, setDragOverTeam] = useState(false);
  const [, startTransition] = useTransition();
  const [showPersonalForm, setShowPersonalForm] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);

  const myActive = myTodos.filter((t) => !t.isCompleted);
  const myDone = myTodos.filter((t) => t.isCompleted);
  const teamActive = teamTodos.filter((t) => !t.isCompleted);
  const teamDone = teamTodos.filter((t) => t.isCompleted);

  function handleClaim(todoId: string) {
    startTransition(async () => {
      const r = await claimTeamTodo(todoId);
      if (r?.error) toast(r.error, "error");
      else router.refresh();
    });
  }

  function handleRelease(todoId: string) {
    startTransition(async () => {
      const r = await releaseTeamTodoClaim(todoId);
      if (r?.error) toast(r.error, "error");
      else router.refresh();
    });
  }

  function persistDrag(kind: typeof TEAM_UNCLAIMED | typeof TEAM_MY_CLAIM, todoId: string) {
    if (kind === TEAM_UNCLAIMED) {
      handleClaim(todoId);
      return;
    }
    handleRelease(todoId);
  }

  function onDragStartTeam(e: DragEvent, todo: DashboardTodo, from: "team" | "my") {
    if (todo.ownerType !== "team") return;
    if (from === "team") {
      if (todo.claimedByUserId && todo.claimedByUserId !== userId) {
        e.preventDefault();
        return;
      }
      const kind =
        todo.claimedByUserId === userId ? TEAM_MY_CLAIM : TEAM_UNCLAIMED;
      e.dataTransfer.setData(DND_TEAM, JSON.stringify({ todoId: todo.id, kind }));
      e.dataTransfer.effectAllowed = "move";
    } else {
      const isMine =
        todo.claimedByUserId === userId && todo.ownerType === "team";
      if (!isMine) return;
      e.dataTransfer.setData(DND_TEAM, JSON.stringify({ todoId: todo.id, kind: TEAM_MY_CLAIM }));
      e.dataTransfer.effectAllowed = "move";
    }
  }

  function parseDropPayload(e: DragEvent) {
    const raw = e.dataTransfer.getData(DND_TEAM);
    if (!raw) return null;
    try {
      const p = JSON.parse(raw) as { todoId?: string; kind?: string };
      if (!p.todoId || (p.kind !== TEAM_UNCLAIMED && p.kind !== TEAM_MY_CLAIM)) return null;
      return { todoId: p.todoId, kind: p.kind as typeof TEAM_UNCLAIMED | typeof TEAM_MY_CLAIM };
    } catch {
      return null;
    }
  }

  function onDropMy(e: DragEvent) {
    e.preventDefault();
    setDragOverMy(false);
    const p = parseDropPayload(e);
    if (!p) return;
    if (p.kind !== TEAM_UNCLAIMED) return;
    persistDrag(TEAM_UNCLAIMED, p.todoId);
  }

  function onDropTeam(e: DragEvent) {
    e.preventDefault();
    setDragOverTeam(false);
    const p = parseDropPayload(e);
    if (!p) return;
    if (p.kind !== TEAM_MY_CLAIM) return;
    persistDrag(TEAM_MY_CLAIM, p.todoId);
  }

  return (
    <div className="h-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Board</h1>
          <p className="text-[13px] text-muted mt-1">
            Tap <span className="text-foreground font-medium">Take Task</span> to pick up a team task, or drag on desktop.
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-muted shrink-0">
          <span className="bg-surface px-3 py-1.5 rounded-lg border border-border">{memberCount} members</span>
          <span className="bg-surface px-3 py-1.5 rounded-lg border border-border">
            {myTodos.length + teamTodos.length} tasks
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-5 lg:h-[calc(100%-5.5rem)] min-h-[320px]">
        <section
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverMy(true);
          }}
          onDragLeave={() => setDragOverMy(false)}
          onDrop={onDropMy}
          className={`bg-surface rounded-xl sm:rounded-2xl border p-3 sm:p-4 flex flex-col min-h-0 transition-colors ${
            dragOverMy ? "border-white/35 ring-1 ring-white/15" : "border-border"
          }`}
        >
          <MyColumnHeader activeCount={myActive.length} onAdd={() => setShowPersonalForm((v) => !v)} />

          {(showPersonalForm) && (
            <div className="mb-3 animate-[fade-in_0.15s_ease-out]">
              <TodoForm
                ownerType="member"
                onCancel={() => setShowPersonalForm(false)}
                onSuccess={() => {
                  setShowPersonalForm(false);
                  router.refresh();
                }}
              />
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 pt-1.5">
            {myActive.length === 0 && myDone.length === 0 ? (
              <EmptyColumn label="personal tasks" />
            ) : (
              <>
                {myActive.map((todo) => {
                  const isClaimedTeamTask = todo.ownerType === "team" && todo.claimedByUserId === userId;
                  return (
                    <div
                      key={todo.id}
                      draggable={!!isClaimedTeamTask}
                      onDragStart={(e) => onDragStartTeam(e, todo, "my")}
                      className={`${isClaimedTeamTask ? "hidden-drag lg:cursor-grab lg:active:cursor-grabbing" : ""}`}
                    >
                      <TodoCard
                        todo={todo}
                        canDelete={!isClaimedTeamTask}
                        badge={isClaimedTeamTask ? "Team" : undefined}
                        showCreator={false}
                        onRelease={isClaimedTeamTask ? () => handleRelease(todo.id) : undefined}
                      />
                    </div>
                  );
                })}
                {myDone.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 pt-3 pb-1">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-[10px] text-muted uppercase tracking-wider">Completed ({myDone.length})</span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    {myDone.map((todo) => (
                      <TodoCard key={todo.id} todo={todo} canDelete={!(todo.ownerType === "team" && !!todo.claimedByUserId)} badge={todo.ownerType === "team" ? "Team" : undefined} />
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </section>

        <section
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverTeam(true);
          }}
          onDragLeave={() => setDragOverTeam(false)}
          onDrop={onDropTeam}
          className={`bg-surface rounded-xl sm:rounded-2xl border p-3 sm:p-4 flex flex-col min-h-0 transition-colors ${
            dragOverTeam ? "border-white/35 ring-1 ring-white/15" : "border-border"
          }`}
        >
          <TeamColumnHeader activeCount={teamActive.length} onAdd={() => setShowTeamForm((v) => !v)} />

          {showTeamForm && (
            <div className="mb-3 animate-[fade-in_0.15s_ease-out]">
              <TodoForm
                ownerType="team"
                onCancel={() => setShowTeamForm(false)}
                onSuccess={() => {
                  setShowTeamForm(false);
                  router.refresh();
                }}
              />
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 pt-1.5">
            {teamActive.length === 0 && teamDone.length === 0 ? (
              <EmptyColumn label="team tasks" />
            ) : (
              <>
                {teamActive.map((todo) => {
                  const unclaimed = !todo.claimedByUserId;
                  const claimedByMe = todo.claimedByUserId === userId;
                  const canDrag = unclaimed || claimedByMe;
                  return (
                    <div
                      key={todo.id}
                      draggable={canDrag}
                      onDragStart={(e) => onDragStartTeam(e, todo, "team")}
                      className={`${canDrag ? "hidden-drag lg:cursor-grab lg:active:cursor-grabbing" : ""}`}
                    >
                      <TodoCard
                        todo={todo}
                        canDelete={false}
                        showCreator
                        takenByLabel={
                          todo.claimantDisplayName
                            ? claimedByMe
                              ? `Taken — you`
                              : `Taken — ${todo.claimantDisplayName}`
                            : undefined
                        }
                        onClaim={unclaimed ? () => handleClaim(todo.id) : undefined}
                        onRelease={claimedByMe ? () => handleRelease(todo.id) : undefined}
                      />
                    </div>
                  );
                })}
                {teamDone.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 pt-3 pb-1">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-[10px] text-muted uppercase tracking-wider">Completed ({teamDone.length})</span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    {teamDone.map((todo) => (
                      <TodoCard key={todo.id} todo={todo} canDelete={false} showCreator takenByLabel={todo.claimantDisplayName ? `Taken — ${todo.claimantDisplayName}` : undefined} />
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function MyColumnHeader({ activeCount, onAdd }: { activeCount: number; onAdd: () => void }) {
  return (
    <div className="flex items-center justify-between mb-2 gap-3 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-2 h-2 rounded-full bg-white shrink-0" />
        <h2 className="text-sm font-semibold tracking-wide uppercase text-muted truncate">My Tasks</h2>
        <span className="text-[11px] bg-white/[0.08] text-foreground px-2 py-0.5 rounded-full font-medium border border-border">{activeCount}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onAdd}
          className="text-[11px] px-3 py-1.5 rounded-lg border border-border bg-card text-foreground hover:bg-card-hover cursor-pointer transition-colors font-medium"
        >
          Add
        </button>
        <Link href="/my-todos" className="text-[11px] text-muted hover:text-white transition-colors whitespace-nowrap">
          Full list →
        </Link>
      </div>
    </div>
  );
}

function TeamColumnHeader({ activeCount, onAdd }: { activeCount: number; onAdd: () => void }) {
  return (
    <div className="flex items-center justify-between mb-2 gap-3 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-2 h-2 rounded-full bg-muted shrink-0" />
        <h2 className="text-sm font-semibold tracking-wide uppercase text-muted truncate">Team Tasks</h2>
        <span className="text-[11px] bg-white/[0.06] text-muted px-2 py-0.5 rounded-full font-medium border border-border">{activeCount}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onAdd}
          className="text-[11px] px-3 py-1.5 rounded-lg border border-border bg-card text-foreground hover:bg-card-hover cursor-pointer transition-colors font-medium"
        >
          Add
        </button>
        <Link href="/team-todos" className="text-[11px] text-muted hover:text-white transition-colors whitespace-nowrap">
          Full list →
        </Link>
      </div>
    </div>
  );
}

function EmptyColumn({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted">
      <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24" className="mb-3 opacity-30">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M12 8v8M8 12h8" />
      </svg>
      <p className="text-sm text-center px-4">Take a team task or add personal tasks with Add.</p>
      <p className="text-xs mt-3 opacity-70">No {label} yet</p>
    </div>
  );
}

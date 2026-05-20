"use client";

import { TodoCard } from "@/app/components/todos/todo-card";
import Link from "next/link";

interface Todo {
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
}

interface BoardViewProps {
  myTodos: Todo[];
  teamTodos: Todo[];
  memberCount: number;
  userId: string;
}

export function BoardView({ myTodos, teamTodos, memberCount }: BoardViewProps) {
  const myActive = myTodos.filter((t) => !t.isCompleted);
  const myDone = myTodos.filter((t) => t.isCompleted);
  const teamActive = teamTodos.filter((t) => !t.isCompleted);
  const teamDone = teamTodos.filter((t) => t.isCompleted);

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Board</h1>
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="bg-surface px-3 py-1.5 rounded-lg border border-border">
            {memberCount} members
          </span>
          <span className="bg-surface px-3 py-1.5 rounded-lg border border-border">
            {myTodos.length + teamTodos.length} total tasks
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 h-[calc(100%-4rem)]">
        {/* MY TASKS COLUMN */}
        <div className="bg-surface rounded-2xl border border-border p-4 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <h2 className="text-sm font-bold tracking-wide uppercase text-muted">My Tasks</h2>
              <span className="text-[11px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-semibold">
                {myActive.length}
              </span>
            </div>
            <Link
              href="/my-todos"
              className="text-[11px] text-muted hover:text-primary transition-colors"
            >
              View all →
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {myActive.length === 0 && myDone.length === 0 ? (
              <EmptyColumn label="personal" href="/my-todos" />
            ) : (
              <>
                {myActive.map((todo) => (
                  <TodoCard key={todo.id} todo={todo} canDelete={false} />
                ))}
                {myDone.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 pt-3 pb-1">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-[10px] text-muted uppercase tracking-wider">
                        Completed ({myDone.length})
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    {myDone.map((todo) => (
                      <TodoCard key={todo.id} todo={todo} canDelete={false} />
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* TEAM TASKS COLUMN */}
        <div className="bg-surface rounded-2xl border border-border p-4 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <h2 className="text-sm font-bold tracking-wide uppercase text-muted">Team Tasks</h2>
              <span className="text-[11px] bg-accent/15 text-accent px-2 py-0.5 rounded-full font-semibold">
                {teamActive.length}
              </span>
            </div>
            <Link
              href="/team-todos"
              className="text-[11px] text-muted hover:text-accent transition-colors"
            >
              View all →
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {teamActive.length === 0 && teamDone.length === 0 ? (
              <EmptyColumn label="team" href="/team-todos" />
            ) : (
              <>
                {teamActive.map((todo) => (
                  <TodoCard key={todo.id} todo={todo} canDelete={false} showCreator />
                ))}
                {teamDone.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 pt-3 pb-1">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-[10px] text-muted uppercase tracking-wider">
                        Completed ({teamDone.length})
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    {teamDone.map((todo) => (
                      <TodoCard key={todo.id} todo={todo} canDelete={false} showCreator />
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyColumn({ label, href }: { label: string; href: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted">
      <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24" className="mb-3 opacity-30">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M12 8v8M8 12h8" />
      </svg>
      <p className="text-sm">No {label} tasks yet</p>
      <Link href={href} className="text-xs text-primary mt-2 hover:underline">
        Create one →
      </Link>
    </div>
  );
}
